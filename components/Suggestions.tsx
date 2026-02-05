import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storage';
import { dbService } from '../services/db';
import { User } from '../types';

export const Suggestions: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [followingState, setFollowingState] = useState<{[key: string]: boolean}>({});

    useEffect(() => {
        loadSuggestions();
    }, [currentUser]);

    const loadSuggestions = async () => {
        if (!currentUser) return;

        let users = await dbService.getUsers();
        if (users.length === 0) {
            users = storageService.getUsers();
        }

        // Filter out current user and get suggestions
        const otherUsers = users.filter(u => u.id !== currentUser.id).slice(0, 5);
        setSuggestions(otherUsers);

        // Set initial following state
        const following = currentUser.following || [];
        const initialFollowState: {[key: string]: boolean} = {};
        otherUsers.forEach(u => {
            initialFollowState[u.id] = following.includes(u.id);
        });
        setFollowingState(initialFollowState);
    };

    const handleFollow = async (targetId: string) => {
        if (!currentUser) return;

        const isCurrentlyFollowing = followingState[targetId];

        // Optimistic update
        setFollowingState(prev => ({ ...prev, [targetId]: !isCurrentlyFollowing }));

        try {
            if (isCurrentlyFollowing) {
                await dbService.unfollowUser(currentUser.id, targetId);
                storageService.unfollowUser(currentUser.id, targetId);
            } else {
                await dbService.followUser(currentUser.id, targetId);
                storageService.followUser(currentUser.id, targetId);
            }
        } catch (e) {
            // Revert on error
            setFollowingState(prev => ({ ...prev, [targetId]: isCurrentlyFollowing }));
            console.error("Follow action failed", e);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="hidden lg:block w-80 pt-8 pl-8 sticky top-0 h-screen">
             {/* Current User */}
             <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                     <Link to="/profile">
                        <img 
                            src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${currentUser.username}`} 
                            className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                            alt={currentUser?.username}
                         />
                     </Link>
                     <div>
                         <Link to="/profile" className="font-semibold text-sm text-gray-800 dark:text-gray-100 hover:underline">{currentUser?.username}</Link>
                         <div className="text-gray-500 text-xs dark:text-gray-400">{currentUser?.fullName}</div>
                     </div>
                 </div>
                 <button className="text-blue-500 text-xs font-semibold hover:text-blue-700 dark:hover:text-blue-400">Switch</button>
             </div>
             
             <div className="flex justify-between mb-4 mt-6">
                 <span className="text-gray-500 font-semibold text-sm dark:text-gray-400">Suggestions for you</span>
                 <button className="text-xs font-semibold text-gray-800 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-400">See All</button>
             </div>

             <div className="space-y-4">
                 {suggestions.map(u => (
                     <div key={u.id} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <Link to={`/user/${u.username}`}>
                                <img src={u.avatarUrl} className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-gray-700" alt={u.username} />
                             </Link>
                             <div>
                                 <Link to={`/user/${u.username}`} className="font-semibold text-sm hover:underline cursor-pointer dark:text-gray-100">{u.username}</Link>
                                 <div className="text-gray-400 text-xs truncate w-32">
                                    {followingState[u.id] ? 'Following' : 'Suggested for you'}
                                 </div>
                             </div>
                         </div>
                         <button 
                            onClick={() => handleFollow(u.id)}
                            className={`text-xs font-semibold transition-colors ${
                                followingState[u.id] 
                                    ? 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200' 
                                    : 'text-blue-500 hover:text-blue-700 dark:hover:text-blue-400'
                            }`}
                         >
                            {followingState[u.id] ? 'Unfollow' : 'Follow'}
                         </button>
                     </div>
                 ))}
             </div>
             
             <div className="mt-8 text-xs text-gray-300 dark:text-gray-600">
                 <div className="flex flex-wrap gap-1 mb-4 text-gray-300/80 dark:text-gray-600/80">
                    <span>About</span>•<span>Help</span>•<span>Press</span>•<span>API</span>•<span>Jobs</span>•<span>Privacy</span>•<span>Terms</span>
                 </div>
                 © 2026 SEKELUARGA
             </div>
         </div>
    );
};
