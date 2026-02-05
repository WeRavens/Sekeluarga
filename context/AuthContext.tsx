import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';
import { dbService } from '../services/db';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string, fullName: string) => Promise<{ ok: boolean; reason?: 'exists' | 'db' }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
        // Check for existing session
        let storedUser = storageService.getCurrentUser();
        
        if (storedUser) {
          // If we have a stored session, verify/refresh it against the DB
          // This ensures if the user updated their profile (avatar), we get the latest
          try {
              const dbUser = await dbService.getUserById(storedUser.id);
              if (dbUser) {
                  storedUser = dbUser;
                  // Update local storage with fresh data
                  storageService.setCurrentUser(dbUser);
              }
          } catch(e) {
              // Ignore DB errors, stick with local
          }
          setUser(storedUser);
        }
        setIsLoading(false);
    };

    initSession();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // 1. Fetch from All Sources
    const dbUsers = await dbService.getUsers();
    const localUsers = storageService.getUsers();

    // 2. Merge lists (DB updates valid users, Local ensures Admin/Seed users exist)
    const userMap = new Map<string, User>();
    
    // Add local first
    localUsers.forEach(u => userMap.set(u.username, u));
    
    // Overwrite with DB (so if a user exists in both, DB is the source of truth)
    dbUsers.forEach(u => userMap.set(u.username, u));

    // Convert back to array
    const allUsers = Array.from(userMap.values());

    const foundUser = allUsers.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      setUser(foundUser);
      storageService.setCurrentUser(foundUser);
      return true;
    }
    return false;
  };

  const signup = async (username: string, password: string, fullName: string): Promise<{ ok: boolean; reason?: 'exists' | 'db' }> => {
    // Check DB for existing user
    let users = await dbService.getUsers();
    if (users.length === 0) users = storageService.getUsers();

    if (users.some(u => u.username === username)) {
      return { ok: false, reason: 'exists' }; // User exists
    }

    const newUser: User = {
      id: `u${Date.now()}`,
      username,
      password,
      fullName,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
      bio: 'New family member'
    };

    // Save to both DB and Local
    const dbSuccess = await dbService.createUser(newUser); 
    if (!dbSuccess) {
      console.error("Gagal menyimpan user ke Database Supabase. Pastikan tabel 'users' sudah dibuat dan RLS Policy sudah di-set.");
      return { ok: false, reason: 'db' }; 
    }

    storageService.createUser(newUser);
    
    setUser(newUser);
    storageService.setCurrentUser(newUser);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    storageService.setCurrentUser(null);
  };

  const refreshUser = async () => {
    try {
      const current = storageService.getCurrentUser();
      if (!current) return;
      const dbUser = await dbService.getUserById(current.id);
      const nextUser = dbUser || current;
      setUser(nextUser);
      storageService.setCurrentUser(nextUser);
      storageService.updateUser(nextUser);
    } catch (e) {
      // ignore refresh errors
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
