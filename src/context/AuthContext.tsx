import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../services/supabase';
import { User, UserRole } from '../types/entities';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const login = async (username: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });
    if (error) throw error;

    const { data: profile } = await supabase
      .from('user')
      .select('user_id, username, role')
      .eq('user_id', data.user.id)
      .single();

    setUser({
      user_id: profile?.user_id,
      username: profile?.username ?? username,
      password: '',
      role: profile?.role ?? 'cashier',
    });
    setRole(profile?.role ?? 'cashier');
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
