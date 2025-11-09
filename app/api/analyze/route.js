export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonResponse(obj, init = {}) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...init },
  });
}

function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request) {
  try {
    const form = await request.formData();
    const endpoint = (form.get('endpoint') || process.env.NVCOUNTER_URL || '').toString().trim();
    const model = (form.get('model') || 'gpt-4o').toString();
    const file = form.get('file');
    if (!endpoint) return errorResponse('Missing endpoint');
    if (!file || typeof file.arrayBuffer !== 'function') return errorResponse('Missing file');

    const buf = Buffer.from(await file.arrayBuffer());
    const b64 = buf.toString('base64');
    const payload = {
      fileName: file.name || 'upload',
      contentType: file.type || 'application/octet-stream',
      data: b64,
      Model: model
    };

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await resp.text();
    // Try JSON, else return raw text
    try {
      const json = JSON.parse(text);
      return new Response(JSON.stringify(json), { status: resp.status, headers: { 'Content-Type': 'application/json' } });
    } catch {
      return new Response(text, { status: resp.status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  } catch (e) {
    console.error(e);
    return errorResponse(e?.message || 'Internal Error', 500);
  }
}
