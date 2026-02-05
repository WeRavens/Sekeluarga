import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storage';
import { dbService } from '../services/db';
import { User, Post } from '../types';
import { Grid, ArrowLeft, Loader2, UserCheck, UserPlus } from 'lucide-react';
import { ImageLightbox } from '../components/ImageLightbox';
import { PostModal } from '../components/PostModal';
import { withCacheBuster } from '../utils/image';

export const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    if (!username) return;
    setIsLoading(true);

    try {
      // Try DB + local and merge (DB wins, but keep followers/following union)
      const dbUser = await dbService.getUserByUsername(username);
      const localUser = storageService.getUserByUsername(username) || null;

      let user: User | null = null;
      if (dbUser || localUser) {
        const followers = Array.from(new Set([...(localUser?.followers || []), ...(dbUser?.followers || [])]));
        const following = Array.from(new Set([...(localUser?.following || []), ...(dbUser?.following || [])]));
        user = {
          ...(localUser || {}),
          ...(dbUser || {}),
          followers,
          following,
        } as User;
      }

      if (user) {
        setProfileUser(user);
        
        // Check if current user follows this profile
        const sessionUser = storageService.getCurrentUser() || currentUser;
        if (sessionUser) {
          const following = sessionUser.following || [];
          setIsFollowing(following.includes(user.id));
        }

        // Load posts (merge DB + local)
        try {
          const dbPosts = await dbService.getPosts();
          const filteredPosts = dbPosts.filter(p => p.userId === user!.id);
          setUserPosts(filteredPosts.sort((a, b) => b.createdAt - a.createdAt));
        } catch (e) {
          const localPosts = storageService.getPosts();
          const filteredPosts = localPosts.filter(p => p.userId === user!.id);
          setUserPosts(filteredPosts.sort((a, b) => b.createdAt - a.createdAt));
        }
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !profileUser) return;
    setFollowLoading(true);

    try {
      if (isFollowing) {
        await dbService.unfollowUser(currentUser.id, profileUser.id);
        storageService.unfollowUser(currentUser.id, profileUser.id);
        setIsFollowing(false);
        setProfileUser(prev => prev ? { ...prev, followers: (prev.followers || []).filter(id => id !== currentUser.id) } : null);
      } else {
        await dbService.followUser(currentUser.id, profileUser.id);
        storageService.followUser(currentUser.id, profileUser.id);
        setIsFollowing(true);
        setProfileUser(prev => prev ? { ...prev, followers: [...(prev.followers || []), currentUser.id] } : null);
      }
    } catch (e) {
      console.error("Follow action failed", e);
    } finally {
      setFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-light mb-2 dark:text-white">User not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">The user you're looking for doesn't exist.</p>
        <Link to="/" className="text-blue-500 font-semibold">Go back home</Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="pb-20">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white p-4 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </Link>

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sm:rounded-t-2xl transition-colors">
        <div className="flex-shrink-0">
          <img 
            src={withCacheBuster(profileUser.avatarUrl) || `https://ui-avatars.com/api/?name=${profileUser.username}`} 
            alt={profileUser.fullName} 
            className="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-2 border-gray-200 dark:border-gray-700 p-1 object-cover cursor-zoom-in"
            onClick={() => setLightboxSrc(withCacheBuster(profileUser.avatarUrl) || `https://ui-avatars.com/api/?name=${profileUser.username}`)}
          />
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <h2 className="text-2xl font-light text-gray-800 dark:text-gray-100">{profileUser.username}</h2>
            
            {!isOwnProfile && (
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`px-6 py-1.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors ${
                  isFollowing 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {followLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" /> Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Follow
                  </>
                )}
              </button>
            )}

            {isOwnProfile && (
              <Link to="/profile" className="px-6 py-1.5 rounded-lg font-semibold text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Edit Profile
              </Link>
            )}
          </div>
          
          <div className="flex justify-center sm:justify-start gap-8 mb-4 dark:text-gray-300">
            <div className="text-center sm:text-left">
              <span className="font-bold block text-gray-900 dark:text-white">{userPosts.length}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">posts</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="font-bold block text-gray-900 dark:text-white">{(profileUser.followers || []).length}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">followers</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="font-bold block text-gray-900 dark:text-white">{(profileUser.following || []).length}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">following</span>
            </div>
          </div>
          
          <div className="space-y-1 dark:text-gray-200">
            <div className="font-bold text-sm">{profileUser.fullName}</div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{profileUser.bio}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black transition-colors">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 border-b-2 border-black dark:border-white text-xs font-semibold uppercase tracking-widest text-black dark:text-white">
          <Grid className="w-4 h-4" /> Posts
        </button>
      </div>

      {/* Grid */}
      {userPosts.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-white dark:bg-black sm:rounded-b-2xl transition-colors">
          <div className="w-16 h-16 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <Grid className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-light mb-2 dark:text-gray-300">No Posts Yet</h3>
          <p className="text-sm">This user hasn't shared any photos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 sm:gap-4 sm:p-4 bg-white dark:bg-black sm:rounded-b-2xl transition-colors">
          {userPosts.map(post => (
            <div key={post.id} className="relative aspect-square group cursor-pointer bg-gray-100 dark:bg-gray-800">
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
      )}
      <ImageLightbox src={lightboxSrc} alt="Profile image" onClose={() => setLightboxSrc(null)} />
      {activePost && (
        <PostModal
          post={activePost}
          relatedPosts={userPosts}
          onClose={() => setActivePost(null)}
          onUpdate={loadProfile}
          onSelectPost={(p) => setActivePost(p)}
        />
      )}
    </div>
  );
};
