-- 005_create_documents.up.sql
-- Drop the old documents table (from legacy 0001_init.sql schema) and recreate
-- with the full spec-compliant schema including workspace_id, CHECK constraints, etc.

DROP TABLE IF EXISTS documents CASCADE;

CREATE TABLE documents (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id   UUID REFERENCES projects(id) ON DELETE SET NULL,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title        TEXT NOT NULL DEFAULT 'Untitled',
    diagram_type TEXT NOT NULL CHECK (diagram_type IN ('flowchart', 'erd', 'usecase')),
    content      JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}',
    view         JSONB NOT NULL DEFAULT '{"positions":{},"styles":{},"routing":{}}',
    version      INT NOT NULL DEFAULT 1 CHECK (version >= 1),
    created_by   UUID REFERENCES user_profiles(id),
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_project    ON documents (project_id);
CREATE INDEX IF NOT EXISTS idx_documents_workspace  ON documents (workspace_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents (created_by);
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_type       ON documents (diagram_type);
