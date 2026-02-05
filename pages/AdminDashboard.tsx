import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { storageService } from '../services/storage';
import { User, Post } from '../types';
import { Trash2, Shield, User as UserIcon, Loader2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');

    // New User Form State
    const [newUserUser, setNewUserUser] = useState('');
    const [newUserPass, setNewUserPass] = useState('');
    const [newUserFull, setNewUserFull] = useState('');
    const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        loadData();
    }, [user, navigate]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load Users (merge DB + local, DB wins)
            const dbUsers = await dbService.getUsers();
            const localUsers = storageService.getUsers();
            const userMap = new Map<string, User>();
            localUsers.forEach(u => userMap.set(u.username, u));
            dbUsers.forEach(u => userMap.set(u.username, u));
            setAllUsers(Array.from(userMap.values()));

            // Load Posts
            const dbPosts = await dbService.getPosts();
            const localPosts = storageService.getPosts();
            const postMap = new Map<string, Post>();
            localPosts.forEach(p => postMap.set(p.id, p));
            dbPosts.forEach(p => postMap.set(p.id, p));
            setAllPosts(Array.from(postMap.values()).sort((a,b) => b.createdAt - a.createdAt));

        } catch (e) {
            console.error("Failed to load admin data", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (userId === user?.id) {
            alert("Ensure you don't delete yourself!");
            return; 
        }
        if (!confirm("Are you sure you want to delete this user? This will remove all their posts.")) return;

        await dbService.deleteUser(userId);
        storageService.deleteUser(userId);
        loadData(); // Refresh
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this content?")) return;

        await dbService.deletePost(postId);
        storageService.deletePost(postId);
        loadData(); // Refresh
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserUser || !newUserPass || !newUserFull) return;

        const newUser: User = {
            id: `u${Date.now()}`,
            username: newUserUser,
            password: newUserPass,
            fullName: newUserFull,
            role: newUserRole,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUserFull)}`,
            bio: 'New Member'
        };

        await dbService.createUser(newUser);
        storageService.createUser(newUser); // Sync local

        // Reset form
        setNewUserUser('');
        setNewUserPass('');
        setNewUserFull('');
        loadData();
    };


    if (isLoading) return <div className="p-10 flex justify-center dark:text-white"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-4 sm:p-6 pb-24">
            <h1 className="text-3xl font-light mb-2 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Manage your family community.</p>

            {/* Tabs */}
            <div className="flex bg-white dark:bg-gray-900 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 w-fit transition-colors">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                    Manage Users
                </button>
                <button 
                    onClick={() => setActiveTab('posts')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'posts' ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                    Manage Content
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="space-y-8">
                     {/* Add User Form */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                        <h3 className="font-semibold mb-4 flex items-center gap-2 dark:text-white">
                             <UserIcon className="w-5 h-5 text-blue-500" /> Add New Member
                        </h3>
                        <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <input 
                                placeholder="Username" 
                                value={newUserUser}
                                onChange={e => setNewUserUser(e.target.value)}
                                className="border dark:border-gray-600 p-2 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <input 
                                placeholder="Full Name" 
                                value={newUserFull}
                                onChange={e => setNewUserFull(e.target.value)}
                                className="border dark:border-gray-600 p-2 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <input 
                                placeholder="Password" 
                                value={newUserPass}
                                onChange={e => setNewUserPass(e.target.value)}
                                className="border dark:border-gray-600 p-2 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <select 
                                value={newUserRole}
                                onChange={(e: any) => setNewUserRole(e.target.value)}
                                className="border dark:border-gray-600 p-2 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button type="submit" className="bg-blue-600 text-white font-semibold rounded text-sm flex items-center justify-center gap-2 hover:bg-blue-700 p-2">
                                <Save className="w-4 h-4" /> Create
                            </button>
                        </form>
                    </div>

                    {/* User List */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-colors">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">User</th>
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Role</th>
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {allUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="p-4 flex items-center gap-3">
                                            <img src={u.avatarUrl} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" alt={u.username} />
                                            <div>
                                                <div className="font-medium dark:text-white">{u.username}</div>
                                                <div className="text-gray-500 dark:text-gray-400 text-xs">{u.fullName}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {u.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-bold">
                                                    <Shield className="w-3 h-3" /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                                                    User
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-green-600 dark:text-green-400 font-medium">Active</td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-full transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'posts' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                    {allPosts.map(post => (
                        <div key={post.id} className="relative group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm transition-colors">
                            <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative">
                                <img src={post.imageUrl} className="w-full h-full object-cover" alt="Post" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={() => handleDeletePost(post.id)}
                                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transform hover:scale-110 transition-transform"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-2">
                                <div className="text-xs font-bold truncate dark:text-white">{post.username}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{post.caption || 'No caption'}</div>
                                <div className="mt-2 text-[10px] text-gray-400 uppercase">{new Date(post.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                    {allPosts.length === 0 && <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-20">No data found.</div>}
                </div>
            )}
        </div>
    );
};
