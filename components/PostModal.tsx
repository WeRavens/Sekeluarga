import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, X, ChevronLeft, ChevronRight, Trash2, MoreHorizontal, Bookmark, Tag, Share2 } from 'lucide-react';
import { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storage';
import { dbService } from '../services/db';
import { withCacheBuster } from '../utils/image';

interface PostModalProps {
  post: Post;
  relatedPosts: Post[];
  onClose: () => void;
  onUpdate: () => void;
  onSelectPost: (post: Post) => void;
}

export const PostModal: React.FC<PostModalProps> = ({ post, relatedPosts, onClose, onUpdate, onSelectPost }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const isLiked = user ? post.likes.includes(user.id) : false;
  const canDeletePost = user?.id === post.userId;
  const isAdmin = user?.role === 'admin';

  const handleLike = async () => {
    if (!user) return;
    try {
      await dbService.toggleLike(post.id, user.id);
    } catch (e) {
      console.warn('DB Like failed, falling back to local only');
    }
    storageService.toggleLike(post.id, user.id);
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
      avatarUrl: user.avatarUrl,
      text: commentText.trim(),
      createdAt: Date.now(),
    };

    try {
      await dbService.addComment(newComment);
    } catch (e) {
      console.warn('DB Comment failed');
    }
    storageService.addComment(post.id, newComment);

    setCommentText('');
    onUpdate();
  };

  const handleDeletePost = async () => {
    if (!user || (!canDeletePost && !isAdmin)) return;
    if (!confirm('Hapus postingan ini?')) return;
    const deleted = await dbService.deletePost(post.id, post.imageUrl);
    if (deleted) {
      storageService.deletePost(post.id);
      onUpdate();
      onClose();
    }
  };

  const handleDeleteComment = async (commentId: string, commentUserId: string) => {
    if (!user || (!isAdmin && user.id !== commentUserId)) return;
    const ok = await dbService.deleteComment(commentId);
    if (ok) {
      storageService.deleteComment(commentId);
      onUpdate();
    }
  };

  const handleSave = async () => {
    if (!user) return;
    await dbService.toggleSavePost(user.id, post.id);
  };

  const handleTag = async () => {
    if (!user) return;
    const username = prompt('Tag username:');
    if (!username) return;
    const target = await dbService.getUserByUsername(username);
    if (!target) {
      alert('User tidak ditemukan');
      return;
    }
    const ok = await dbService.tagUserOnPost(post.id, target.id);
    if (!ok) {
      alert('Gagal menambahkan tag');
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: 'Sekeluarga',
        text: post.caption || 'Lihat postingan ini',
        url: post.imageUrl,
      };
      if (navigator.share) {
        await navigator.share(shareData as any);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(post.imageUrl);
        alert('Link disalin');
      }
    } catch (e) {
      // ignore share errors
    }
  };

  const sortedRelated = relatedPosts.sort((a, b) => b.createdAt - a.createdAt);
  const currentIndex = sortedRelated.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? sortedRelated[currentIndex - 1] : null;
  const nextPost = currentIndex >= 0 && currentIndex < sortedRelated.length - 1 ? sortedRelated[currentIndex + 1] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div className="w-full max-w-5xl bg-white dark:bg-black rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <img
              src={withCacheBuster(post.userAvatar) || `https://ui-avatars.com/api/?name=${post.username}`}
              alt={post.username}
              className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
            />
            <div>
              <Link to={`/user/${post.username}`} className="font-semibold text-sm dark:text-white hover:underline">
                {post.username}
              </Link>
              <div className="text-xs text-gray-500 dark:text-gray-400">Post</div>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900">
              <MoreHorizontal className="w-5 h-5 dark:text-white" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 w-40 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-lg p-2 z-20">
                {(canDeletePost || isAdmin) && (
                  <button onClick={() => { setMenuOpen(false); handleDeletePost(); }} className="w-full flex items-center gap-2 p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={handleSave} className="w-full flex items-center gap-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900" title="Saved">
                  <Bookmark className="w-4 h-4" />
                </button>
                <button onClick={handleTag} className="w-full flex items-center gap-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900" title="Tagged">
                  <Tag className="w-4 h-4" />
                </button>
                <button onClick={handleShare} className="w-full flex items-center gap-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900" title="Share">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900">
              <X className="w-5 h-5 dark:text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative bg-black">
            <img src={post.imageUrl} alt={post.caption} className="w-full h-auto object-contain max-h-[60vh] lg:max-h-[70vh] bg-black" />
            {prevPost && (
              <button
                onClick={() => onSelectPost(prevPost)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-2 shadow"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {nextPost && (
              <button
                onClick={() => onSelectPost(nextPost)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-2 shadow"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col max-h-none lg:max-h-[70vh]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4 mb-3">
                <button onClick={handleLike} className={`transition-transform active:scale-90 ${isLiked ? 'text-red-500' : 'text-black dark:text-white'}`}>
                  <Heart className={`w-7 h-7 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button className="text-black dark:text-white">
                  <MessageCircle className="w-7 h-7" />
                </button>
              </div>
              <div className="font-semibold text-sm dark:text-white">
                {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
              </div>
              {post.caption && (
                <div className="text-sm mt-2 dark:text-gray-200">
                  <span className="font-semibold mr-2 dark:text-white">{post.username}</span>
                  <span>{post.caption}</span>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 space-y-3 lg:overflow-y-auto">
              {post.comments.length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">No comments yet.</div>
              )}
              {post.comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-2 text-sm group">
                  <Link to={`/user/${comment.username}`} className="shrink-0">
                    <img
                      src={withCacheBuster(comment.avatarUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.username)}`}
                      alt={comment.username}
                      className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                  </Link>
                  <div className="dark:text-gray-300 flex-1">
                    <Link to={`/user/${comment.username}`} className="font-semibold mr-2 dark:text-white hover:underline">
                      {comment.username}
                    </Link>
                    <span className="text-gray-800 dark:text-gray-300">{comment.text}</span>
                  </div>
                  {(user?.id === comment.userId || isAdmin) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id, comment.userId)}
                      className="opacity-70 group-hover:opacity-100 text-red-500 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleComment} className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 text-sm outline-none bg-transparent dark:text-white placeholder:text-gray-400"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button type="submit" disabled={!commentText.trim()} className="text-blue-500 font-semibold text-sm disabled:opacity-40">
                Post
              </button>
            </form>
          </div>
        </div>

        {sortedRelated.length > 1 && (
          <div className="p-3 border-t border-gray-100 dark:border-gray-800">
            <div className="text-xs uppercase text-gray-400 mb-2">More from this user</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sortedRelated.map(p => (
                <button key={p.id} onClick={() => onSelectPost(p)} className={`relative h-16 w-16 rounded-md overflow-hidden border ${p.id === post.id ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}>
                  <img src={p.imageUrl} alt={p.caption} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
