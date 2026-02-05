export interface User {
  id: string;
  username: string;
  password?: string; // stored for mock auth only
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  role?: 'admin' | 'user';
  followers?: string[]; // array of user IDs
  following?: string[]; // array of user IDs
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  text: string;
  createdAt: number; // timestamp
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  imageUrl: string;
  caption: string;
  likes: string[]; // array of userIds who liked
  comments: Comment[];
  createdAt: number;
}
