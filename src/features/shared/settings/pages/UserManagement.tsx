import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from '@/components/common/Button/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { TextField } from '@/components/common/TextField/TextField';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';
import { User } from '@/types/entities';
import { useUsers } from '@/features/shared/settings/hooks/useUsers';
import { userManagementStyles } from './UserManagement.styles';

type UserManagementProps = {
  style?: StyleProp<ViewStyle>;
};

interface NewUserForm {
  username: string;
  password: string;
  role: 'admin' | 'cashier';
}

export function UserManagement({
  style,
}: UserManagementProps): React.JSX.Element {
  const { role } = useAuth();
  const { users, isLoading, error, loadUsers, createUser, setUserActive } =
    useUsers();
  const [form, setForm] = useState<NewUserForm>({
    username: '',
    password: '',
    role: 'cashier',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [pendingToggle, setPendingToggle] = useState<User | null>(null);

  const pendingWillDisable =
    pendingToggle !== null && pendingToggle.is_active !== false;

  useFocusEffect(
    useCallback(() => {
      void loadUsers();
    }, [loadUsers]),
  );

  if (role !== 'admin') {
    return (
      <View
        style={[
          userManagementStyles.container,
          userManagementStyles.centered,
          style,
        ]}
      >
        <Text style={userManagementStyles.errorText}>
          Admin access required
        </Text>
      </View>
    );
  }

  const formIsValid =
    form.username.trim().length > 0 && form.password.length > 0;

  const handleCreate = async (): Promise<void> => {
    if (!formIsValid || isSubmitting) return;
    setFormError('');
    setIsSubmitting(true);
    try {
      await createUser(form);
      setForm({ username: '', password: '', role: 'cashier' });
      void loadUsers();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to create user',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmToggle = (): void => {
    if (!pendingToggle) return;
    const user = pendingToggle;
    const willDisable = pendingWillDisable;
    setPendingToggle(null);
    setTogglingId(user.user_id);
    setUserActive(user.user_id, !willDisable)
      .catch((err) => {
        setFormError(
          err instanceof Error ? err.message : 'Could not update user',
        );
      })
      .finally(() => setTogglingId(null));
  };

  const renderItem = ({ item }: { item: User }): React.JSX.Element => {
    const active = item.is_active !== false;
    return (
      <View style={userManagementStyles.userCard}>
        <View style={userManagementStyles.userInfo}>
          <Text style={userManagementStyles.userName}>{item.username}</Text>
          <Text style={userManagementStyles.userMeta}>
            {item.role === 'admin' ? 'Administrator' : 'Cashier'}
          </Text>
        </View>
        <View
          style={[
            userManagementStyles.statusBadge,
            active
              ? userManagementStyles.statusBadgeActive
              : userManagementStyles.statusBadgeInactive,
          ]}
        >
          <Text style={userManagementStyles.statusBadgeText}>
            {active ? 'Active' : 'Disabled'}
          </Text>
        </View>
        <Button
          variant={active ? 'outline' : 'secondary'}
          size="small"
          disabled={togglingId === item.user_id}
          onPress={() => setPendingToggle(item)}
          style={userManagementStyles.toggleButton}
        >
          {togglingId === item.user_id ? '...' : active ? 'Disable' : 'Enable'}
        </Button>
      </View>
    );
  };

  if (isLoading && users.length === 0) {
    return (
      <View
        style={[
          userManagementStyles.container,
          userManagementStyles.centered,
          style,
        ]}
      >
        <Text style={userManagementStyles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={[userManagementStyles.container, style]}>
      <FlatList
        data={users}
        keyExtractor={(item) => String(item.user_id)}
        renderItem={renderItem}
        contentContainerStyle={userManagementStyles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Text style={userManagementStyles.sectionLabel}>
              Create Account
            </Text>
            <View style={userManagementStyles.formCard}>
              <TextField
                label="Username"
                value={form.username}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, username: text }))
                }
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Cashier username"
              />
              <TextField
                label="Password"
                value={form.password}
                onChangeText={(text) =>
                  setForm((prev) => ({ ...prev, password: text }))
                }
                secureTextEntry
                placeholder="Password"
              />
              <View style={userManagementStyles.roleRow}>
                <Button
                  variant={form.role === 'cashier' ? 'primary' : 'outline'}
                  size="small"
                  style={userManagementStyles.roleButton}
                  onPress={() =>
                    setForm((prev) => ({ ...prev, role: 'cashier' }))
                  }
                >
                  Cashier
                </Button>
                <Button
                  variant={form.role === 'admin' ? 'primary' : 'outline'}
                  size="small"
                  style={userManagementStyles.roleButton}
                  onPress={() =>
                    setForm((prev) => ({ ...prev, role: 'admin' }))
                  }
                >
                  Admin
                </Button>
              </View>
              {formError ? (
                <Text style={userManagementStyles.errorText}>{formError}</Text>
              ) : null}
              <Button
                variant="primary"
                size="medium"
                disabled={!formIsValid || isSubmitting}
                onPress={handleCreate}
                style={userManagementStyles.createButton}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  'Create User'
                )}
              </Button>
            </View>
            {error ? (
              <Text style={userManagementStyles.errorText}>{error}</Text>
            ) : null}
            <Text style={userManagementStyles.sectionLabel}>
              Accounts ({users.length})
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={userManagementStyles.emptyContainer}>
            <Text style={userManagementStyles.emptyText}>No accounts yet</Text>
          </View>
        }
      />
      <ConfirmDialog
        visible={pendingToggle !== null}
        title={pendingWillDisable ? 'Disable user' : 'Enable user'}
        message={
          pendingToggle
            ? `Set "${pendingToggle.username}" ${pendingWillDisable ? 'inactive' : 'active'}?`
            : ''
        }
        confirmLabel={pendingWillDisable ? 'Disable' : 'Enable'}
        destructive={pendingWillDisable}
        onConfirm={confirmToggle}
        onCancel={() => setPendingToggle(null)}
      />
    </View>
  );
}
