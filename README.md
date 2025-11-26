## nvcounter Amplify Tester (SSR)

Next.js 14 app that accepts a file upload and server-side calls your nvcounter Lambda Function URL. Host on Amplify (SSR).

### Local run

1. Install: `npm install`
2. Dev: `npm run dev`
3. Open http://localhost:3000 and paste your Lambda Function URL.

### Deploy on Amplify (SSR)

This requires connecting a Git repo (Amplify SSR cannot be deployed as a manual ZIP).

1. Commit/push this folder to a repo
2. In Amplify Console → New App → Host web app → Connect repository
3. Pick the repo/branch containing this Next.js app
4. Build settings: Amplify detects Next.js automatically
5. (Optional) Set env var `NVCOUNTER_URL` to default your Lambda URL
6. Deploy → open the URL

### Notes

- The UI posts to `/api/analyze` with multipart form-data.
- The API route uploads the file to S3 (private) and generates a presigned GET URL (default 10 minutes), then calls your Lambda Function URL with `{ fileUrl, Model }`.
- Configure env vars:
  - `NVCOUNTER_URL` – your Lambda Function URL
  - `S3_BUCKET` – target bucket name
  - `S3_PREFIX` – optional key prefix (e.g., `uploads/`)
  - `AWS_REGION` – e.g., `eu-west-2`
  - `S3_URL_TTL_SECONDS` – optional presigned URL expiry in seconds (default `600`)
- Provide AWS credentials to the runtime via Amplify/role or env vars. Do NOT commit secrets.
- No CORS issues since it’s server-to-server.
