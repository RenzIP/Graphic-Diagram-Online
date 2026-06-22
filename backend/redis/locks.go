package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type LockService struct {
	client *redis.Client
}

func NewLockService(client *redis.Client) *LockService {
	return &LockService{client: client}
}

// LockNode acquires a lock on a node for a specific user. Returns true if lock acquired.
func (s *LockService) LockNode(ctx context.Context, roomID, nodeID, userID string) (bool, error) {
	key := fmt.Sprintf("room:%s:lock:%s", roomID, nodeID)
	ok, err := s.client.SetNX(ctx, key, userID, 60*time.Second).Result()
	if err != nil {
		return false, err
	}
	return ok, nil
}

// UnlockNode releases a lock only if held by the specified user.
func (s *LockService) UnlockNode(ctx context.Context, roomID, nodeID, userID string) error {
	key := fmt.Sprintf("room:%s:lock:%s", roomID, nodeID)
	current, err := s.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return nil
	}
	if err != nil {
		return err
	}
	if current == userID {
		return s.client.Del(ctx, key).Err()
	}
	return nil
}

// IsNodeLocked checks if a node is locked and by whom.
func (s *LockService) IsNodeLocked(ctx context.Context, roomID, nodeID string) (bool, string, error) {
	key := fmt.Sprintf("room:%s:lock:%s", roomID, nodeID)
	userID, err := s.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return false, "", nil
	}
	if err != nil {
		return false, "", err
	}
	return true, userID, nil
}

// GetRoomLocks returns all locked nodes in a room.
func (s *LockService) GetRoomLocks(ctx context.Context, roomID string) (map[string]string, error) {
	pattern := fmt.Sprintf("room:%s:lock:*", roomID)
	locks := make(map[string]string)

	iter := s.client.Scan(ctx, 0, pattern, 100).Iterator()
	for iter.Next(ctx) {
		key := iter.Val()
		nodeID := key[len(fmt.Sprintf("room:%s:lock:", roomID)):]
		userID, err := s.client.Get(ctx, key).Result()
		if err == nil {
			locks[nodeID] = userID
		}
	}

	return locks, iter.Err()
}
