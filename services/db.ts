import { supabase } from './supabaseClient';
import { User, Post, Comment } from '../types';

// Helper to map Supabase rows to our types if needed
// For now we assume column names match (created_at differs, we need to map)

export const dbService = {
  // Users
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data || [];
  },

  getUserById: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },

  createUser: async (user: User): Promise<boolean> => {
    // Ensure role exists in payload, default to user
    const userWithRole = { ...user, role: user.role || 'user' };
    const { error } = await supabase.from('users').insert([userWithRole]);
    if (error) {
      console.error('Error creating user:', error);
      return false;
    }
    return true;
  },

  updateUser: async (user: User): Promise<boolean> => {
      const { error } = await supabase.from('users').update(user).eq('id', user.id);
      if (error) {
          console.error("Error updating user", error);
          return false;
      }
      return true;
  },

  deleteUser: async (userId: string): Promise<boolean> => {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) {
          console.error("Error deleting user", error);
          return false;
      }
      return true;
  },

  getUserByUsername: async (username: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
    if (error) return null;
    return data;
  },

  followUser: async (followerId: string, targetId: string): Promise<boolean> => {
    // Get both users
    const follower = await dbService.getUserById(followerId);
    const target = await dbService.getUserById(targetId);
    
    if (!follower || !target) return false;

    const followerFollowing = follower.following || [];
    const targetFollowers = target.followers || [];

    if (!followerFollowing.includes(targetId)) {
      await supabase.from('users').update({ following: [...followerFollowing, targetId] }).eq('id', followerId);
    }
    if (!targetFollowers.includes(followerId)) {
      await supabase.from('users').update({ followers: [...targetFollowers, followerId] }).eq('id', targetId);
    }
    return true;
  },

  unfollowUser: async (followerId: string, targetId: string): Promise<boolean> => {
    const follower = await dbService.getUserById(followerId);
    const target = await dbService.getUserById(targetId);
    
    if (!follower || !target) return false;

    const followerFollowing = (follower.following || []).filter(id => id !== targetId);
    const targetFollowers = (target.followers || []).filter(id => id !== followerId);

    await supabase.from('users').update({ following: followerFollowing }).eq('id', followerId);
    await supabase.from('users').update({ followers: targetFollowers }).eq('id', targetId);
    return true;
  },

  // Posts
  getPosts: async (): Promise<Post[]> => {
    // We need to join with users, comments, and likes
    // This is a bit complex in one query without some SQL views or join logic.
    // For simplicity, we fetch raw posts and then enrich them, or better, use Supabase relational queries.
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        users:userId (username, avatarUrl),
        comments (
          id, text, userId, created_at,
          users:userId (username)
        ),
        post_likes (userId)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    // Transform to our Front-end Post Model
    return posts.map((p: any) => ({
      id: p.id,
      userId: p.userId,
      username: p.users?.username || 'Unknown',
      userAvatar: p.users?.avatarUrl,
      imageUrl: p.imageUrl,
      caption: p.caption,
      createdAt: Number(p.created_at), // Convert BigInt/String to number
      likes: p.post_likes.map((pl: any) => pl.userId),
      comments: p.comments.map((c: any) => ({
        id: c.id,
        postId: p.id,
        userId: c.userId,
        username: c.users?.username || 'Unknown',
        text: c.text,
        createdAt: Number(c.created_at)
      }))
    }));
  },

  createPost: async (post: Post): Promise<boolean> => {
    // Insert Post
    const { error } = await supabase.from('posts').insert([{
      id: post.id,
      userId: post.userId,
      imageUrl: post.imageUrl,
      caption: post.caption,
      created_at: post.createdAt,
    }]);

    if (error) {
      console.error('Error creating post:', error);
      return false;
    }
    return true;
  },

  deletePost: async (postId: string): Promise<boolean> => {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) {
          console.error("Error deleting post", error);
          return false;
      }
      return true;
  },

  toggleLike: async (postId: string, userId: string): Promise<void> => {
    // Check if like exists
    const { data } = await supabase
      .from('post_likes')
      .select('*')
      .eq('postId', postId)
      .eq('userId', userId)
      .single();

    if (data) {
      // Unlike
      await supabase.from('post_likes').delete().eq('postId', postId).eq('userId', userId);
    } else {
      // Like
      await supabase.from('post_likes').insert([{ postId, userId }]);
    }
  },

  addComment: async (comment: Comment): Promise<void> => {
    await supabase.from('comments').insert([{
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      text: comment.text,
      created_at: comment.createdAt
    }]);
  },
  
  // Storage (Image Upload)
  uploadImage: async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  }
};
