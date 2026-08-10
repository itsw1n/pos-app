import { useCallback, useState } from 'react';
import {
  createUser as createRemoteUser,
  getUsers,
  setUserActive as setRemoteUserActive,
  UserPayload,
} from '@/api/userApi';
import { User } from '@/types/entities';

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
      setUsers(await getUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(
    async (payload: UserPayload): Promise<User> => {
      validatePayload(payload);
      const created = await createRemoteUser(payload);
      setUsers((prev) => [...prev, created]);
      return created;
    },
    [],
  );

  const setUserActive = useCallback(
    async (userId: number, isActive: boolean): Promise<void> => {
      await setRemoteUserActive(userId, isActive);
      setUsers((prev) =>
        prev.map((user) =>
          String(user.user_id) === String(userId)
            ? { ...user, is_active: isActive }
            : user,
        ),
      );
    },
    [],
  );

  return { users, isLoading, error, loadUsers, createUser, setUserActive };
}
