const IMAGE_PUBLIC_BASE = 'https://pub-YOUR_R2_CUSTOM_DOMAIN.r2.dev'; // replace after enabling R2 public access
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function handleMenu(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);

  // GET /api/menu — list all menu items
  if (url.pathname === '/api/menu' && request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT id, name, description, price, category, available, image_url FROM menu_items ORDER BY category, name'
    ).all<{ id: number; name: string; description: string; price: number; category: string; available: number; image_url: string | null }>();

    return Response.json(results);
  }

  // GET /api/menu/:id — single menu item
  const matchSingle = url.pathname.match(/^\/api\/menu\/(\d+)$/);
  if (matchSingle && request.method === 'GET') {
    const item = await env.DB.prepare(
      'SELECT id, name, description, price, category, available, image_url FROM menu_items WHERE id = ?'
    )
      .bind(matchSingle[1])
      .first();

    if (!item) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }
    return Response.json(item);
  }

  // PATCH /api/menu/:id — update menu item fields (name, price, available, image_url)
  if (matchSingle && request.method === 'PATCH') {
    return handleUpdateMenuItem(request, env, matchSingle[1]);
  }

  // POST /api/menu/:id/image — upload image to R2, returns public URL
  const matchImage = url.pathname.match(/^\/api\/menu\/(\d+)\/image$/);
  if (matchImage && request.method === 'POST') {
    return handleUploadImage(request, env, matchImage[1]);
  }

  return null; // not handled by this route
}

async function handleUpdateMenuItem(request: Request, env: Env, id: string): Promise<Response> {
  let body: { name?: string; description?: string; price?: number; category?: string; available?: number; image_url?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.name !== undefined)        { fields.push('name = ?');        values.push(body.name); }
  if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description); }
  if (body.price !== undefined)       { fields.push('price = ?');       values.push(body.price); }
  if (body.category !== undefined)    { fields.push('category = ?');    values.push(body.category); }
  if (body.available !== undefined)   { fields.push('available = ?');   values.push(body.available); }
  if (body.image_url !== undefined)   { fields.push('image_url = ?');   values.push(body.image_url); }

  if (fields.length === 0) {
    return Response.json({ error: 'No fields to update' }, { status: 400 });
  }

  values.push(id);
  const result = await env.DB.prepare(
    `UPDATE menu_items SET ${fields.join(', ')} WHERE id = ? RETURNING id`
  )
    .bind(...values)
    .first();

  if (!result) {
    return Response.json({ error: 'Item not found' }, { status: 404 });
  }

  return Response.json({ success: true });
}

async function handleUploadImage(request: Request, env: Env, id: string): Promise<Response> {
  const contentType = request.headers.get('content-type') ?? '';
  const contentLength = Number(request.headers.get('content-length') ?? 0);

  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return Response.json({ error: 'Only JPEG, PNG and WebP images are allowed' }, { status: 415 });
  }

  if (contentLength > MAX_IMAGE_BYTES) {
    return Response.json({ error: 'Image must be under 5 MB' }, { status: 413 });
  }

  const ext = contentType.split('/')[1];
  const key = `menu/${id}.${ext}`;

  await env.IMAGES_BUCKET.put(key, request.body, {
    httpMetadata: { contentType },
  });

  const imageUrl = `${IMAGE_PUBLIC_BASE}/${key}`;

  // Save the URL to D1
  await env.DB.prepare('UPDATE menu_items SET image_url = ? WHERE id = ?')
    .bind(imageUrl, id)
    .run();

  return Response.json({ image_url: imageUrl });
}
