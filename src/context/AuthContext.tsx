import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { User, UserRole } from '../types/entities';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isHydrating: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

type StoredUser = Pick<User, 'user_id' | 'username' | 'role'>;

function toAppUser(profile: StoredUser | undefined, fallbackUsername: string): User {
  return {
    user_id: profile?.user_id ?? 0,
    username: profile?.username ?? fallbackUsername,
    password: '',
    role: profile?.role ?? 'cashier',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  const applyProfile = useCallback((profile: StoredUser | undefined, fallbackUsername: string): void => {
    const nextUser = toAppUser(profile, fallbackUsername);
    setUser(nextUser);
    setRole(nextUser.role);
  }, []);

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

    applyProfile(profile as StoredUser | undefined, username);
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        if (data.session) {
          return supabase.auth
            .getUser()
            .then(({ data: userData }) =>
              supabase
                .from('user')
                .select('user_id, username, role')
                .eq('user_id', userData.user?.id ?? '')
                .single()
                .then(({ data: profile }) => {
                  if (active) applyProfile(profile as StoredUser | undefined, userData.user?.email ?? '');
                })
            );
        }
        return undefined;
      })
      .finally(() => {
        if (active) setIsHydrating(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (active) {
          setUser(null);
          setRole(null);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        supabase.auth
          .getUser()
          .then(({ data: userData }) =>
            supabase
              .from('user')
              .select('user_id, username, role')
              .eq('user_id', userData.user?.id ?? '')
              .single()
              .then(({ data: profile }) => {
                if (active) applyProfile(profile as StoredUser | undefined, userData.user?.email ?? '');
              })
          );
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [applyProfile]);

  return (
    <AuthContext.Provider value={{ user, role, isHydrating, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
