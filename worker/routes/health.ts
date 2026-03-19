export async function handleHealth(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);

  if (url.pathname !== '/api/health' || request.method !== 'GET') {
    return null;
  }

  const [userCount, menuCount] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>(),
    env.DB.prepare('SELECT COUNT(*) as count FROM menu_items').first<{ count: number }>(),
  ]);

  return Response.json({
    status: 'ok',
    db: 'connected',
    users: userCount?.count ?? 0,
    menu_items: menuCount?.count ?? 0,
  });
}
