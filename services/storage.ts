import { User, Post, Comment } from '../types';

const USERS_KEY = 'famgram_v4_users';
const POSTS_KEY = 'famgram_v4_posts';
const CURRENT_USER_KEY = 'famgram_v4_current_user';

const initializeStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(POSTS_KEY)) {
    localStorage.setItem(POSTS_KEY, JSON.stringify([]));
  }
};

// Initialize immediately (no dummy data)
initializeStorage();

export const storageService = {
  getUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  getUserById: (id: string): User | undefined => {
    const users = storageService.getUsers();
    return users.find(u => u.id === id);
  },

  createUser: (user: User): void => {
    const users = storageService.getUsers();
    // Default to 'user' role if not specified
    if (!user.role) user.role = 'user';
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  updateUser: (updatedUser: User): void => {
    let users = storageService.getUsers();
    users = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Also update current session if it's the same user
    const currentUser = storageService.getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
      storageService.setCurrentUser(updatedUser);
    }
  },

  deleteUser: (userId: string): void => {
    let users = storageService.getUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Cleanup posts by this user
    let posts = storageService.getPosts();
    posts = posts.filter(p => p.userId !== userId);
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  },

  followUser: (followerId: string, targetId: string): void => {
    let users = storageService.getUsers();
    users = users.map(u => {
      if (u.id === followerId) {
        const following = u.following || [];
        if (!following.includes(targetId)) {
          return { ...u, following: [...following, targetId] };
        }
      }
      if (u.id === targetId) {
        const followers = u.followers || [];
        if (!followers.includes(followerId)) {
          return { ...u, followers: [...followers, followerId] };
        }
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Update current session if follower is logged in
    const currentUser = storageService.getCurrentUser();
    if (currentUser && currentUser.id === followerId) {
      const following = currentUser.following || [];
      if (!following.includes(targetId)) {
        storageService.setCurrentUser({ ...currentUser, following: [...following, targetId] });
      }
    }
  },

  unfollowUser: (followerId: string, targetId: string): void => {
    let users = storageService.getUsers();
    users = users.map(u => {
      if (u.id === followerId) {
        const following = u.following || [];
        return { ...u, following: following.filter(id => id !== targetId) };
      }
      if (u.id === targetId) {
        const followers = u.followers || [];
        return { ...u, followers: followers.filter(id => id !== followerId) };
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Update current session if follower is logged in
    const currentUser = storageService.getCurrentUser();
    if (currentUser && currentUser.id === followerId) {
      const following = currentUser.following || [];
      storageService.setCurrentUser({ ...currentUser, following: following.filter(id => id !== targetId) });
    }
  },

  getUserByUsername: (username: string): User | undefined => {
    const users = storageService.getUsers();
    return users.find(u => u.username === username);
  },

  getPosts: (): Post[] => {
    return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
  },

  createPost: (post: Post): void => {
    const posts = storageService.getPosts();
    posts.unshift(post);
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  },

  deletePost: (postId: string): void => {
    let posts = storageService.getPosts();
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  },

  toggleLike: (postId: string, userId: string): Post[] => {
    const posts = storageService.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex > -1) {
      const post = posts[postIndex];
      const likeIndex = post.likes.indexOf(userId);
      if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1); // Unlike
      } else {
        post.likes.push(userId); // Like
      }
      posts[postIndex] = post;
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }
    return posts;
  },

  addComment: (postId: string, comment: Comment): Post[] => {
    const posts = storageService.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex > -1) {
      posts[postIndex].comments.push(comment);
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }
    return posts;
  },

  deleteComment: (commentId: string): void => {
    const posts = storageService.getPosts();
    const updatedPosts = posts.map(p => ({
      ...p,
      comments: p.comments.filter(c => c.id !== commentId),
    }));
    localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));
  },

  // Session Management
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }
};
