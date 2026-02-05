import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/Button';
import { Camera, AlertCircle, Sun, Moon } from 'lucide-react';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  
  const { login, signup } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || (!isLogin && !fullName)) {
      setError('Please fill in all fields');
      return;
    }

    let success;
    if (isLogin) {
      success = await login(username, password);
      if (!success) setError('Invalid credentials');
    } else {
      success = await signup(username, password, fullName);
      if (!success) setError('Username already taken');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black px-4 py-12 transition-colors">
      <div className="w-full max-w-sm space-y-4">
        
        {/* Theme Toggle */}
        <div className="flex justify-end">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-10 flex flex-col items-center shadow-sm transition-colors">
          <div className="mb-8 flex flex-col items-center">
             <div className="w-16 h-16 mb-4 rounded-xl overflow-hidden shadow-lg">
                <img src="/logo-192.jpg" alt="Sekeluarga" className="w-full h-full object-cover" />
             </div>
             <h1 className="text-3xl font-serif italic tracking-wider dark:text-white">Sekeluarga</h1>
             <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-medium">Berbagi momen bersama keluarga</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-3">
             {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 dark:bg-red-900/30 p-2 rounded mb-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            
            <input
              type="text"
              placeholder="Username"
              className="w-full px-2 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 dark:focus:border-gray-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-2 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 dark:focus:border-gray-400"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

            <input
              type="password"
              placeholder="Password"
              className="w-full px-2 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 dark:focus:border-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" fullWidth className="mt-2">
              {isLogin ? 'Log In' : 'Sign Up'}
            </Button>
          </form>
        </div>

        {/* Switch Mode Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-4 text-center shadow-sm transition-colors">
          <p className="text-sm dark:text-gray-300">
            {isLogin ? "Don't have an account? " : "Have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-blue-500 font-bold"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
