-- seed.sql: minimal data for local development

-- 1. Seed user profile (matches a Supabase test user)
INSERT INTO user_profiles (id, full_name, avatar_url) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Dev User', NULL)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed workspace
INSERT INTO workspaces (id, name, slug, owner_id, description) VALUES
    ('00000000-0000-0000-0000-000000000010', 'My Workspace', 'my-workspace',
     '00000000-0000-0000-0000-000000000001', 'Default dev workspace')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed workspace membership (owner)
INSERT INTO workspace_members (workspace_id, user_id, role) VALUES
    ('00000000-0000-0000-0000-000000000010',
     '00000000-0000-0000-0000-000000000001', 'owner')
ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- 4. Seed project
INSERT INTO projects (id, workspace_id, name, description, created_by) VALUES
    ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000010',
     'Sample Project', 'A sample project for development',
     '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- 5. Seed document (flowchart with starter nodes)
INSERT INTO documents (id, project_id, workspace_id, title, diagram_type, content, view, created_by) VALUES
    ('00000000-0000-0000-0000-000000000030',
     '00000000-0000-0000-0000-000000000020',
     '00000000-0000-0000-0000-000000000010',
     'Sample Flowchart',
     'flowchart',
     '{"nodes":[{"id":"1","type":"start-end","label":"Start"},{"id":"2","type":"process","label":"Step 1"}],"edges":[{"id":"e1","source":"1","target":"2"}]}',
     '{"positions":{"1":{"x":100,"y":100},"2":{"x":100,"y":250}},"styles":{},"routing":{}}',
     '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
