package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/gorm"

	"github.com/RenzIP/Graphic-Diagram-Online/config"
	"github.com/RenzIP/Graphic-Diagram-Online/db"
)

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	cfg := config.Load()
	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to Supabase/PostgreSQL: %v", err)
	}
	defer db.Disconnect(database)

	ctx := context.Background()
	switch os.Args[1] {
	case "setup":
		if err := database.WithContext(ctx).Exec(schemaSQL).Error; err != nil {
			log.Fatalf("Setup failed: %v", err)
		}
		fmt.Println("Setup complete.")
	case "seed":
		if err := runSeed(ctx, database); err != nil {
			log.Fatalf("Seed failed: %v", err)
		}
		fmt.Println("Seed complete.")
	case "drop":
		if err := database.WithContext(ctx).Exec(dropSQL).Error; err != nil {
			log.Fatalf("Drop failed: %v", err)
		}
		fmt.Println("Drop complete.")
	case "reset":
		if err := database.WithContext(ctx).Exec(dropSQL).Error; err != nil {
			log.Fatalf("Drop failed: %v", err)
		}
		if err := database.WithContext(ctx).Exec(schemaSQL).Error; err != nil {
			log.Fatalf("Setup failed: %v", err)
		}
		fmt.Println("Reset complete.")
	default:
		fmt.Printf("Unknown command: %s\n", os.Args[1])
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println(`Usage: go run ./cmd/migrate <command>

Commands:
  setup    Create tables and indexes
  seed     Insert seed data
  drop     Drop all managed tables (DESTRUCTIVE)
  reset    Drop all then re-create (DESTRUCTIVE)`)
}

func runSeed(ctx context.Context, database *gorm.DB) error {
	now := time.Now().UTC()
	if err := database.WithContext(ctx).Exec(`
		insert into user_profiles (id, username, password, role, email, full_name, avatar_url, created_at)
		values ('00000000-0000-0000-0000-000000000001', 'demo_user',
			'$2a$10$4E5HJ5XoNcbzM0nVOtZ8o.u1b.H2mpXmnxy1/B3rEgeJjwbZpwOhC', 'user',
			'demo@example.com', 'Demo User', null, ?)
		on conflict (id) do nothing
	`, now).Error; err != nil {
		return err
	}
	if err := database.WithContext(ctx).Exec(`
		insert into workspaces (id, name, slug, owner_id, description, created_at, updated_at)
		values ('00000000-0000-0000-0000-000000000010', 'Demo Workspace', 'demo-workspace',
			'00000000-0000-0000-0000-000000000001', 'Default workspace for demo', ?, ?)
		on conflict (id) do nothing
	`, now, now).Error; err != nil {
		return err
	}
	err := database.WithContext(ctx).Exec(`
		insert into workspace_members (workspace_id, user_id, role, joined_at)
		values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'owner', ?)
		on conflict (workspace_id, user_id) do nothing
	`, now).Error
	return err
}

const schemaSQL = `
create table if not exists user_profiles (
	id uuid primary key,
	username text not null,
	password text,
	email text,
	full_name text,
	avatar_url text,
	role text not null default 'user' check (role in ('admin', 'user')),
	created_at timestamptz not null default now()
);

alter table user_profiles add column if not exists username text;
alter table user_profiles add column if not exists password text;
alter table user_profiles add column if not exists role text not null default 'user';
alter table user_profiles add column if not exists email text;
alter table user_profiles add column if not exists full_name text;
alter table user_profiles add column if not exists avatar_url text;
do $$
begin
	if exists (
		select 1
		from information_schema.columns
		where table_name = 'user_profiles'
			and column_name = 'password_hash'
	) then
		update user_profiles set password = password_hash where password is null;
		alter table user_profiles drop column password_hash;
	end if;
end $$;
update user_profiles set username = coalesce(nullif(username, ''), split_part(email, '@', 1), 'user_' || replace(id::text, '-', ''));
alter table user_profiles drop constraint if exists user_profiles_role_check;
alter table user_profiles add constraint user_profiles_role_check check (role in ('admin', 'user'));
alter table user_profiles alter column username set not null;
create unique index if not exists idx_user_profiles_username on user_profiles(username);

create table if not exists workspaces (
	id uuid primary key,
	name text not null,
	slug text not null unique,
	owner_id uuid not null references user_profiles(id) on delete cascade,
	description text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists workspace_members (
	workspace_id uuid not null references workspaces(id) on delete cascade,
	user_id uuid not null references user_profiles(id) on delete cascade,
	role text not null check (role in ('owner', 'editor', 'viewer')),
	joined_at timestamptz not null default now(),
	primary key (workspace_id, user_id)
);

create table if not exists projects (
	id uuid primary key,
	workspace_id uuid not null references workspaces(id) on delete cascade,
	name text not null,
	description text,
	created_by uuid references user_profiles(id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists documents (
	id uuid primary key,
	project_id uuid references projects(id) on delete set null,
	workspace_id uuid not null references workspaces(id) on delete cascade,
	title text not null,
	diagram_type text not null check (diagram_type in ('flowchart', 'erd', 'usecase')),
	content jsonb not null default '{"nodes":[],"edges":[]}'::jsonb,
	view jsonb not null default '{"positions":{},"styles":{},"routing":{}}'::jsonb,
	version integer not null default 1,
	created_by uuid references user_profiles(id) on delete set null,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists idx_workspace_members_user_id on workspace_members(user_id);
create index if not exists idx_user_profiles_email on user_profiles(email);
create index if not exists idx_projects_workspace_id on projects(workspace_id);
create index if not exists idx_documents_project_id on documents(project_id);
create index if not exists idx_documents_workspace_id on documents(workspace_id);
create index if not exists idx_documents_created_by on documents(created_by);
create index if not exists idx_documents_updated_at on documents(updated_at desc);
create index if not exists idx_documents_diagram_type on documents(diagram_type);
`

const dropSQL = `
drop table if exists documents cascade;
drop table if exists projects cascade;
drop table if exists workspace_members cascade;
drop table if exists workspaces cascade;
drop table if exists user_profiles cascade;
`
