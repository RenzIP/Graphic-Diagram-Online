alter table user_profiles add column if not exists password text;

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
alter table user_profiles alter column username set not null;

drop index if exists idx_user_profiles_username;
create unique index if not exists idx_user_profiles_username on user_profiles(username);
