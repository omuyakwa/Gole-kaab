CREATE TABLE public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user'))
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins to read all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
);

CREATE POLICY "Allow users to read their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 'anon';
  END IF;
  RETURN (SELECT role FROM public.user_roles WHERE user_id = auth.uid());
END;
$$;

-- Seed a default admin user
-- This is for development purposes only.
-- In a real application, you would have a secure way to assign admin roles.
-- Replace the user_id with the actual user_id of the user you want to make an admin.
-- You can get the user_id from the Supabase dashboard or by signing up a new user and checking the auth.users table.
-- For now, I will use a placeholder. I will need to figure out how to get a real user_id later.
-- INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-000000000000', 'admin');
