-- 001_create_user_profiles.up.sql
-- User profiles table: extends Supabase auth.users

CREATE TABLE IF NOT EXISTS user_profiles (
    id         UUID PRIMARY KEY,  -- references auth.users(id) in Supabase
    full_name  TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on Supabase auth signup (trigger).
-- NOTE: This trigger references auth.users which only exists in Supabase.
-- Skip this in local development without Supabase.
-- CREATE OR REPLACE FUNCTION handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO user_profiles (id, full_name, avatar_url)
--   VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'avatar_url')
--   ON CONFLICT (id) DO NOTHING;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
--
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();
