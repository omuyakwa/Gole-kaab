CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE(user_id UUID, email TEXT, role TEXT)
AS $$
BEGIN
  IF (SELECT public.get_user_role()) <> 'admin' THEN
    RAISE EXCEPTION 'Only admins can access this resource.';
  END IF;

  RETURN QUERY
  SELECT u.id, u.email, ur.role
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_all_uploads()
RETURNS TABLE(name TEXT, id UUID, updated_at TIMESTAMPTZ, created_at TIMESTAMPTZ, last_accessed_at TIMESTAMPTZ, metadata JSONB)
AS $$
BEGIN
  IF (SELECT public.get_user_role()) <> 'admin' THEN
    RAISE EXCEPTION 'Only admins can access this resource.';
  END IF;

  RETURN QUERY
  SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata
  FROM storage.objects o
  WHERE o.bucket_id = 'user_uploads';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_flagged_comments()
RETURNS SETOF public.comments
AS $$
BEGIN
  IF (SELECT public.get_user_role()) <> 'admin' THEN
    RAISE EXCEPTION 'Only admins can access this resource.';
  END IF;

  RETURN QUERY
  SELECT *
  FROM public.comments
  WHERE is_flagged = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
