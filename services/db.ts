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
    const { error } = await supabase
      .from('users')
      .upsert(updatePayload, { onConflict: 'id' });
    if (error) {
      console.error('Error updating user', error);
      return false;
    }
    return true;
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      // 1) Fetch user's posts to remove images from storage
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, imageUrl')
        .eq('userId', userId);
      if (postsError) {
        console.error('Error fetching user posts before delete', postsError);
      }

      const imagePaths = (posts || [])
        .map((p: any) => dbService.getStoragePathFromUrl(p.imageUrl))
        .filter((p: string | null) => !!p) as string[];

      if (imagePaths.length > 0) {
        const { error: storageError } = await supabase.storage.from('images').remove(imagePaths);
        if (storageError) {
          console.error('Error deleting user images from storage', storageError);
        }
      }

      // 2) Delete all related rows by user
      const { error: commentsError } = await supabase.from('comments').delete().eq('userId', userId);
      if (commentsError) {
        console.error('Error deleting user comments', commentsError);
        return false;
      }

      const { error: likesError } = await supabase.from('post_likes').delete().eq('userId', userId);
      if (likesError) {
        console.error('Error deleting user likes', likesError);
        return false;
      }

      const { error: savedError } = await supabase.from('saved_posts').delete().eq('userId', userId);
      if (savedError) {
        console.error('Error deleting user saved posts', savedError);
        return false;
      }

      const { error: tagsError } = await supabase.from('post_tags').delete().eq('userId', userId);
      if (tagsError) {
        console.error('Error deleting user tags', tagsError);
        return false;
      }

      // 3) Delete user's posts (also removes comments/likes via FK if cascades exist)
      const { error: deletePostsError } = await supabase.from('posts').delete().eq('userId', userId);
      if (deletePostsError) {
        console.error('Error deleting user posts', deletePostsError);
        return false;
      }

      // 4) Delete the user
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) {
        console.error('Error deleting user', error);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error deleting user and related data', e);
      return false;
    }
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
        users!posts_userId_fkey (username, avatarUrl),
        comments!comments_postId_fkey (
          id, text, userId, created_at,
          users!comments_userId_fkey (username, avatarUrl)
        ),
        post_likes!post_likes_postId_fkey (userId)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
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
          avatarUrl: c.users?.avatarUrl,
          text: c.text,
          createdAt: Number(c.created_at)
        }))
      };
    });
  },

  getSavedPostIds: async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase.from('saved_posts').select('postId').eq('userId', userId);
    if (error) {
      console.error('Error fetching saved posts:', error);
      return [];
    }
    return (data || []).map((d: any) => d.postId);
  },

  savePost: async (userId: string, postId: string): Promise<boolean> => {
    const { error } = await supabase.from('saved_posts').insert([{ userId, postId }]);
    if (error) {
      console.error('Error saving post:', error);
      return false;
    }
    return true;
  },

  unsavePost: async (userId: string, postId: string): Promise<boolean> => {
    const { error } = await supabase.from('saved_posts').delete().eq('userId', userId).eq('postId', postId);
    if (error) {
      console.error('Error unsaving post:', error);
      return false;
    }
    return true;
  },

  toggleSavePost: async (userId: string, postId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('saved_posts')
      .select('postId')
      .eq('userId', userId)
      .eq('postId', postId)
      .maybeSingle();

    if (data) {
      return dbService.unsavePost(userId, postId);
    }
    return dbService.savePost(userId, postId);
  },

  getTaggedPostIds: async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase.from('post_tags').select('postId').eq('userId', userId);
    if (error) {
      console.error('Error fetching tagged posts:', error);
      return [];
    }
    return (data || []).map((d: any) => d.postId);
  },

  tagUserOnPost: async (postId: string, userId: string): Promise<boolean> => {
    const { error } = await supabase.from('post_tags').insert([{ postId, userId }]);
    if (error) {
      console.error('Error tagging user on post:', error);
      return false;
    }
    return true;
  },

  untagUserOnPost: async (postId: string, userId: string): Promise<boolean> => {
    const { error } = await supabase.from('post_tags').delete().eq('postId', postId).eq('userId', userId);
    if (error) {
      console.error('Error untagging user on post:', error);
      return false;
    }
    return true;
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

  deletePost: async (postId: string, imageUrl?: string): Promise<boolean> => {
    // Remove file from storage if it's our bucket URL
    if (imageUrl) {
      const path = dbService.getStoragePathFromUrl(imageUrl);
      if (path) {
        const { error: storageError } = await supabase.storage.from('images').remove([path]);
        if (storageError) {
          console.error('Error deleting image from storage', storageError);
          // continue; we still attempt to delete post metadata
        }
      }
    }

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

  deleteComment: async (commentId: string): Promise<boolean> => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
    return true;
  },

  getStoragePathFromUrl: (url: string): string | null => {
    try {
      const marker = '/storage/v1/object/public/images/';
      if (!url.includes(marker)) return null;
      const path = url.split(marker)[1];
      return path || null;
    } catch {
      return null;
    }
  },

  // Storage (Image Upload)
  uploadImage: async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fileName = `${unique}.${fileExt}`;
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
