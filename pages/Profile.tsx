import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storage';
import { dbService } from '../services/db';
import { Post } from '../types';
import { Grid, Tag, Bookmark, Edit2, Loader2, User as UserIcon } from 'lucide-react';
import { ImageLightbox } from '../components/ImageLightbox';
import { PostModal } from '../components/PostModal';
import { withCacheBuster } from '../utils/image';

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [taggedPosts, setTaggedPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'tagged'>('posts');
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const dbPosts = await dbService.getPosts();
        const myPosts = dbPosts.filter(p => p.userId === user.id);
        setUserPosts(myPosts.sort((a, b) => b.createdAt - a.createdAt));

        const savedIds = await dbService.getSavedPostIds(user.id);
        setSavedPosts(dbPosts.filter(p => savedIds.includes(p.id)));

        const taggedIds = await dbService.getTaggedPostIds(user.id);
        setTaggedPosts(dbPosts.filter(p => taggedIds.includes(p.id)));
      } catch (e) {
        const localPosts = storageService.getPosts();
        const myPosts = localPosts.filter(p => p.userId === user.id);
        setUserPosts(myPosts.sort((a, b) => b.createdAt - a.createdAt));
        setSavedPosts([]);
        setTaggedPosts([]);
      }
    };
    load();
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    
    setIsUploading(true);
    const file = e.target.files[0];

    try {
        // Strict Mode: Only Upload to Supabase
        const url = await dbService.uploadImage(file);
        
        if (!url) {
             throw new Error("Upload failed");
        }

        // Update User Profile
        const updatedUser = { ...user, avatarUrl: url };
        
        // Critical: Update DB first
        const success = await dbService.updateUser(updatedUser);
        
        if (!success) {
             throw new Error("Failed to update user profile in database");
        }

        // Update local cache + session
        storageService.updateUser(updatedUser);
        await refreshUser();

    } catch (error) {
        console.error("Profile update failed:", error);
        alert("Failed to update profile picture. Please check your internet connection.");
    } finally {
        setIsUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="pb-20">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sm:rounded-t-2xl transition-colors">
        <div className="relative group flex-shrink-0">
          <img 
            src={withCacheBuster(user.avatarUrl) || `https://ui-avatars.com/api/?name=${user.username}`} 
            alt={user.fullName} 
            className="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-2 border-gray-200 dark:border-gray-700 p-1 object-cover cursor-zoom-in"
            onClick={() => setLightboxSrc(withCacheBuster(user.avatarUrl) || `https://ui-avatars.com/api/?name=${user.username}`)}
          />
          <button 
             onClick={() => fileInputRef.current?.click()}
             className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full text-white border-2 border-white dark:border-black hover:bg-blue-600 shadow-md"
             title="Change Profile Photo"
          >
             {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
              <h2 className="text-2xl font-light text-gray-800 dark:text-gray-100">{user.username}</h2>
              {user.role === 'admin' && (
                  <span className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                      Admin
                  </span>
              )}
          </div>
          
          <div className="flex justify-center sm:justify-start gap-8 mb-4 dark:text-gray-300">
            <div className="text-center sm:text-left">
              <span className="font-bold block text-gray-900 dark:text-white">{userPosts.length}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">posts</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="font-bold block text-gray-900 dark:text-white">0</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">followers</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="font-bold block text-gray-900 dark:text-white">0</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">following</span>
            </div>
          </div>
          
          <div className="space-y-1 dark:text-gray-200">
            <div className="font-bold text-sm">{user.fullName}</div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{user.bio}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black transition-colors">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 text-xs font-semibold uppercase tracking-widest ${
            activeTab === 'posts' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <Grid className="w-4 h-4" /> Posts
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 text-xs font-semibold uppercase tracking-widest ${
            activeTab === 'saved' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <Bookmark className="w-4 h-4" /> Saved
        </button>
        <button
          onClick={() => setActiveTab('tagged')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 text-xs font-semibold uppercase tracking-widest ${
            activeTab === 'tagged' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
        >
          <Tag className="w-4 h-4" /> Tagged
        </button>
      </div>

      {/* Grid */}
      {activeTab === 'posts' && userPosts.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-white dark:bg-black sm:rounded-b-2xl transition-colors">
          <div className="w-16 h-16 border-2 border-black dark:border-white rounded-full flex items-center justify-center mx-auto mb-4">
             <Grid className="w-8 h-8 text-black dark:text-white" />
          </div>
          <h3 className="text-xl font-light mb-2 dark:text-white">Share Photos</h3>
          <p className="text-sm">When you share photos, they will appear on your profile.</p>
        </div>
      ) : activeTab === 'posts' ? (
        <div className="grid grid-cols-3 gap-0.5 sm:gap-4 sm:p-4 bg-white dark:bg-black sm:rounded-b-2xl transition-colors">
          {userPosts.map(post => (
            <div key={post.id} className="relative aspect-square group cursor-pointer bg-gray-100">
              <img 
                src={post.imageUrl} 
                alt={post.caption} 
                className="w-full h-full object-cover"
                onClick={() => setActivePost(post)}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center text-white font-bold gap-4">
                <span>❤️ {post.likes.length}</span>
                <span>💬 {post.comments.length}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'saved' && (
        savedPosts.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-white dark:bg-black sm:rounded-b-2xl transition-colors">
            <div className="w-16 h-16 border-2 border-black dark:border-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-black dark:text-white" />
            </div>
            <h3 className="text-xl font-light mb-2 dark:text-white">No Saved Posts</h3>
            <p className="text-sm">Posts you save will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-4 sm:p-4 bg-white dark:bg-black sm:rounded-b-2xl transition-colors">
            {savedPosts.map(post => (
              <div key={post.id} className="relative aspect-square group cursor-pointer bg-gray-100">
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                  onClick={() => setActivePost(post)}
                />
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'tagged' && (
        taggedPosts.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-white dark:bg-black sm:rounded-b-2xl transition-colors">
            <div className="w-16 h-16 border-2 border-black dark:border-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-black dark:text-white" />
            </div>
            <h3 className="text-xl font-light mb-2 dark:text-white">No Tagged Posts</h3>
            <p className="text-sm">Posts where you are tagged will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-4 sm:p-4 bg-white dark:bg-black sm:rounded-b-2xl transition-colors">
            {taggedPosts.map(post => (
              <div key={post.id} className="relative aspect-square group cursor-pointer bg-gray-100">
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover"
                  onClick={() => setActivePost(post)}
                />
              </div>
            ))}
          </div>
        )
      )}
      <ImageLightbox src={lightboxSrc} alt="Profile image" onClose={() => setLightboxSrc(null)} />
      {activePost && (
        <PostModal
          post={activePost}
          relatedPosts={userPosts}
          onClose={() => setActivePost(null)}
          onUpdate={() => {
            // refresh posts after like/comment in modal
            const load = async () => {
              try {
                const dbPosts = await dbService.getPosts();
                const myPosts = dbPosts.filter(p => p.userId === user?.id);
                setUserPosts(myPosts.sort((a, b) => b.createdAt - a.createdAt));
              } catch (e) {
                const localPosts = storageService.getPosts();
                const myPosts = localPosts.filter(p => p.userId === user?.id);
                setUserPosts(myPosts.sort((a, b) => b.createdAt - a.createdAt));
              }
            };
            load();
          }}
          onSelectPost={(p) => setActivePost(p)}
        />
      )}
    </div>
  );
};
