import { verifyPassword } from '../lib/crypto';

export async function handleAuth(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);

  if (url.pathname === '/api/login' && request.method === 'POST') {
    return handleLogin(request, env);
  }

  if (url.pathname === '/api/logout' && request.method === 'POST') {
    return Response.json({ success: true });
  }

  return null; // not handled by this route
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  let body: { username?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { username, password } = body;

  if (!username || !password) {
    return Response.json({ error: 'Username and password are required' }, { status: 400 });
  }

  const user = await env.DB.prepare(
    'SELECT id, username, password_hash, role FROM users WHERE username = ?'
  )
    .bind(username)
    .first<{ id: number; username: string; password_hash: string; role: string }>();

  if (!user) {
    // Same message for missing user and wrong password to prevent user enumeration
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);
  if (!passwordMatches) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  return Response.json({
    id: user.id,
    username: user.username,
    role: user.role,
  });
}
