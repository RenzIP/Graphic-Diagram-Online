package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type PresenceService struct {
	client *redis.Client
}

func NewPresenceService(client *redis.Client) *PresenceService {
	return &PresenceService{client: client}
}

func (s *PresenceService) SetPresence(ctx context.Context, roomID, userID, userName string) error {
	key := fmt.Sprintf("room:%s:users", roomID)
	return s.client.HSet(ctx, key, userID, userName).Err()
}

func (s *PresenceService) RemovePresence(ctx context.Context, roomID, userID string) error {
	key := fmt.Sprintf("room:%s:users", roomID)
	return s.client.HDel(ctx, key, userID).Err()
}

func (s *PresenceService) GetRoomUsers(ctx context.Context, roomID string) (map[string]string, error) {
	key := fmt.Sprintf("room:%s:users", roomID)
	return s.client.HGetAll(ctx, key).Result()
}

func (s *PresenceService) SetHeartbeat(ctx context.Context, roomID, userID string) error {
	key := fmt.Sprintf("room:%s:heartbeat:%s", roomID, userID)
	return s.client.Set(ctx, key, "1", 30*time.Second).Err()
}
