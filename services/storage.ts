import { User, Post, Comment } from '../types';

const USERS_KEY = 'famgram_v4_users';
const POSTS_KEY = 'famgram_v4_posts';
const CURRENT_USER_KEY = 'famgram_v4_current_user';

// Seed data to make the app look alive initially
const SEED_USERS: User[] = [
  { id: 'u0', username: 'admin', password: 'adminpassword', fullName: 'Super Admin', bio: 'System Administrator', role: 'admin' },
  { id: 'u1', username: 'mom', password: 'password', fullName: 'Mom', bio: 'Love my family!', avatarUrl: 'https://picsum.photos/id/64/200/200', role: 'user' },
  { id: 'u2', username: 'dad', password: 'password', fullName: 'Dad', bio: 'Grilling enthusiast.', avatarUrl: 'https://picsum.photos/id/65/200/200', role: 'user' },
  { id: 'u3', username: 'alice', password: 'password', fullName: 'Alice', bio: 'Student', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', role: 'user' },
  { id: 'u4', username: 'uncle_bob', password: 'password', fullName: 'Uncle Bob', bio: 'Fishing and Camping', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', role: 'user' },
  { id: 'u5', username: 'sarah_art', password: 'password', fullName: 'Sarah Design', bio: 'Digital Artist', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop', role: 'user' },
  { id: 'u6', username: 'max_dog', password: 'password', fullName: 'Max the Dog', bio: 'Woof!', avatarUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200&h=200&fit=crop', role: 'user' },
];

const SEED_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'u1',
    username: 'mom',
    userAvatar: 'https://picsum.photos/id/64/200/200',
    imageUrl: 'https://picsum.photos/id/1025/600/600',
    caption: 'Our furry friend relaxing in the garden',
    likes: ['u2', 'u3'],
    comments: [
      { id: 'c1', postId: 'p1', userId: 'u3', username: 'alice', text: 'So cute!', createdAt: Date.now() - 100000 },
    ],
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'p2',
    userId: 'u2',
    username: 'dad',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=800&fit=crop', // Coffee
    caption: 'Making coffee this morning. Who wants some?',
    likes: ['u1', 'u3', 'u4'],
    comments: [],
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'p3',
    userId: 'u5',
    username: 'sarah_art',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop', // Art
    caption: 'Just finished this new piece! What do you think?',
    likes: ['u1', 'u2', 'u3'],
    comments: [
      { id: 'c2', postId: 'p3', userId: 'u1', username: 'mom', text: 'Beautiful!', createdAt: Date.now() - 1000000 },
    ],
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'p4',
    userId: 'u4',
    username: 'uncle_bob',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    imageUrl: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&h=800&fit=crop', // Nature
    caption: 'Great weekend trip!',
    likes: ['u2'],
    comments: [],
    createdAt: Date.now() - 10800000,
  },
];

const initializeStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem(POSTS_KEY)) {
    localStorage.setItem(POSTS_KEY, JSON.stringify(SEED_POSTS));
  }
};

// Initialize immediately
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
