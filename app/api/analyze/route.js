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

    // S3 upload (private) then create a presigned GET URL and call Lambda with fileUrl
    const { S3Client, PutObjectCommand, GetObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    const bucket = process.env.S3_BUCKET;
    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'eu-west-2';
    if (!bucket) return errorResponse('Missing S3_BUCKET env');

    const keySafe = (file.name || 'upload').replace(/[^a-zA-Z0-9._-]+/g, '-');
    const key = `${process.env.S3_PREFIX || ''}${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${keySafe}`;

    const s3 = new S3Client({ region });
    const body = Buffer.from(await file.arrayBuffer());
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.type || 'application/octet-stream',
    }));

    const ttlSec = Number(process.env.S3_URL_TTL_SECONDS || 600);
    const presigned = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: ttlSec }
    );

    const fileUrl = presigned;
    const payload = {
      fileUrl,
      Model: model,
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
