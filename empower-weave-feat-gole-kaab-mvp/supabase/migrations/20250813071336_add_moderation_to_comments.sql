ALTER TABLE public.comments
ADD COLUMN is_flagged BOOLEAN DEFAULT FALSE,
ADD COLUMN moderation_reason TEXT;
