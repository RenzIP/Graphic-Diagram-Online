alter table user_profiles add column if not exists username text;
alter table user_profiles add column if not exists password text;
alter table user_profiles add column if not exists role text not null default 'user';

update user_profiles set username = coalesce(nullif(username, ''), split_part(email, '@', 1), 'user_' || replace(id::text, '-', ''));

alter table user_profiles drop constraint if exists user_profiles_role_check;
alter table user_profiles add constraint user_profiles_role_check check (role in ('admin', 'user'));
alter table user_profiles alter column username set not null;

create unique index if not exists idx_user_profiles_username on user_profiles(username);
create index if not exists idx_user_profiles_email on user_profiles(email);
