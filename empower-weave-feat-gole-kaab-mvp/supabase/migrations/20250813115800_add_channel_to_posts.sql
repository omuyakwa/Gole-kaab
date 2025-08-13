ALTER TABLE public.posts
ADD COLUMN channel TEXT DEFAULT 'general' NOT NULL CHECK (channel IN ('general', 'youth-forum', 'womens-initiatives', 'disability-rights', 'research-policy'));
