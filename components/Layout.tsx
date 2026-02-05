import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, User, LogOut, Camera, Shield, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (!user) {
    return <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col justify-center">{children}</div>;
  }

  const isActive = (path: string) => location.pathname === path;

  // Active nav item classes for better visibility
  const getNavItemClass = (path: string) => {
    const active = isActive(path);
    if (active) {
      return 'bg-black dark:bg-white text-white dark:text-black';
    }
    return 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col sm:flex-row transition-colors duration-200">
      
      {/* 
        DESKTOP SIDEBAR (Left) 
      */}
      <aside className="hidden sm:flex w-fit lg:w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 h-screen z-40 pt-8 px-4 justify-between">
         <div className="flex flex-col gap-8">
            {/* Logo */}
            <Link to="/" className="text-xl lg:text-2xl font-bold font-serif italic tracking-wider flex items-center gap-3 px-2 mb-2 hover:opacity-80 transition-opacity">
               <img src="/logo-192.jpg" alt="Sekeluarga" className="w-8 h-8 rounded-lg object-cover" />
               <span className="hidden lg:block">Sekeluarga</span>
            </Link>

            {/* Nav Items */}
            <nav className="flex flex-col gap-2">
                 <Link to="/" className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${getNavItemClass('/')}`}>
                    <Home className="w-6 h-6" />
                    <span className="hidden lg:block text-base font-medium">Home</span>
                 </Link>
                 
                 <Link to="/upload" className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${getNavItemClass('/upload')}`}>
                    <PlusSquare className="w-6 h-6" />
                    <span className="hidden lg:block text-base font-medium">Create</span>
                 </Link>
                 
                 <Link to="/profile" className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${getNavItemClass('/profile')}`}>
                    {user.avatarUrl ? (
                         <img src={user.avatarUrl} className={`w-6 h-6 rounded-full ${isActive('/profile') ? 'ring-2 ring-white dark:ring-black' : ''}`} />
                    ) : (
                         <User className="w-6 h-6" />
                    )}
                    <span className="hidden lg:block text-base font-medium">Profile</span>
                 </Link>

                {user.role === 'admin' && (
                     <Link to="/admin" className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${getNavItemClass('/admin')}`}>
                        <Shield className="w-6 h-6" />
                        <span className="hidden lg:block text-base font-medium">Admin</span>
                     </Link>
                )}
            </nav>
         </div>

         {/* Bottom Actions */}
         <div className="flex flex-col gap-2 pb-6">
             <button 
                onClick={toggleTheme} 
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left text-gray-700 dark:text-gray-300"
             >
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                <span className="hidden lg:block text-base font-medium">Appearance</span>
             </button>

             <button 
                onClick={() => { if(confirm("Log out?")) logout(); }} 
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left text-red-500"
             >
                <LogOut className="w-6 h-6" />
                 <span className="hidden lg:block text-base font-medium">Log out</span>
             </button>
         </div>
      </aside>

      {/* 
        MOBILE HEADER (Top) - Only Visible on Mobile
      */}
      <header className="sm:hidden sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 h-14 flex items-center justify-between shadow-sm">
        <Link to="/" className="text-xl font-serif italic font-bold flex items-center gap-2">
          <img src="/logo-192.jpg" alt="Sekeluarga" className="w-7 h-7 rounded-lg object-cover" />
          Sekeluarga
        </Link>
        <div className="flex items-center gap-3">
             <button onClick={toggleTheme} className="p-2">
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
             </button>
            <button onClick={() => { if(confirm("Log out?")) logout(); }} className="p-2 text-red-500">
                <LogOut className="w-6 h-6" />
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-0 sm:p-8 mb-16 sm:mb-0 min-h-screen">
          {children}
      </main>

      {/* 
         MOBILE BOTTOM NAV (Bottom) - Only Visible on Mobile
      */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 h-14 sm:hidden z-50 px-6 flex items-center justify-around">
        <Link to="/" className={`p-2.5 rounded-xl transition-all ${isActive('/') ? 'bg-black dark:bg-white' : ''}`}>
          <Home className={`w-6 h-6 ${isActive('/') ? 'text-white dark:text-black' : 'text-gray-700 dark:text-gray-300'}`} />
        </Link>
        <Link to="/upload" className={`p-2.5 rounded-xl transition-all ${isActive('/upload') ? 'bg-black dark:bg-white' : ''}`}>
          <PlusSquare className={`w-6 h-6 ${isActive('/upload') ? 'text-white dark:text-black' : 'text-gray-700 dark:text-gray-300'}`} />
        </Link>
        <Link to="/profile" className={`p-2.5 rounded-xl transition-all ${isActive('/profile') ? 'bg-black dark:bg-white' : ''}`}>
           {user.avatarUrl ? (
                <img src={user.avatarUrl} className={`w-6 h-6 rounded-full ${isActive('/profile') ? 'ring-2 ring-black dark:ring-white' : ''}`} />
            ) : (
                <User className={`w-6 h-6 ${isActive('/profile') ? 'text-white dark:text-black' : 'text-gray-700 dark:text-gray-300'}`} />
            )}
        </Link>
        {user.role === 'admin' && (
             <Link to="/admin" className={`p-2.5 rounded-xl transition-all ${isActive('/admin') ? 'bg-black dark:bg-white' : ''}`}>
                <Shield className={`w-6 h-6 ${isActive('/admin') ? 'text-white dark:text-black' : 'text-gray-700 dark:text-gray-300'}`} />
             </Link>
        )}
      </nav>

    </div>
  );
};
