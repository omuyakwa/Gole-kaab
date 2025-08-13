ALTER TABLE public.profiles
ADD COLUMN font_size TEXT DEFAULT 'default' CHECK (font_size IN ('default', 'large', 'extra-large')),
ADD COLUMN high_contrast BOOLEAN DEFAULT FALSE;
