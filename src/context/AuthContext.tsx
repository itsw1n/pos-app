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
import { getLocalUsers, upsertLocalUser } from '../services/sqlite';
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

/**
 * Persist the signed-in app profile to the local cache so a later cold start
 * can restore the session while offline. Best-effort; never blocks login.
 */
async function persistProfile(
  profile: StoredUserProfile | undefined,
): Promise<void> {
  if (!profile) return;
  try {
    await upsertLocalUser({
      user_id: String(profile.user_id),
      username: profile.username,
      role: profile.role,
    });
  } catch {
    // Cache write is best-effort.
  }
}

/**
 * Fall back to the cached profile when the remote profile fetch fails
 * (no connectivity). Prefers a username matching the session email, else the
 * only/most-recent cached user.
 */
async function resolveProfileOffline(
  email: string,
): Promise<StoredUserProfile | undefined> {
  try {
    const cached = await getLocalUsers();
    const match = cached.find((user) => user.username === email) ?? cached[0];
    if (match) {
      return {
        user_id: match.user_id as unknown as number,
        username: match.username,
        role: match.role,
      };
    }
  } catch {
    // No local cache yet; the app falls back to the login screen.
  }
  return undefined;
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
    await persistProfile(profile ?? undefined);
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
      .then(async (session) => {
        if (!active) return;
        if (session) {
          const email = session.user.email ?? '';
          let profile: StoredUserProfile | undefined;
          try {
            profile = (await getUserProfile(session.user.id)) ?? undefined;
            await persistProfile(profile);
          } catch {
            profile = undefined;
          }
          if (!profile) {
            profile = await resolveProfileOffline(email);
          }
          if (active) applyProfile(profile, email);
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
        getCurrentUser()
          .then(async (authUser) => {
            if (!authUser) return;
            const email = authUser.email ?? '';
            let profile: StoredUserProfile | undefined;
            try {
              profile = (await getUserProfile(authUser.id)) ?? undefined;
              await persistProfile(profile);
            } catch {
              profile = undefined;
            }
            if (!profile) {
              profile = await resolveProfileOffline(email);
            }
            if (active) applyProfile(profile, email);
          })
          .catch(() => {
            // Profile resolution failed; session state drives navigation.
          });
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
