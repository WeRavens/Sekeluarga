import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';
import { dbService } from '../services/db';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => void;
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

  const signup = async (username: string, password: string, fullName: string): Promise<boolean> => {
    // Check DB for existing user
    let users = await dbService.getUsers();
    if (users.length === 0) users = storageService.getUsers();

    if (users.some(u => u.username === username)) {
      return false; // User exists
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
    await dbService.createUser(newUser); 
    storageService.createUser(newUser);
    
    setUser(newUser);
    storageService.setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    storageService.setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
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
