CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE(post_count BIGINT, comment_count BIGINT)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.posts WHERE user_id = p_user_id) AS post_count,
    (SELECT COUNT(*) FROM public.comments WHERE user_id = p_user_id) AS comment_count;
END;
$$ LANGUAGE plpgsql;
