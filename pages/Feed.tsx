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
      // Try DB
      let loadPosts = await dbService.getPosts();
      
      // Fallback
      if (loadPosts.length === 0) {
        loadPosts = storageService.getPosts();
      }
      
      // Sort by Date Descending
      const sortedPosts = loadPosts.sort((a, b) => b.createdAt - a.createdAt);
      setPosts(sortedPosts);
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
      <div className="w-full max-w-[470px] pb-20 sm:pb-0">
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
