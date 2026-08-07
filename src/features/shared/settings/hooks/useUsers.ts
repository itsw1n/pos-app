import { useCallback, useState } from 'react';
import { supabase } from '@/services/supabase';
import { User, UserRole } from '@/types/entities';

export interface UserPayload {
  username: string;
  password: string;
  role: UserRole;
}

export interface UseUsersResult {
  users: User[];
  isLoading: boolean;
  error: string;
  loadUsers: () => Promise<void>;
  createUser: (payload: UserPayload) => Promise<User>;
  setUserActive: (userId: number, isActive: boolean) => Promise<void>;
}

function validatePayload(payload: UserPayload): void {
  if (!payload.username.trim()) {
    throw new Error('Username is required');
  }
  if (!payload.password) {
    throw new Error('Password is required');
  }
  if (payload.role !== 'admin' && payload.role !== 'cashier') {
    throw new Error('Role must be admin or cashier');
  }
}

export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error: loadError } = await supabase
        .from('user')
        .select('*')
        .order('username', { ascending: true });
      if (loadError) throw loadError;
      setUsers((data as User[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(
    async (payload: UserPayload): Promise<User> => {
      validatePayload(payload);
      const { data, error: insertError } = await supabase
        .from('user')
        .insert({
          username: payload.username.trim(),
          password: payload.password,
          role: payload.role,
          is_active: true,
        })
        .select()
        .single();
      if (insertError) throw insertError;
      const created = data as User;
      setUsers((prev) => [...prev, created]);
      return created;
    },
    [],
  );

  const setUserActive = useCallback(
    async (userId: number, isActive: boolean): Promise<void> => {
      const { error: updateError } = await supabase
        .from('user')
        .update({ is_active: isActive })
        .eq('user_id', userId);
      if (updateError) throw updateError;
      setUsers((prev) =>
        prev.map((user) =>
          user.user_id === userId ? { ...user, is_active: isActive } : user,
        ),
      );
    },
    [],
  );

  return { users, isLoading, error, loadUsers, createUser, setUserActive };
}
