import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: { username?: string; password?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const username = body.username?.trim();
  const password = body.password;
  const role = body.role;

  if (!username || !password) {
    return new Response(
      JSON.stringify({ error: 'username and password are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  if (role !== 'admin' && role !== 'cashier') {
    return new Response(
      JSON.stringify({ error: 'role must be admin or cashier' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: authUser, error: authError } =
    await admin.auth.admin.createUser({
      email: username,
      password,
      email_confirm: true,
      user_metadata: { role },
    });
  if (authError) {
    return new Response(JSON.stringify({ error: authError.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error: profileError } = await admin.from('user').insert({
    user_id: authUser.user.id,
    username,
    password: null,
    role,
    is_active: true,
  });
  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ user_id: authUser.user.id }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
});
