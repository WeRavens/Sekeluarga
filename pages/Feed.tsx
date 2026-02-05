import React, { useEffect, useState } from 'react';
import { PostCard } from '../components/PostCard';
import { Stories } from '../components/Stories';
import { Suggestions } from '../components/Suggestions';
import { storageService } from '../services/storage';
import { dbService } from '../services/db';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';

export const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useAuth();
  
  // Refresh posts trigger
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const dbPosts = await dbService.getPosts();
        const sortedPosts = dbPosts.sort((a, b) => b.createdAt - a.createdAt);
        setPosts(sortedPosts);
      } catch (e) {
        const localPosts = storageService.getPosts();
        const sortedPosts = localPosts.sort((a, b) => b.createdAt - a.createdAt);
        setPosts(sortedPosts);
      }
    }
    loadPosts();
  }, [refresh]);

  const handleUpdate = () => {
    setRefresh(prev => prev + 1);
  };

  if (!user) return null;

  return (
    <div className="flex justify-center gap-8">
      {/* Left/Main Column - Feed */}
      <div className="w-full max-w-[520px] pb-20 sm:pb-0">
        <div className="px-1 sm:px-0">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-serif italic tracking-wide dark:text-white">Moments</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Berbagi cerita terbaik hari ini</p>
          </div>
        </div>
        <Stories />
        
        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 transition-colors">
            <p className="mb-4 text-lg font-medium dark:text-gray-300">No moments shared yet.</p>
            <p className="text-sm">Be the first to upload a photo!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </div>

      {/* Right Column - Suggestions (Desktop only) */}
      <Suggestions />
    </div>
  );
};
