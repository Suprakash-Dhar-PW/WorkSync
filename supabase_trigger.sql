-- 1. DROP EXISTING TRIGGERS TO PREVENT CONFLICTS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. CREATE FUNCTION TO HANDLE NEW USERS
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'employee')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CREATE TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. ENSURE RLS DOESN'T BLOCK (Just in case, though Security Definer handles it)
-- Policies are already defined, but let's make sure the Profiles table is accessible.
-- The previous RLS policies for Profiles were:
-- SELECT: Users see own. Managers see employees.
-- INSERT: Users can insert own.
-- This trigger runs as Superuser (Security Definer), so it bypasses RLS.
