import ClientForm from "./ClientForm";

export default function Page() {
  const lambdaUrl = process.env.NVCOUNTER_URL || '';
  return (
    <main style={{ fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', padding:'2rem' }}>
      <div style={{ maxWidth: 760, border:'1px solid #ddd', borderRadius:8, padding:'1rem 1.5rem' }}>
        <h1>Тестови брояч на символи (анализ)</h1>
        <ClientForm lambdaUrl={lambdaUrl} />
      </div>
    </main>
  );
}
