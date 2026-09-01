import { useCallback, useState } from 'react';
import {
  createUser as createRemoteUser,
  CreateUserInput,
  getUsers,
  setUserActive as setRemoteUserActive,
} from '@/api/userApi';
import { User } from '@/types/entities';

export interface UseUsersResult {
  users: User[];
  isLoading: boolean;
  error: string;
  loadUsers: () => Promise<void>;
  createUser: (payload: CreateUserInput) => Promise<User>;
  setUserActive: (userId: string, isActive: boolean) => Promise<void>;
}

function validatePayload(payload: CreateUserInput): void {
  if (!payload.username.trim()) {
    throw new Error('Email is required');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.username.trim())) {
    throw new Error('Email must be a full address, e.g. staff@example.com');
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
    async (payload: CreateUserInput): Promise<User> => {
      validatePayload(payload);
      const created = await createRemoteUser(payload);
      setUsers((prev) => [...prev, created]);
      return created;
    },
    [],
  );

  const setUserActive = useCallback(
    async (userId: string, isActive: boolean): Promise<void> => {
      await setRemoteUserActive(userId, isActive);
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
