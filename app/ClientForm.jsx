"use client";

import { useState } from "react";

export default function ClientForm({ lambdaUrl }) {
  const [model, setModel] = useState("AWS Textract");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState("(no result yet)");
  const [charCount, setCharCount] = useState(0);
  const [wordsCount, setWordsCount] = useState(0);

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
      // counts (based on raw response text)
      const trimmed = text.trim();
      setCharCount(trimmed.length);
      setWordsCount(trimmed ? (trimmed.split(/\s+/).filter(Boolean).length) : 0);
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
      <form onSubmit={submit}>
        <label style={{ display:'block', marginTop:12 }}>Изберете файл (pdf, doc, docx, jpeg)
          <input
            type="file"
            onChange={e=>setFile(e.target.files?.[0] || null)}
            style={{ display:'block', marginTop:8, padding:'10px 12px', fontSize:16, cursor:'pointer' }}
          />
        </label>
        <label style={{ display:'block', marginTop:12, color:'#888' }}>Модел
          <select value={model} onChange={e=>setModel(e.target.value)} disabled
                  style={{ background:'#f2f2f2', color:'#888', borderColor:'#ddd' }}>
            <option value="AWS Textract">AWS Textract</option>
            <option value="gpt-4o">gpt-4o</option>
            <option value="gpt-5">gpt-5</option>
          </select>
        </label>
        <button type="submit" disabled={busy} style={{ marginTop:12, padding:'8px 12px', background:'#90ee90', border:'1px solid #6fd06f' }}>
          {busy? 'Анализирам…' : 'Анализ'}
        </button>
      </form>
      <h3>Резултат:</h3>
      <div style={{ background:'#fafafa', border:'1px solid #eee', padding:12, borderRadius:6 }}>
        <div><strong>Символи: {charCount}     Думи: {wordsCount}</strong></div>
        <pre style={{ margin:0, marginTop:8, background:'transparent', border:'none', whiteSpace:'pre-wrap' }}>{output}</pre>
      </div>
      <p style={{ color:'#888', marginTop:12, fontSize:12 }}>Lambda URL: {lambdaUrl || '(не е конфигуриран)'}</p>
    </>
  );
}
