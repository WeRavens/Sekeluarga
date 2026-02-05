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

  // Keep payloads aligned with DB columns and avoid undefined fields.
  toDbUser: (user: User) => {
    const payload: Partial<User> = {
      id: user.id,
      username: user.username,
      password: user.password,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role || 'user',
      followers: user.followers,
      following: user.following,
    };

    Object.keys(payload).forEach((key) => {
      const k = key as keyof typeof payload;
      if (payload[k] === undefined) delete payload[k];
    });

    return payload;
  },

  getUserById: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error('Error fetching user by id:', error);
      return null;
    }
    return data;
  },

  createUser: async (user: User): Promise<boolean> => {
    // Ensure role exists in payload, default to user
    const userWithRole = dbService.toDbUser({ ...user, role: user.role || 'user' });
    const { error } = await supabase.from('users').insert([userWithRole]);
    if (error) {
      console.error('Error creating user:', error);
      return false;
    }
    return true;
  },

  updateUser: async (user: User): Promise<boolean> => {
    const updatePayload = dbService.toDbUser(user);
    const { error } = await supabase.from('users').update(updatePayload).eq('id', user.id);
    if (error) {
      console.error('Error updating user', error);
      return false;
    }
    return true;
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      console.error('Error deleting user', error);
      return false;
    }
    return true;
  },

  getUserByUsername: async (username: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('username', username).maybeSingle();
    if (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
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
      const { error } = await supabase
        .from('users')
        .update({ following: [...followerFollowing, targetId] })
        .eq('id', followerId);
      if (error) {
        console.error('Error following user (following update)', error);
        return false;
      }
    }
    if (!targetFollowers.includes(followerId)) {
      const { error } = await supabase
        .from('users')
        .update({ followers: [...targetFollowers, followerId] })
        .eq('id', targetId);
      if (error) {
        console.error('Error following user (followers update)', error);
        return false;
      }
    }
    return true;
  },

  unfollowUser: async (followerId: string, targetId: string): Promise<boolean> => {
    const follower = await dbService.getUserById(followerId);
    const target = await dbService.getUserById(targetId);

    if (!follower || !target) return false;

    const followerFollowing = (follower.following || []).filter(id => id !== targetId);
    const targetFollowers = (target.followers || []).filter(id => id !== followerId);

    const { error: followerError } = await supabase
      .from('users')
      .update({ following: followerFollowing })
      .eq('id', followerId);
    if (followerError) {
      console.error('Error unfollowing user (following update)', followerError);
      return false;
    }

    const { error: targetError } = await supabase
      .from('users')
      .update({ followers: targetFollowers })
      .eq('id', targetId);
    if (targetError) {
      console.error('Error unfollowing user (followers update)', targetError);
      return false;
    }

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
    return posts.map((p: any) => {
      const postLikes = Array.isArray(p.post_likes) ? p.post_likes : [];
      const postComments = Array.isArray(p.comments) ? p.comments : [];

      return {
        id: p.id,
        userId: p.userId,
        username: p.users?.username || 'Unknown',
        userAvatar: p.users?.avatarUrl,
        imageUrl: p.imageUrl,
        caption: p.caption,
        createdAt: Number(p.created_at), // Convert BigInt/String to number
        likes: postLikes.map((pl: any) => pl.userId),
        comments: postComments.map((c: any) => ({
          id: c.id,
          postId: p.id,
          userId: c.userId,
          username: c.users?.username || 'Unknown',
          text: c.text,
          createdAt: Number(c.created_at)
        }))
      };
    });
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
      console.error('Error deleting post', error);
      return false;
    }
    return true;
  },

  toggleLike: async (postId: string, userId: string): Promise<void> => {
    // Check if like exists
    const { data, error } = await supabase
      .from('post_likes')
      .select('*')
      .eq('postId', postId)
      .eq('userId', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking like:', error);
    }

    if (data) {
      // Unlike
      const { error: deleteError } = await supabase.from('post_likes').delete().eq('postId', postId).eq('userId', userId);
      if (deleteError) console.error('Error unliking post:', deleteError);
    } else {
      // Like
      const { error: insertError } = await supabase.from('post_likes').insert([{ postId, userId }]);
      if (insertError) console.error('Error liking post:', insertError);
    }
  },

  addComment: async (comment: Comment): Promise<void> => {
    const { error } = await supabase.from('comments').insert([{
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      text: comment.text,
      created_at: comment.createdAt
    }]);
    if (error) console.error('Error adding comment:', error);
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
