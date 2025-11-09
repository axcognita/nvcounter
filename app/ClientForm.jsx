"use client";

import { useState } from "react";

export default function ClientForm({ lambdaUrl }) {
  const [model, setModel] = useState("AWS Textract");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState("(no result yet)");

  const submit = async (e) => {
    e.preventDefault();
    if (!lambdaUrl) { alert("NVCOUNTER_URL не е конфигуриран в средата"); return; }
    if (!file) { alert("Моля, изберете файл"); return; }
    setBusy(true); setOutput("");
    try {
      const fd = new FormData();
      // endpoint omitted; server will use NVCOUNTER_URL
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
    <>
      <p>Lambda URL: {lambdaUrl || '(не е конфигуриран)'}</p>
      <form onSubmit={submit}>
        <label style={{ display:'block', marginTop:12 }}>Изберете файл (pdf, doc, docx, jpeg)
          <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} />
        </label>
        <label style={{ display:'block', marginTop:12 }}>Модел
          <select value={model} onChange={e=>setModel(e.target.value)}>
            <option value="AWS Textract">AWS Textract</option>
            <option value="gpt-4o">gpt-4o</option>
            <option value="gpt-5">gpt-5</option>
          </select>
        </label>
        <button type="submit" disabled={busy} style={{ marginTop:12, padding:'8px 12px' }}>{busy? 'Анализирам…' : 'Анализ'}</button>
      </form>
      <h3>Резултат:</h3>
      <pre style={{ background:'#fafafa', border:'1px solid #eee', padding:12, borderRadius:6, overflow:'auto' }}>{output}</pre>
    </>
  );
}
