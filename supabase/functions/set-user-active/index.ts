import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let body: { user_id?: string; is_active?: boolean };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.user_id || typeof body.is_active !== 'boolean') {
    return jsonResponse({ error: 'user_id and is_active are required' }, 400);
  }

  const authorization = req.headers.get('authorization');
  if (!authorization) return jsonResponse({ error: 'Unauthorized' }, 401);

  const caller = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
  const { data: callerRole, error: roleError } =
    await caller.rpc('get_app_role');
  if (roleError || callerRole !== 'admin') {
    return jsonResponse({ error: 'Admin access required' }, 403);
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data: target, error: targetError } = await admin
    .from('user')
    .select('is_active')
    .eq('user_id', body.user_id)
    .maybeSingle();
  if (targetError) return jsonResponse({ error: targetError.message }, 500);
  if (!target) return jsonResponse({ error: 'User not found' }, 404);

  const { error: profileError } = await caller.rpc('set_user_active', {
    p_user_id: body.user_id,
    p_active: body.is_active,
  });
  if (profileError) return jsonResponse({ error: profileError.message }, 400);

  const { error: authError } = await admin.auth.admin.updateUserById(
    body.user_id,
    { ban_duration: body.is_active ? 'none' : '876000h' },
  );
  if (authError) {
    await admin
      .from('user')
      .update({ is_active: target.is_active })
      .eq('user_id', body.user_id);
    return jsonResponse({ error: authError.message }, 500);
  }

  return jsonResponse(
    { user_id: body.user_id, is_active: body.is_active },
    200,
  );
});
