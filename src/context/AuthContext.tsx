import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  getCurrentUser,
  getSession,
  getUserProfile,
  onAuthStateChange,
  signInWithPassword,
  signOut,
  StoredUserProfile,
} from '../api/authApi';
import { User, UserRole } from '../types/entities';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isHydrating: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

type StoredUser = StoredUserProfile;

function toAppUser(
  profile: StoredUser | undefined,
  fallbackUsername: string,
): User {
  return {
    user_id: profile?.user_id ?? 0,
    username: profile?.username ?? fallbackUsername,
    password: '',
    role: profile?.role ?? 'cashier',
  };
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  const applyProfile = useCallback(
    (profile: StoredUser | undefined, fallbackUsername: string): void => {
      const nextUser = toAppUser(profile, fallbackUsername);
      setUser(nextUser);
      setRole(nextUser.role);
    },
    [],
  );

  const login = async (username: string, password: string): Promise<void> => {
    const authUser = await signInWithPassword(username, password);
    const profile = await getUserProfile(authUser.id);
    applyProfile(profile ?? undefined, username);
  };

  const logout = async (): Promise<void> => {
    await signOut();
    setUser(null);
    setRole(null);
  };

  useEffect(() => {
    let active = true;

    getSession()
      .then((session) => {
        if (!active) return;
        if (session) {
          return getCurrentUser().then((authUser) =>
            getUserProfile(authUser?.id ?? '').then((profile) => {
              if (active)
                applyProfile(profile ?? undefined, authUser?.email ?? '');
            }),
          );
        }
        return undefined;
      })
      .finally(() => {
        if (active) setIsHydrating(false);
      });

    const { data: subscription } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (active) {
          setUser(null);
          setRole(null);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        getCurrentUser().then((authUser) =>
          getUserProfile(authUser?.id ?? '').then((profile) => {
            if (active)
              applyProfile(profile ?? undefined, authUser?.email ?? '');
          }),
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
