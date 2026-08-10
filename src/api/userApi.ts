import { supabase } from '../services/supabase';
import { User, UserRole } from '../types/entities';

export interface UserPayload {
  username: string;
  password: string;
  role: UserRole;
}

async function errorMessage(err: unknown): Promise<string> {
  if (err instanceof Error) {
    const context = (err as unknown as Record<string, unknown>).context;
    if (context instanceof Response) {
      try {
        const body = (await context.json()) as { error?: string };
        if (typeof body.error === 'string' && body.error.trim()) {
          return body.error;
        }
      } catch {
        // fall through to the generic message
      }
    }
    return err.message;
  }
  return 'Failed to create user';
}

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .order('username', { ascending: true });
  if (error) throw error;
  return (data as User[]) ?? [];
}

export async function getUsersIdName(): Promise<
  { user_id: number; username: string }[]
> {
  const { data, error } = await supabase
    .from('user')
    .select('user_id, username');
  if (error) throw error;
  return (data as { user_id: number; username: string }[]) ?? [];
}

export async function createUser(payload: UserPayload): Promise<User> {
  const { data, error } = await supabase.functions.invoke('create-user', {
    body: {
      username: payload.username.trim(),
      password: payload.password,
      role: payload.role,
    },
  });
  if (error) throw new Error(await errorMessage(error));
  return {
    user_id: typeof data?.user_id === 'string' ? data.user_id : '',
    username: payload.username.trim(),
    password: '',
    role: payload.role,
    is_active: true,
  } as User;
}

export async function setUserActive(
  userId: number,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase.rpc('set_user_active', {
    p_user_id: String(userId),
    p_active: isActive,
  });
  if (error) throw error;
}
