import type {
  AuthChangeEvent,
  Session,
  Subscription,
  User,
} from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { UserRole } from '../types/entities';

/**
 * App-level profile row for the authenticated Supabase user. `user.user_id`
 * mirrors the Supabase Auth UUID (`auth.users.id`).
 */
export interface StoredUserProfile {
  user_id: string;
  username: string;
  role: UserRole;
}

export type AuthStateListener = (
  event: AuthChangeEvent,
  session: Session | null,
) => void;

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
}

export async function getUserProfile(
  userId: string,
): Promise<StoredUserProfile | null> {
  const { data, error } = await supabase
    .from('user')
    .select('user_id, username, role')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as StoredUserProfile | undefined) ?? null;
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: 'com.elvira.pos://reset-password',
  });
  if (error) throw error;
}

export async function confirmPasswordReset(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export function onAuthStateChange(callback: AuthStateListener): {
  data: { subscription: Subscription };
} {
  return supabase.auth.onAuthStateChange(callback);
}
