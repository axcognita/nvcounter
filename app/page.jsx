"use client";

import { useState } from "react";

export default function Page() {
  const [endpoint, setEndpoint] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState("(no result yet)");

  const submit = async (e) => {
    e.preventDefault();
    if (!endpoint) { alert("Enter endpoint"); return; }
    if (!file) { alert("Choose a file"); return; }
    setBusy(true); setOutput("");
    try {
      const fd = new FormData();
      fd.append("endpoint", endpoint);
      fd.append("model", model);
      fd.append("file", file);
      const resp = await fetch("/api/analyze", { method: "POST", body: fd });
      const text = await resp.text();
      try { setOutput(JSON.stringify(JSON.parse(text), null, 2)); }
      catch { setOutput(text); }
    } catch (err) {
      setOutput("Error: " + (err?.message || String(err)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', padding:'2rem' }}>
      <div style={{ maxWidth: 760, border:'1px solid #ddd', borderRadius:8, padding:'1rem 1.5rem' }}>
        <h1>nvcounter Amplify tester</h1>
        <p>This page uploads the file to this app, which then calls your nvcounter Lambda Function URL server-side.</p>
        <form onSubmit={submit}>
          <label style={{ display:'block', marginTop:12 }}>Lambda Function URL
            <input type="url" value={endpoint} onChange={e=>setEndpoint(e.target.value)} placeholder="https://...lambda-url.../" style={{ width:'100%' }} />
          </label>
          <label style={{ display:'block', marginTop:12 }}>File
            <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} />
          </label>
          <label style={{ display:'block', marginTop:12 }}>Model
            <select value={model} onChange={e=>setModel(e.target.value)}>
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-5">gpt-5</option>
              <option value="AWS Textract">AWS Textract</option>
            </select>
          </label>
          <button type="submit" disabled={busy} style={{ marginTop:12, padding:'8px 12px' }}>{busy? 'Analyzing…' : 'Analyze'}</button>
        </form>
        <h3>Result</h3>
        <pre style={{ background:'#fafafa', border:'1px solid #eee', padding:12, borderRadius:6, overflow:'auto' }}>{output}</pre>
      </div>
    </main>
  );
}
