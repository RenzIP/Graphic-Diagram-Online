package middleware

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strings"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/RenzIP/Graphic-Diagram-Online/internal/pkg"
)

// jwksCache caches the ECDSA public keys fetched from Supabase JWKS endpoint.
var (
	jwksKeys  map[string]*ecdsa.PublicKey
	jwksOnce  sync.Once
	jwksMutex sync.RWMutex
)

// jwksJSON represents the JWKS response structure.
type jwksJSON struct {
	Keys []jwkKey `json:"keys"`
}

type jwkKey struct {
	Kty string `json:"kty"`
	Kid string `json:"kid"`
	Crv string `json:"crv"`
	X   string `json:"x"`
	Y   string `json:"y"`
	Alg string `json:"alg"`
	Use string `json:"use"`
}

// fetchJWKS fetches and caches ECDSA public keys from the Supabase JWKS endpoint.
func fetchJWKS(supabaseURL string) {
	jwksURL := strings.TrimRight(supabaseURL, "/") + "/auth/v1/.well-known/jwks.json"
	log.Printf("[Auth] Fetching JWKS from: %s", jwksURL)

	resp, err := http.Get(jwksURL)
	if err != nil {
		log.Printf("[Auth] Failed to fetch JWKS: %v", err)
		return
	}
	defer resp.Body.Close()

	var jwks jwksJSON
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		log.Printf("[Auth] Failed to decode JWKS: %v", err)
		return
	}

	keys := make(map[string]*ecdsa.PublicKey)
	for _, k := range jwks.Keys {
		if k.Kty != "EC" || k.Crv != "P-256" {
			continue
		}

		xBytes, err := base64.RawURLEncoding.DecodeString(k.X)
		if err != nil {
			log.Printf("[Auth] Failed to decode JWKS X for kid=%s: %v", k.Kid, err)
			continue
		}
		yBytes, err := base64.RawURLEncoding.DecodeString(k.Y)
		if err != nil {
			log.Printf("[Auth] Failed to decode JWKS Y for kid=%s: %v", k.Kid, err)
			continue
		}

		pubKey := &ecdsa.PublicKey{
			Curve: elliptic.P256(),
			X:     new(big.Int).SetBytes(xBytes),
			Y:     new(big.Int).SetBytes(yBytes),
		}
		keys[k.Kid] = pubKey
		log.Printf("[Auth] Loaded JWKS key kid=%s alg=%s", k.Kid, k.Alg)
	}

	jwksMutex.Lock()
	jwksKeys = keys
	jwksMutex.Unlock()
	log.Printf("[Auth] JWKS loaded: %d EC keys", len(keys))
}

// getJWKSKey returns the ECDSA public key for the given kid.
func getJWKSKey(kid string) *ecdsa.PublicKey {
	jwksMutex.RLock()
	defer jwksMutex.RUnlock()
	if jwksKeys == nil {
		return nil
	}
	return jwksKeys[kid]
}

// Auth returns a Fiber middleware that validates Supabase JWT tokens.
// Supports both HS256 (legacy JWT secret) and ES256 (new JWKS-based signing).
// On success, it sets ctx.Locals("userId") to the UUID from the `sub` claim.
func Auth(jwtSecret string, supabaseURL string) fiber.Handler {
	// Fetch JWKS on first middleware creation (cold start)
	if supabaseURL != "" {
		jwksOnce.Do(func() {
			fetchJWKS(supabaseURL)
		})
	}

	return func(c *fiber.Ctx) error {
		// Extract the Bearer token from the Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return pkg.WriteError(c, pkg.ErrUnauthorized.WithMessage("missing Authorization header"))
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return pkg.WriteError(c, pkg.ErrUnauthorized.WithMessage("invalid Authorization header format"))
		}
		tokenStr := parts[1]

		// Parse and validate the JWT — supports HS256 and ES256
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
			switch t.Method.(type) {
			case *jwt.SigningMethodHMAC:
				// HS256 — use the shared secret
				if jwtSecret == "" {
					return nil, fmt.Errorf("HS256 token but no JWT secret configured")
				}
				return []byte(jwtSecret), nil

			case *jwt.SigningMethodECDSA:
				// ES256 — get public key from JWKS by kid
				kid, _ := t.Header["kid"].(string)
				if kid == "" {
					return nil, fmt.Errorf("ES256 token missing kid header")
				}
				pubKey := getJWKSKey(kid)
				if pubKey == nil {
					// Try re-fetching JWKS (key rotation)
					if supabaseURL != "" {
						fetchJWKS(supabaseURL)
						pubKey = getJWKSKey(kid)
					}
					if pubKey == nil {
						return nil, fmt.Errorf("no JWKS key found for kid=%s", kid)
					}
				}
				return pubKey, nil

			default:
				return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
			}
		})
		if err != nil || !token.Valid {
			log.Printf("[Auth] JWT validation failed: %v (token prefix: %.20s...)", err, tokenStr)
			return pkg.WriteError(c, pkg.ErrUnauthorized.WithMessage("invalid or expired token"))
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return pkg.WriteError(c, pkg.ErrUnauthorized.WithMessage("invalid token claims"))
		}

		// Extract user ID from the `sub` claim (Supabase auth.uid())
		sub, ok := claims["sub"].(string)
		if !ok || sub == "" {
			return pkg.WriteError(c, pkg.ErrUnauthorized.WithMessage("missing sub claim in token"))
		}

		userID, err := uuid.Parse(sub)
		if err != nil {
			return pkg.WriteError(c, pkg.ErrUnauthorized.WithMessage("invalid user ID in token"))
		}

		// Set user context for downstream handlers
		c.Locals("userId", userID)

		// Optionally extract email if present
		if email, ok := claims["email"].(string); ok {
			c.Locals("email", email)
		}

		return c.Next()
	}
}

// GetUserID extracts the authenticated user's UUID from ctx.Locals.
// Returns uuid.Nil if not set (should not happen behind Auth middleware).
func GetUserID(c *fiber.Ctx) uuid.UUID {
	if id, ok := c.Locals("userId").(uuid.UUID); ok {
		return id
	}
	return uuid.Nil
}
