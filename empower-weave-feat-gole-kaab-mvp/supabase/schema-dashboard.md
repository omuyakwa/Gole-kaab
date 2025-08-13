# Gole Kaab - Dashboard Schema & Functions

This document outlines the database functions (RPCs) required to efficiently fetch data for the dashboard.

## 1. `get_dashboard_stats` Function

This function aggregates key statistics for the main dashboard view.

**Returns:** A single JSON object with the following keys:
- `total_posts`: Total number of posts.
- `total_comments`: Total number of comments.
- `active_users`: Count of distinct users who have created at least one post or comment.

### SQL for `get_dashboard_stats` function:
```sql
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json
LANGUAGE sql
AS $$
  SELECT json_build_object(
    'total_posts', (SELECT count(*) FROM public.posts),
    'total_comments', (SELECT count(*) FROM public.comments),
    'active_users', (SELECT count(DISTINCT user_id) FROM (
      SELECT user_id FROM public.posts
      UNION
      SELECT user_id FROM public.comments
    ) as active_users)
  );
$$;
```

## 2. `get_posts_per_day` Function

This function provides time series data for the number of posts created per day over the last 30 days.

**Returns:** A JSON array of objects, each with:
- `date`: The date (formatted as `YYYY-MM-DD`).
- `count`: The number of posts created on that date.

### SQL for `get_posts_per_day` function:
```sql
CREATE OR REPLACE FUNCTION get_posts_per_day()
RETURNS TABLE(day date, count bigint)
LANGUAGE sql
AS $$
  SELECT
    date_trunc('day', created_at)::date as day,
    count(*) as count
  FROM
    public.posts
  WHERE
    created_at >= now() - interval '30 days'
  GROUP BY
    day
  ORDER BY
    day;
$$;
```

These functions can be created in the Supabase SQL Editor. They provide efficient endpoints for the frontend to call via `supabase.rpc()` to populate the dashboard without needing to download and process large amounts of raw data on the client.
