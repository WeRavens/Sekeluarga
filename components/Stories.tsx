import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storage';
import { dbService } from '../services/db';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

export const Stories: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const { user: currentUser } = useAuth();
    
    useEffect(() => {
        const loadUsers = async () => {
            let loadedUsers = await dbService.getUsers();
            if (loadedUsers.length === 0) {
                loadedUsers = storageService.getUsers();
            }
            setUsers(loadedUsers);
        };
        loadUsers();
    }, []);

    // Filter out current user for the list, put them first if needed as "My Story"
    const otherUsers = users.filter(u => u.id !== currentUser?.id);

    return (
        <div className="bg-white dark:bg-black border sm:border-gray-200 dark:border-gray-800 sm:rounded-lg mb-4 sm:mb-6 pt-4 pb-4 px-2 overflow-x-auto scrollbar-hide transition-colors">
            <div className="flex gap-4 px-2">
                {currentUser && (
                    <div className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 relative group">
                         <div className="relative">
                            <div className="w-16 h-16 rounded-full p-[2px] border-2 border-gray-100 dark:border-gray-800 group-hover:border-gray-200 dark:group-hover:border-gray-700 transition-colors">
                                <img 
                                    src={currentUser.avatarUrl} 
                                    className="w-full h-full rounded-full object-cover"
                                    alt="My Story"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white dark:border-black">
                                <Plus size={14} strokeWidth={4} />
                            </div>
                         </div>
                        <span className="text-xs truncate w-16 text-center text-gray-700 dark:text-gray-300">Your Story</span>
                    </div>
                )}
            
                {otherUsers.map(user => (
                    <div key={user.id} className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 group">
                        <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 group-hover:scale-105 transition-transform duration-200">
                            <div className="w-full h-full rounded-full p-[2px] bg-white dark:bg-black">
                                <img 
                                    src={user.avatarUrl} 
                                    className="w-full h-full rounded-full object-cover"
                                    alt={user.username}
                                />
                            </div>
                        </div>
                        <span className="text-xs truncate w-16 text-center text-gray-700 dark:text-gray-300">{user.username}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
