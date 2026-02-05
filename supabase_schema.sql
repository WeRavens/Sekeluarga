-- Create Users Table
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Note: In a real prod app, use Supabase Auth! This is for demo compatibility.
    "fullName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' NOT NULL,
    followers TEXT[] DEFAULT '{}' NOT NULL,
    following TEXT[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Posts Table
CREATE TABLE public.posts (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES public.users(id),
    "imageUrl" TEXT NOT NULL,
    caption TEXT,
    created_at BIGINT NOT NULL -- We store timestamp as number to match existing app types
);

-- Create Comments Table
CREATE TABLE public.comments (
    id TEXT PRIMARY KEY,
    "postId" TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES public.users(id),
    text TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

-- Create Likes Table (Many-to-Many relationship)
CREATE TABLE public.post_likes (
    "postId" TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    PRIMARY KEY ("postId", "userId")
);

-- Enable Row Level Security (RLS) - Optional for now but good practice
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Allow public access for this demo (Simulating the open nature of the previous local storage)
CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public profiles are insertable by everyone" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public profiles are updateable by everyone" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Public profiles are deletable by everyone" ON public.users FOR DELETE USING (true);

CREATE POLICY "Public posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Public posts are insertable by everyone" ON public.posts FOR INSERT WITH CHECK (true); 
CREATE POLICY "Public posts are updateable by everyone" ON public.posts FOR UPDATE USING (true); 
CREATE POLICY "Public posts are deletable by everyone" ON public.posts FOR DELETE USING (true);

CREATE POLICY "Public comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public comments are insertable by everyone" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public comments are deletable by everyone" ON public.comments FOR DELETE USING (true);

CREATE POLICY "Public likes are viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Public likes are insertable by everyone" ON public.post_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public likes are deletable by everyone" ON public.post_likes FOR DELETE USING (true);
