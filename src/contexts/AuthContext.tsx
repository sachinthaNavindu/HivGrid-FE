import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authAPI, profileAPI, postsAPI, setTokens, clearTokens, getAccessToken } from '@/services/api';

interface AuthContextType {
  user: User | null;
  postCount: number
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string,code:string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  sendVerificationCode:(email:string)=> Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [postCount,setPostCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const response = await postsAPI.loadUserData();
          setUser(response.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          clearTokens();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    setTokens(response.data.accessToken, response.data.refreshToken);
    
    const userData = await postsAPI.loadUserData();
    setUser(userData.user);
  };

  const sendVerificationCode = async(email:string)=>{
    await authAPI.sendVerificationCode(email)
  }

  const register = async (email: string, password: string, username: string, code:string) => {
    await authAPI.register(email, password, username,code);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        postCount,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        sendVerificationCode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
