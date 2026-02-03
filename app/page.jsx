"use client";

import { useState } from "react";

export default function Page() {
  const [endpoint, setEndpoint] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState({
    includeStamps: false,
    includeHandwriting: true,
    includeSignatures: false,
    includeHeaders: true,
    includeFooters: true,
    detectTables: false,
    detectForms: false,
    detectLayout: false,
    ocrConfidenceThreshold: 0,
  });
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState("(no result yet)");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [charCountNoSpaces, setCharCountNoSpaces] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const submit = async (e) => {
    e.preventDefault();
    if (!endpoint) { alert("Enter endpoint"); return; }
    if (!file) { alert("Choose a file"); return; }
    setBusy(true);
    setOutput("");
    setWordCount(0);
    setCharCount(0);
    setCharCountNoSpaces(0);
    setElapsedSeconds(0);
    try {
      const start = performance.now();
      const fd = new FormData();
      fd.append("endpoint", endpoint);
      fd.append("model", model);
      fd.append("file", file);
      fd.append("includeStamps", String(options.includeStamps));
      fd.append("includeHandwriting", String(options.includeHandwriting));
      fd.append("includeSignatures", String(options.includeSignatures));
      fd.append("includeHeaders", String(options.includeHeaders));
      fd.append("includeFooters", String(options.includeFooters));
      fd.append("detectTables", String(options.detectTables));
      fd.append("detectForms", String(options.detectForms));
      fd.append("detectLayout", String(options.detectLayout));
      fd.append("ocrConfidenceThreshold", String(options.ocrConfidenceThreshold));
      const resp = await fetch("/api/analyze", { method: "POST", body: fd });
      const text = await resp.text();

      let displayText = text;
      try {
        const asJson = JSON.parse(text);
        displayText = JSON.stringify(asJson, null, 2);
      } catch {
        // leave as plain text
      }

      const plain = displayText || "";
      const words = plain.trim() ? plain.trim().split(/\s+/).length : 0;
      const chars = plain.length;
      const charsNoSpaces = plain.replace(/\s+/g, "").length;

      setWordCount(words);
      setCharCount(chars);
      setCharCountNoSpaces(charsNoSpaces);
      setElapsedSeconds(((performance.now() - start) / 1000).toFixed(2));
      setOutput(displayText);
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
          <div style={{ marginTop:16, padding:'8px 10px', borderTop:'1px solid #eee', color:'#666', fontSize:13 }}>
            <div style={{ opacity:0.8, marginBottom:6 }}>Advanced OCR options</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 16px' }}>
              <label style={{ opacity:0.8 }}>
                <input
                  type="checkbox"
                  checked={options.includeStamps}
                  onChange={e=>setOptions(o=>({ ...o, includeStamps: e.target.checked }))}
                /> includeStamps
              </label>
              <label style={{ opacity:0.8 }}>
                <input
                  type="checkbox"
                  checked={options.includeHandwriting}
                  onChange={e=>setOptions(o=>({ ...o, includeHandwriting: e.target.checked }))}
                /> includeHandwriting
              </label>
              <label style={{ opacity:0.8 }}>
                <input
                  type="checkbox"
                  checked={options.includeSignatures}
                  onChange={e=>setOptions(o=>({ ...o, includeSignatures: e.target.checked }))}
                /> includeSignatures
              </label>
              <label style={{ opacity:0.8 }}>
                <input
                  type="checkbox"
                  checked={options.includeHeaders}
                  onChange={e=>setOptions(o=>({ ...o, includeHeaders: e.target.checked }))}
                /> includeHeaders
              </label>
              <label style={{ opacity:0.8 }}>
                <input
                  type="checkbox"
                  checked={options.includeFooters}
                  onChange={e=>setOptions(o=>({ ...o, includeFooters: e.target.checked }))}
                /> includeFooters
              </label>
              <label style={{ opacity:0.8 }}>
                <input
                  type="checkbox"
                  checked={options.detectTables}
                  onChange={e=>setOptions(o=>({ ...o, detectTables: e.target.checked }))}
                /> detectTables
              </label>
              <label style={{ opacity:0.8 }}>
                <input
                  type="checkbox"
                  checked={options.detectForms}
                  onChange={e=>setOptions(o=>({ ...o, detectForms: e.target.checked }))}
                /> detectForms
              </label>
              <label style={{ opacity:0.8 }}>
                <input
                  type="checkbox"
                  checked={options.detectLayout}
                  onChange={e=>setOptions(o=>({ ...o, detectLayout: e.target.checked }))}
                /> detectLayout
              </label>
            </div>
            <label style={{ display:'block', marginTop:8, opacity:0.8 }}>
              OCR confidence threshold (0-100)
              <input
                type="number"
                min={0}
                max={100}
                value={options.ocrConfidenceThreshold}
                onChange={e=>{
                  const v = Number(e.target.value || 0);
                  const clamped = Math.min(100, Math.max(0, v));
                  setOptions(o=>({ ...o, ocrConfidenceThreshold: clamped }));
                }}
                style={{ marginLeft:8, width:80 }}
              />
            </label>
          </div>
          <button type="submit" disabled={busy} style={{ marginTop:12, padding:'8px 12px' }}>{busy? 'Analyzing…' : 'Analyze'}</button>
        </form>
        <h3>Result</h3>
        <div style={{ fontSize:13, marginBottom:8 }}>
          Брой думи: {wordCount}<br />
          Брой символи: {charCount}<br />
          Брой символи (без празни): {charCountNoSpaces}<br />
          Време: {elapsedSeconds} сек
        </div>
        <pre style={{ background:'#fafafa', border:'1px solid #eee', padding:12, borderRadius:6, overflow:'auto' }}>{output}</pre>
      </div>
    </main>
  );
}
