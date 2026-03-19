export async function handleOrders(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);

  // GET /api/orders — list all orders
  if (url.pathname === '/api/orders' && request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT id, status, total, created_at FROM orders ORDER BY created_at DESC'
    ).all<{ id: number; status: string; total: number; created_at: string }>();

    return Response.json(results);
  }

  // GET /api/orders/:id — single order with items
  const matchSingle = url.pathname.match(/^\/api\/orders\/(\d+)$/);
  if (matchSingle && request.method === 'GET') {
    const order = await env.DB.prepare(
      'SELECT id, status, total, created_at FROM orders WHERE id = ?'
    )
      .bind(matchSingle[1])
      .first<{ id: number; status: string; total: number; created_at: string }>();

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const { results: items } = await env.DB.prepare(
      'SELECT oi.id, oi.quantity, oi.unit_price, mi.name FROM order_items oi JOIN menu_items mi ON oi.menu_item_id = mi.id WHERE oi.order_id = ?'
    )
      .bind(order.id)
      .all();

    return Response.json({ ...order, items });
  }

  // POST /api/orders — create a new order
  if (url.pathname === '/api/orders' && request.method === 'POST') {
    return handleCreateOrder(request, env);
  }

  // PATCH /api/orders/:id/status — update order status
  const matchStatus = url.pathname.match(/^\/api\/orders\/(\d+)\/status$/);
  if (matchStatus && request.method === 'PATCH') {
    return handleUpdateOrderStatus(request, env, matchStatus[1]);
  }

  return null; // not handled by this route
}

async function handleCreateOrder(request: Request, env: Env): Promise<Response> {
  let body: { items?: { menu_item_id: number; quantity: number }[] };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.items?.length) {
    return Response.json({ error: 'Order must contain at least one item' }, { status: 400 });
  }

  // Calculate total from DB prices (never trust client-side prices)
  const placeholders = body.items.map(() => '?').join(', ');
  const ids = body.items.map((i) => i.menu_item_id);
  const { results: menuItems } = await env.DB.prepare(
    `SELECT id, price FROM menu_items WHERE id IN (${placeholders}) AND available = 1`
  )
    .bind(...ids)
    .all<{ id: number; price: number }>();

  if (menuItems.length !== body.items.length) {
    return Response.json({ error: 'One or more items are unavailable or do not exist' }, { status: 400 });
  }

  const priceMap = Object.fromEntries(menuItems.map((m) => [m.id, m.price]));
  const total = body.items.reduce((sum, i) => sum + priceMap[i.menu_item_id] * i.quantity, 0);

  const order = await env.DB.prepare(
    'INSERT INTO orders (status, total) VALUES (?, ?) RETURNING id'
  )
    .bind('pending', total)
    .first<{ id: number }>();

  if (!order) {
    return Response.json({ error: 'Failed to create order' }, { status: 500 });
  }

  const insertStatements = body.items.map((item) =>
    env.DB.prepare('INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES (?, ?, ?, ?)')
      .bind(order.id, item.menu_item_id, item.quantity, priceMap[item.menu_item_id])
  );

  await env.DB.batch(insertStatements);

  return Response.json({ id: order.id, status: 'pending', total }, { status: 201 });
}

async function handleUpdateOrderStatus(request: Request, env: Env, orderId: string): Promise<Response> {
  let body: { status?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!body.status || !validStatuses.includes(body.status)) {
    return Response.json({ error: `Status must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
  }

  const result = await env.DB.prepare(
    'UPDATE orders SET status = ? WHERE id = ? RETURNING id, status'
  )
    .bind(body.status, orderId)
    .first();

  if (!result) {
    return Response.json({ error: 'Order not found' }, { status: 404 });
  }

  return Response.json(result);
}
