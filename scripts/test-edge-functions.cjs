/* Integration tests for local account-management Edge Functions. */
'use strict';

const { createClient } = require('@supabase/supabase-js');

const apiUrl = process.env.SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertLocalEnvironment() {
  if (!apiUrl || !anonKey || !serviceRoleKey) {
    throw new Error(
      'Local Supabase URL, anon key, and service-role key are required',
    );
  }
  const host = new URL(apiUrl).hostname;
  if (!['127.0.0.1', 'localhost', '::1'].includes(host)) {
    throw new Error(
      'Refusing to run account integration tests outside local Supabase',
    );
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function functionErrorMessage(error) {
  if (!error) return '';
  if (error.context instanceof Response) {
    try {
      const body = await error.context.json();
      if (typeof body?.error === 'string') return body.error;
    } catch {
      // Fall back to the client error below.
    }
  }
  return error.message ?? String(error);
}

async function main() {
  assertLocalEnvironment();

  const adminClient = createClient(apiUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const cashierClient = createClient(apiUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const serviceClient = createClient(apiUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: adminLoginError } = await adminClient.auth.signInWithPassword({
    email: 'admin@elvira.cafe',
    password: 'admin123',
  });
  assert(!adminLoginError, `Admin login failed: ${adminLoginError?.message}`);

  const createdUserIds = [];
  const testEmail = 'integration-test-user@elvira.cafe';
  const escalationEmail = 'integration-escalation@elvira.cafe';

  async function removeTestAccount(email, userId) {
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      const { data } = await serviceClient
        .from('user')
        .select('user_id')
        .eq('username', email)
        .maybeSingle();
      resolvedUserId = data?.user_id;
    }
    if (!resolvedUserId) return;
    await serviceClient.from('user').delete().eq('user_id', resolvedUserId);
    await serviceClient.auth.admin.deleteUser(resolvedUserId);
  }

  await Promise.all([
    removeTestAccount(testEmail),
    removeTestAccount(escalationEmail),
  ]);

  const { data: cashierProfile, error: cashierProfileError } =
    await serviceClient
      .from('user')
      .select('user_id')
      .eq('username', 'cashier')
      .single();
  assert(
    !cashierProfileError,
    cashierProfileError?.message ?? 'Cashier missing',
  );

  let cashierDisabled = false;
  try {
    const { data: createdUser, error: createError } =
      await adminClient.functions.invoke('create-user', {
        body: {
          username: testEmail,
          password: 'integration123',
          role: 'cashier',
        },
      });
    assert(
      !createError,
      `Create-user function failed: ${await functionErrorMessage(createError)}`,
    );
    assert(createdUser?.user_id, 'Create-user did not return a user ID');
    createdUserIds.push(createdUser.user_id);

    const temporaryClient = createClient(apiUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: temporaryLoginError } =
      await temporaryClient.auth.signInWithPassword({
        email: testEmail,
        password: 'integration123',
      });
    assert(!temporaryLoginError, 'The newly created cashier could not sign in');
    await temporaryClient.auth.signOut();

    const { error: disableError } = await adminClient.functions.invoke(
      'set-user-active',
      {
        body: { user_id: cashierProfile.user_id, is_active: false },
      },
    );
    assert(
      !disableError,
      `Disable function failed: ${await functionErrorMessage(disableError)}`,
    );
    cashierDisabled = true;

    const { data: disabledProfile } = await serviceClient
      .from('user')
      .select('is_active')
      .eq('user_id', cashierProfile.user_id)
      .single();
    assert(disabledProfile?.is_active === false, 'Profile was not disabled');

    const { error: bannedLoginError } =
      await cashierClient.auth.signInWithPassword({
        email: 'cashier@elvira.cafe',
        password: 'cashier123',
      });
    assert(bannedLoginError, 'A disabled Auth user was still able to sign in');

    const { error: enableError } = await adminClient.functions.invoke(
      'set-user-active',
      {
        body: { user_id: cashierProfile.user_id, is_active: true },
      },
    );
    assert(
      !enableError,
      `Enable function failed: ${await functionErrorMessage(enableError)}`,
    );
    cashierDisabled = false;

    const { error: cashierLoginError } =
      await cashierClient.auth.signInWithPassword({
        email: 'cashier@elvira.cafe',
        password: 'cashier123',
      });
    assert(!cashierLoginError, 'A re-enabled Auth user could not sign in');

    const { data: adminProfile, error: adminProfileError } = await serviceClient
      .from('user')
      .select('user_id')
      .eq('username', 'admin')
      .single();
    assert(!adminProfileError, adminProfileError?.message ?? 'Admin missing');

    const { data: escalationUser, error: createAdminError } =
      await cashierClient.functions.invoke('create-user', {
        body: {
          username: escalationEmail,
          password: 'integration123',
          role: 'admin',
        },
      });
    if (escalationUser?.user_id) createdUserIds.push(escalationUser.user_id);
    assert(createAdminError, 'A cashier was able to create an admin account');

    const { error: cashierEscalationError } =
      await cashierClient.functions.invoke('set-user-active', {
        body: { user_id: adminProfile?.user_id, is_active: false },
      });
    assert(
      cashierEscalationError,
      'A cashier was able to invoke the admin account-status function',
    );

    const { error: selfDisableError } = await adminClient.functions.invoke(
      'set-user-active',
      {
        body: { user_id: adminProfile?.user_id, is_active: false },
      },
    );
    assert(selfDisableError, 'An admin was able to disable their own account');
  } finally {
    if (cashierDisabled) {
      await adminClient.functions.invoke('set-user-active', {
        body: { user_id: cashierProfile.user_id, is_active: true },
      });
    }
    await Promise.all(
      createdUserIds.map((userId) => removeTestAccount('', userId)),
    );
    await Promise.all([
      adminClient.auth.signOut(),
      cashierClient.auth.signOut(),
    ]);
  }

  process.stdout.write('Edge Function integration tests passed\n');
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Edge Function integration tests failed: ${message}\n`);
  process.exitCode = 1;
});
