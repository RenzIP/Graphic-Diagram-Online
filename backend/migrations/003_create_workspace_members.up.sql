-- 003_create_workspace_members.up.sql

CREATE TABLE IF NOT EXISTS workspace_members (
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role         TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
    joined_at    TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (workspace_id, user_id)
);

CREATE INDEX idx_wm_user           ON workspace_members (user_id);
CREATE INDEX idx_wm_workspace_role ON workspace_members (workspace_id, role);
