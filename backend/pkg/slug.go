package pkg

import sluglib "github.com/gosimple/slug"

// GenerateSlug converts a workspace name into a URL-safe slug.
// Example: "My Workspace" -> "my-workspace"
func GenerateSlug(name string) string {
	return sluglib.Make(name)
}
