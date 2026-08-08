import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...extraHeaders,
    },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let body: { username?: string; password?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const username = body.username?.trim();
  const password = body.password;
  const role = body.role;

  if (!username || !password) {
    return jsonResponse({ error: 'username and password are required' }, 400);
  }
  if (role !== 'admin' && role !== 'cashier') {
    return jsonResponse({ error: 'role must be admin or cashier' }, 400);
  }

  // Only admins may provision (or deprovision) user accounts. The caller's JWT
  // is validated against get_app_role() so a cashier cannot escalate to admin
  // by invoking this function directly.
  const authorization = req.headers.get('authorization');
  if (!authorization) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  const caller = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
  const { data: callerRole, error: roleError } = await caller.rpc(
    'get_app_role',
  );
  if (roleError || callerRole !== 'admin') {
    return jsonResponse({ error: 'Admin access required' }, 403);
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
    return jsonResponse({ error: authError.message }, 400);
  }

  const { error: profileError } = await admin.from('user').insert({
    user_id: authUser.user.id,
    username,
    password: null,
    role,
    is_active: true,
  });
  if (profileError) {
    return jsonResponse({ error: profileError.message }, 500);
  }

  return jsonResponse({ user_id: authUser.user.id }, 201);
});
