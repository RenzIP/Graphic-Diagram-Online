-- GraDiOl Database Schema
-- Matches frontend API contract exactly

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    member_count INT NOT NULL DEFAULT 1
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    document_count INT NOT NULL DEFAULT 0
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled',
    diagram_type TEXT NOT NULL DEFAULT 'flowchart',
    content JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}',
    view JSONB NOT NULL DEFAULT '{"positions":{},"styles":{},"routing":{}}',
    version INT NOT NULL DEFAULT 1,
    created_by TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
