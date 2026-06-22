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
