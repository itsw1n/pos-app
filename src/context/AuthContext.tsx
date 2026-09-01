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
import {
  deleteLocalUser,
  getLocalUsers,
  upsertLocalUser,
} from '../services/sqlite';
import { User, UserRole } from '../types/entities';

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isHydrating: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function toAppUser(profile: StoredUserProfile): User {
  return {
    user_id: profile.user_id,
    username: profile.username,
    role: profile.role,
    is_active: profile.is_active,
  };
}

/**
 * Persist the signed-in app profile to the local cache so a later cold start
 * can restore the session while offline. Best-effort; never blocks login.
 */
async function persistProfile(profile: StoredUserProfile): Promise<void> {
  try {
    await upsertLocalUser({
      user_id: profile.user_id,
      username: profile.username,
      role: profile.role,
      is_active: profile.is_active ? 1 : 0,
    });
  } catch {
    // Cache write is best-effort.
  }
}

/**
 * Fall back to the cached profile when the remote profile fetch fails
 * (no connectivity). Matches by the Supabase session user id so the restored
 * session belongs to the same account; returns undefined when absent.
 */
async function resolveProfileOffline(
  userId: string,
): Promise<StoredUserProfile | undefined> {
  try {
    const cached = await getLocalUsers();
    const match = cached.find((user) => user.user_id === userId);
    if (match?.is_active === 1) {
      return {
        user_id: match.user_id,
        username: match.username,
        role: match.role,
        is_active: true,
      };
    }
  } catch {
    // No local cache yet; the app falls back to the login screen.
  }
  return undefined;
}

async function removeCachedProfile(userId: string): Promise<void> {
  try {
    await deleteLocalUser(userId);
  } catch {
    // Cache cleanup is best-effort.
  }
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  const applyProfile = useCallback((profile: StoredUserProfile): void => {
    const nextUser = toAppUser(profile);
    setUser(nextUser);
    setRole(nextUser.role);
  }, []);

  const clearProfile = useCallback((): void => {
    setUser(null);
    setRole(null);
  }, []);

  const rejectInvalidProfile = useCallback(
    async (userId: string): Promise<void> => {
      await removeCachedProfile(userId);
      try {
        await signOut();
      } catch {
        // Clear application access even if a remote sign-out cannot complete.
      }
      clearProfile();
    },
    [clearProfile],
  );

  const login = async (username: string, password: string): Promise<void> => {
    const authUser = await signInWithPassword(username, password);
    const profile = await getUserProfile(authUser.id);
    if (!profile || !profile.is_active) {
      await rejectInvalidProfile(authUser.id);
      throw new Error('This account is disabled or has no application profile');
    }
    await persistProfile(profile);
    applyProfile(profile);
  };

  const logout = async (): Promise<void> => {
    await signOut();
    clearProfile();
  };

  useEffect(() => {
    let active = true;

    getSession()
      .then(async (session) => {
        if (!active) return;
        if (session) {
          let profile: StoredUserProfile | undefined;
          let remoteUnavailable = false;
          try {
            profile = (await getUserProfile(session.user.id)) ?? undefined;
          } catch {
            remoteUnavailable = true;
          }
          if (remoteUnavailable) {
            profile = await resolveProfileOffline(session.user.id);
          }
          if (!profile || !profile.is_active) {
            await rejectInvalidProfile(session.user.id);
          } else {
            await persistProfile(profile);
            if (active) applyProfile(profile);
          }
        }
        return undefined;
      })
      .finally(() => {
        if (active) setIsHydrating(false);
      });

    const { data: subscription } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (active) {
          clearProfile();
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        getCurrentUser()
          .then(async (authUser) => {
            if (!authUser) return;
            let profile: StoredUserProfile | undefined;
            let remoteUnavailable = false;
            try {
              profile = (await getUserProfile(authUser.id)) ?? undefined;
            } catch {
              remoteUnavailable = true;
            }
            if (remoteUnavailable) {
              profile = await resolveProfileOffline(authUser.id);
            }
            if (!profile || !profile.is_active) {
              await rejectInvalidProfile(authUser.id);
            } else {
              await persistProfile(profile);
              if (active) applyProfile(profile);
            }
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
  }, [applyProfile, clearProfile, rejectInvalidProfile]);

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
