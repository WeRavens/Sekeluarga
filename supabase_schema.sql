-- Idempotent Supabase schema for Sekeluarga

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tables
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- demo only
    "fullName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' NOT NULL,
    followers TEXT[] DEFAULT '{}' NOT NULL,
    following TEXT[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    caption TEXT,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.post_likes (
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    PRIMARY KEY ("postId", "userId")
);

CREATE TABLE IF NOT EXISTS public.saved_posts (
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY ("postId", "userId")
);

CREATE TABLE IF NOT EXISTS public.post_tags (
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY ("postId", "userId")
);

-- Foreign Keys (drop + recreate to avoid duplicates)
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_userId_fkey;
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_userid_fkey;
ALTER TABLE public.posts
  ADD CONSTRAINT posts_userId_fkey
  FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_postId_fkey;
ALTER TABLE public.comments
  ADD CONSTRAINT comments_postId_fkey
  FOREIGN KEY ("postId") REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_userId_fkey;
ALTER TABLE public.comments
  ADD CONSTRAINT comments_userId_fkey
  FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.post_likes DROP CONSTRAINT IF EXISTS post_likes_postId_fkey;
ALTER TABLE public.post_likes
  ADD CONSTRAINT post_likes_postId_fkey
  FOREIGN KEY ("postId") REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.post_likes DROP CONSTRAINT IF EXISTS post_likes_userId_fkey;
ALTER TABLE public.post_likes
  ADD CONSTRAINT post_likes_userId_fkey
  FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.saved_posts DROP CONSTRAINT IF EXISTS saved_posts_postId_fkey;
ALTER TABLE public.saved_posts
  ADD CONSTRAINT saved_posts_postId_fkey
  FOREIGN KEY ("postId") REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.saved_posts DROP CONSTRAINT IF EXISTS saved_posts_userId_fkey;
ALTER TABLE public.saved_posts
  ADD CONSTRAINT saved_posts_userId_fkey
  FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.post_tags DROP CONSTRAINT IF EXISTS post_tags_postId_fkey;
ALTER TABLE public.post_tags
  ADD CONSTRAINT post_tags_postId_fkey
  FOREIGN KEY ("postId") REFERENCES public.posts(id) ON DELETE CASCADE;

ALTER TABLE public.post_tags DROP CONSTRAINT IF EXISTS post_tags_userId_fkey;
ALTER TABLE public.post_tags
  ADD CONSTRAINT post_tags_userId_fkey
  FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent via drop + create)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public profiles are insertable by everyone" ON public.users;
CREATE POLICY "Public profiles are insertable by everyone" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public profiles are updateable by everyone" ON public.users;
CREATE POLICY "Public profiles are updateable by everyone" ON public.users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public profiles are deletable by everyone" ON public.users;
CREATE POLICY "Public profiles are deletable by everyone" ON public.users FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
CREATE POLICY "Public posts are viewable by everyone" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public posts are insertable by everyone" ON public.posts;
CREATE POLICY "Public posts are insertable by everyone" ON public.posts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public posts are updateable by everyone" ON public.posts;
CREATE POLICY "Public posts are updateable by everyone" ON public.posts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public posts are deletable by everyone" ON public.posts;
CREATE POLICY "Public posts are deletable by everyone" ON public.posts FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public comments are viewable by everyone" ON public.comments;
CREATE POLICY "Public comments are viewable by everyone" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public comments are insertable by everyone" ON public.comments;
CREATE POLICY "Public comments are insertable by everyone" ON public.comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public comments are deletable by everyone" ON public.comments;
CREATE POLICY "Public comments are deletable by everyone" ON public.comments FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public likes are viewable by everyone" ON public.post_likes;
CREATE POLICY "Public likes are viewable by everyone" ON public.post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public likes are insertable by everyone" ON public.post_likes;
CREATE POLICY "Public likes are insertable by everyone" ON public.post_likes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public likes are deletable by everyone" ON public.post_likes;
CREATE POLICY "Public likes are deletable by everyone" ON public.post_likes FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public saved posts are viewable by everyone" ON public.saved_posts;
CREATE POLICY "Public saved posts are viewable by everyone" ON public.saved_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public saved posts are insertable by everyone" ON public.saved_posts;
CREATE POLICY "Public saved posts are insertable by everyone" ON public.saved_posts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public saved posts are deletable by everyone" ON public.saved_posts;
CREATE POLICY "Public saved posts are deletable by everyone" ON public.saved_posts FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public post tags are viewable by everyone" ON public.post_tags;
CREATE POLICY "Public post tags are viewable by everyone" ON public.post_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public post tags are insertable by everyone" ON public.post_tags;
CREATE POLICY "Public post tags are insertable by everyone" ON public.post_tags FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public post tags are deletable by everyone" ON public.post_tags;
CREATE POLICY "Public post tags are deletable by everyone" ON public.post_tags FOR DELETE USING (true);

-- Optional seed users (safe to re-run)
INSERT INTO public.users (id, username, password, "fullName", "avatarUrl", bio, role)
VALUES
  ('admin', 'admin', 'adminpassword', 'Administrator', 'https://ui-avatars.com/api/?name=Admin&background=000000&color=ffffff', 'System Administrator', 'admin'),
  ('u1', 'mom', 'password', 'Ibu', 'https://ui-avatars.com/api/?name=Ibu&background=e91e63&color=ffffff', 'Ibu dari keluarga ini', 'user'),
  ('u2', 'dad', 'password', 'Ayah', 'https://ui-avatars.com/api/?name=Ayah&background=2196f3&color=ffffff', 'Kepala keluarga', 'user'),
  ('u3', 'sister', 'password', 'Kakak', 'https://ui-avatars.com/api/?name=Kakak&background=9c27b0&color=ffffff', 'Anak pertama', 'user'),
  ('u4', 'brother', 'password', 'Adik', 'https://ui-avatars.com/api/?name=Adik&background=ff9800&color=ffffff', 'Anak kedua', 'user')
ON CONFLICT (id) DO NOTHING;
