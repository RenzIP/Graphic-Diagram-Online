drop index if exists idx_user_profiles_email;
drop index if exists idx_user_profiles_username;

alter table user_profiles drop constraint if exists user_profiles_role_check;
alter table user_profiles drop column if exists role;
alter table user_profiles drop column if exists password;
alter table user_profiles drop column if exists username;
