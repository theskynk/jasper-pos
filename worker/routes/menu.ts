export async function handleMenu(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);

  // GET /api/menu — list all menu items
  if (url.pathname === '/api/menu' && request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT id, name, description, price, category, available FROM menu_items ORDER BY category, name'
    ).all<{ id: number; name: string; description: string; price: number; category: string; available: number }>();

    return Response.json(results);
  }

  // GET /api/menu/:id — single menu item
  const matchSingle = url.pathname.match(/^\/api\/menu\/(\d+)$/);
  if (matchSingle && request.method === 'GET') {
    const item = await env.DB.prepare(
      'SELECT id, name, description, price, category, available FROM menu_items WHERE id = ?'
    )
      .bind(matchSingle[1])
      .first();

    if (!item) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }
    return Response.json(item);
  }

  return null; // not handled by this route
}
