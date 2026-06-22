alter table user_profiles add column if not exists password_hash text;
update user_profiles set password_hash = password where password_hash is null;
alter table user_profiles drop column if exists password;

drop index if exists idx_user_profiles_username;
create unique index if not exists idx_user_profiles_username on user_profiles(username) where username is not null;
