import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storage';
import { dbService } from '../services/db';
import { ImageLightbox } from './ImageLightbox';

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const isLiked = user ? post.likes.includes(user.id) : false;

  const handleLike = async () => {
    if (!user) return;
    
    // Optimistic UI update (optional, but for now we just wait)
    // Actually simplicity first
    try {
      await dbService.toggleLike(post.id, user.id);
    } catch (e) {
      console.warn("DB Like failed, falling back to local only");
    }
    storageService.toggleLike(post.id, user.id);

    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 300);
    onUpdate();
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    const newComment: Comment = {
      id: `c${Date.now()}`,
      postId: post.id,
      userId: user.id,
      username: user.username,
      text: commentText.trim(),
      createdAt: Date.now(),
    };

    try {
      await dbService.addComment(newComment);
    } catch (e) {
      console.warn("DB Comment failed");
    }
    storageService.addComment(post.id, newComment); // Fallback sync
    
    setCommentText('');
    onUpdate();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-black border sm:border-gray-200 dark:border-gray-800 sm:rounded-lg mb-4 sm:mb-8 overflow-hidden shadow-sm dark:shadow-none transition-colors">
      {/* Header */}
      <Link to={`/user/${post.username}`} className="p-3 flex items-center gap-3 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
        <img 
          src={post.userAvatar || `https://ui-avatars.com/api/?name=${post.username}`} 
          alt={post.username} 
          className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
        />
        <span className="font-semibold text-sm">{post.username}</span>
      </Link>

      {/* Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800" onDoubleClick={handleLike}>
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full h-full object-cover cursor-zoom-in"
          loading="lazy"
          onClick={() => setLightboxSrc(post.imageUrl)}
        />
        {isLikeAnimating && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-bounce">
             <Heart className="w-24 h-24 text-white fill-white opacity-80" />
           </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center gap-4 mb-2 dark:text-white">
          <button 
            onClick={handleLike} 
            className={`transition-transform active:scale-90 ${isLiked ? 'text-red-500' : 'text-black dark:text-white'}`}
          >
            <Heart className={`w-7 h-7 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button className="text-black dark:text-white">
            <MessageCircle className="w-7 h-7" />
          </button>
        </div>

        {/* Likes Count */}
        <div className="font-semibold text-sm mb-1 dark:text-white">
          {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
        </div>

        {/* Caption */}
        <div className="text-sm mb-2 dark:text-gray-200">
          <span className="font-semibold mr-2 dark:text-white">{post.username}</span>
          <span>{post.caption}</span>
        </div>

        {/* Comments */}
        {post.comments.length > 0 && (
          <div className="mt-2 space-y-2">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2 text-sm">
                <Link to={`/user/${comment.username}`} className="shrink-0">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.username)}`}
                    alt={comment.username}
                    className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                </Link>
                <div className="dark:text-gray-300">
                  <Link to={`/user/${comment.username}`} className="font-semibold mr-2 dark:text-white hover:underline">
                    {comment.username}
                  </Link>
                  <span className="text-gray-800 dark:text-gray-300">{comment.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-400 mt-2 uppercase tracking-wide">
          {formatDate(post.createdAt)}
        </div>

        {/* Add Comment Input */}
        <form onSubmit={handleComment} className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 text-sm outline-none bg-transparent dark:text-white placeholder:text-gray-400"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!commentText.trim()}
            className="text-blue-500 font-semibold text-sm disabled:opacity-40"
          >
            Post
          </button>
        </form>
      </div>
      <ImageLightbox src={lightboxSrc} alt={post.caption || 'Post image'} onClose={() => setLightboxSrc(null)} />
    </div>
  );
};
