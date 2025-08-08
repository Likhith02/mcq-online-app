import React, { useEffect, useMemo, useRef, useState, useRef as useDomRef } from "react";

// Phone‑style MCQ app — v4
// Fixes & Upgrades:
// • LIGHT THEME FIX: explicit CSS variables so text/cards are visible on light
// • Themes: Light / Dark / Neon
// • Name gate on first launch (stores to localStorage, editable later)
// • 1000+ demo loader, JSON import (paste) + JSON upload (file)
// • Dashboard with accuracy, totals, per-topic bars, best streak
// • Stacked cards (no overlap), infinite scroll

// ---------------- Theme Helpers ----------------
function applyTheme(theme){
  const r = document.documentElement;
  if(theme === 'light'){
    r.style.setProperty('--bg1', '#f6f8ff');
    r.style.setProperty('--bg2', '#e7f0ff');
    r.style.setProperty('--panel', '#ffffff');
    r.style.setProperty('--ink', '#0f172a');
    r.style.setProperty('--muted', '#475569');
    r.style.setProperty('--cardBg', '#ffffff');
    r.style.setProperty('--cardBorder', '#e5e7eb');
    r.style.setProperty('--optBg', '#f1f5f9');
    r.style.setProperty('--optBgHover', '#e2e8f0');
    r.style.setProperty('--optRightBg', '#dcfce7');
    r.style.setProperty('--optRightBorder', '#86efac');
    r.style.setProperty('--optWrongBg', '#fee2e2');
    r.style.setProperty('--optWrongBorder', '#fca5a5');
    r.style.setProperty('--chipBg', '#f8fafc');
  } else if(theme === 'neon'){
    r.style.setProperty('--bg1', '#0b0e23');
    r.style.setProperty('--bg2', '#0f1536');
    r.style.setProperty('--panel', '#0f1226');
    r.style.setProperty('--ink', '#e5e7eb');
    r.style.setProperty('--muted', '#a5b4fc');
    r.style.setProperty('--cardBg', 'rgba(255,255,255,0.06)');
    r.style.setProperty('--cardBorder', 'rgba(124,58,237,0.45)');
    r.style.setProperty('--optBg', 'rgba(16,24,64,0.65)');
    r.style.setProperty('--optBgHover', 'rgba(18,26,72,0.75)');
    r.style.setProperty('--optRightBg', 'rgba(34,197,94,0.22)');
    r.style.setProperty('--optRightBorder', 'rgba(34,197,94,0.6)');
    r.style.setProperty('--optWrongBg', 'rgba(239,68,68,0.22)');
    r.style.setProperty('--optWrongBorder', 'rgba(239,68,68,0.6)');
    r.style.setProperty('--chipBg', 'rgba(255,255,255,0.06)');
  } else { // dark
    r.style.setProperty('--bg1', '#0b0e23');
    r.style.setProperty('--bg2', '#12163a');
    r.style.setProperty('--panel', '#0f1226');
    r.style.setProperty('--ink', '#e5e7eb');
    r.style.setProperty('--muted', '#9ca3af');
    r.style.setProperty('--cardBg', 'rgba(255,255,255,0.05)');
    r.style.setProperty('--cardBorder', 'rgba(255,255,255,0.12)');
    r.style.setProperty('--optBg', 'rgba(15,22,58,0.6)');
    r.style.setProperty('--optBgHover', 'rgba(17,24,39,0.6)');
    r.style.setProperty('--optRightBg', 'rgba(34,197,94,0.22)');
    r.style.setProperty('--optRightBorder', 'rgba(34,197,94,0.55)');
    r.style.setProperty('--optWrongBg', 'rgba(239,68,68,0.22)');
    r.style.setProperty('--optWrongBorder', 'rgba(239,68,68,0.55)');
    r.style.setProperty('--chipBg', 'rgba(255,255,255,0.06)');
  }
}

function useLocalStorage(key, initial){
  const [v, setV] = useState(()=>{ try{const r=localStorage.getItem(key); return r?JSON.parse(r):initial;}catch{return initial;} });
  useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(v)); }catch{} },[key,v]);
  return [v,setV];
}

// ---------------- Demo Data ----------------
const SEEDS = [
  { q: "What is the output of print(2 ** 3)?", opts: ["4","6","8","9"], c: 2, lang: "Python", topic: "Basics", diff: "Easy", exp: "2 ** 3 ⇒ 8 (exponentiation)." },
  { q: "Which keyword defines a function in Python?", opts: ["func","def","function","define"], c: 1, lang: "Python", topic: "Functions", diff: "Easy", exp: "Use 'def' to define a function." },
  { q: "Which data structure follows LIFO?", opts: ["Queue","Stack","Heap","Tree"], c: 1, lang: "CS", topic: "DSA", diff: "Easy", exp: "Stacks are Last-In-First-Out." },
  { q: "What does '===' check in JavaScript?", opts: ["Value only","Reference only","Value and type","Nothing"], c: 2, lang: "JavaScript", topic: "Basics", diff: "Easy", exp: "Strict equality checks value and type." },
  { q: "Binary search on a sorted array is?", opts: ["O(n)","O(log n)","O(n log n)","O(1)"], c: 1, lang: "CS", topic: "Algorithms", diff: "Medium", exp: "Halves the space each step ⇒ O(log n)." },
  { q: "SQL clause that filters after aggregation?", opts: ["WHERE","HAVING","GROUP BY","ORDER BY"], c: 1, lang: "SQL", topic: "Queries", diff: "Medium", exp: "HAVING filters groups from GROUP BY." },
  { q: "Which Python collection is unordered & unique?", opts: ["list","tuple","set","dict"], c: 2, lang: "Python", topic: "Collections", diff: "Easy", exp: "set() keeps unique elements, unordered." },
  { q: "JS: add element to end of array?", opts: ["push()","pop()","shift()","unshift()"], c: 0, lang: "JavaScript", topic: "Arrays", diff: "Easy", exp: "push() appends to the end." },
  { q: "Which HTTP method is idempotent?", opts: ["POST","PATCH","GET","None"], c: 2, lang: "Web", topic: "HTTP", diff: "Medium", exp: "GET should not modify state." },
  { q: "Big-O O(1) means?", opts: ["Constant","Linear","Quadratic","Exponential"], c: 0, lang: "CS", topic: "Complexity", diff: "Easy", exp: "Constant time." },
  { q: "Python: sum(range(3)) = ?", opts: ["0","3","6","9"], c: 1, lang: "Python", topic: "Loops", diff: "Medium", exp: "0+1+2=3." },
  { q: "Lowercase in Python?", opts: ["lower()","upper()","title()","capitalize()"], c: 0, lang: "Python", topic: "Strings", diff: "Easy", exp: "str.lower()." },
  { q: "JS block-scoped keyword?", opts: ["var","let","function","with"], c: 1, lang: "JavaScript", topic: "Scopes", diff: "Medium", exp: "let/const are block scoped." },
  { q: "Promises: always runs?", opts: ["then","catch","finally","await"], c: 2, lang: "JavaScript", topic: "Promises", diff: "Medium", exp: "finally() runs after then/catch." },
  { q: "Join returning only matches?", opts: ["LEFT","RIGHT","FULL","INNER"], c: 3, lang: "SQL", topic: "Joins", diff: "Medium", exp: "INNER JOIN ⇒ intersection." },
];

function buildDemoQuestions(n = 1200){
  const out = [];
  for(let i=0;i<n;i++){
    const s = SEEDS[i % SEEDS.length];
    out.push({ ...s, q: `${s.q}  [Practice ${Math.floor(i/SEEDS.length)+1}]` });
  }
  return out;
}

// ---------------- UI ----------------
function Tile({ title, value }){
  return (
    <div className="rounded-2xl p-3" style={{ background:'var(--chipBg)', border:'1px solid var(--cardBorder)', color:'var(--ink)' }}>
      <div className="text-xs" style={{ color:'var(--muted)' }}>{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Dashboard({ stats }){
  const acc = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0;
  const topics = Object.keys(stats.perTopic || {}).sort();
  return (
    <div className="p-4 space-y-3" style={{ color:'var(--ink)' }}>
      <div className="grid grid-cols-2 gap-3">
        <Tile title="Answered" value={stats.answered} />
        <Tile title="Correct" value={stats.correct} />
        <Tile title="Accuracy" value={`${acc}%`} />
        <Tile title="Best Streak" value={stats.bestStreak} />
      </div>
      <div className="mt-2">
        <div className="text-sm mb-1" style={{ color:'var(--muted)' }}>Per-topic performance</div>
        {topics.length===0 && <div className="text-xs" style={{ color:'var(--muted)' }}>No data yet — answer a few questions.</div>}
        {topics.map(t => {
          const { answered=0, correct=0 } = stats.perTopic[t]||{};
          const p = answered? Math.round((correct/answered)*100):0;
          return (
            <div key={t} className="mb-2">
              <div className="text-xs mb-1" style={{ color:'var(--ink)' }}>{t} — {correct}/{answered} ({p}%)</div>
              <div className="h-2 w-full rounded overflow-hidden" style={{ background:'var(--cardBorder)' }}>
                <div className="h-2" style={{ width: `${p}%`, background:'linear-gradient(90deg,#10b981,#a21caf)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Card({ q, onAnswer }){
  const [picked, setPicked] = useState(null);
  function choose(i){ if(picked!==null) return; setPicked(i); onAnswer(i === q.c, q); }
  return (
    <div className="w-full rounded-[18px] shadow-[0_10px_30px_rgba(0,0,0,0.25)] p-4 mb-3" style={{ background:'var(--cardBg)', border:'1px solid var(--cardBorder)', color:'var(--ink)' }}>
      <div className="text-xs mb-1" style={{ color:'var(--muted)' }}>{q.lang} • {q.topic} • {q.diff}</div>
      <div className="text-base font-semibold mb-3">{q.q}</div>
      <div className="grid gap-2">
        {q.opts.map((opt, i)=>{
          const isRight = picked!==null && i===q.c;
          const isWrong = picked!==null && i===picked && i!==q.c;
          const base = { background:'var(--optBg)', border:'1px solid var(--cardBorder)', color:'var(--ink)' };
          const right = { background:'var(--optRightBg)', border:'1px solid var(--optRightBorder)' };
          const wrong = { background:'var(--optWrongBg)', border:'1px solid var(--optWrongBorder)' };
          const style = isRight? right : isWrong? wrong : base;
          return (
            <button key={i} onClick={()=>choose(i)} className="text-left rounded-xl px-3 py-2 transition-colors" style={style} onMouseEnter={e=>{ if(!isRight&&!isWrong) e.currentTarget.style.background='var(--optBgHover)'; }} onMouseLeave={e=>{ if(!isRight&&!isWrong) e.currentTarget.style.background='var(--optBg)'; }}>
              {opt}
            </button>
          );
        })}
      </div>
      {picked!==null && (
        <div className="text-sm border-t mt-3 pt-2" style={{ color:'var(--ink)', borderColor:'var(--cardBorder)' }}>Explanation: {q.exp}</div>
      )}
    </div>
  );
}

function NameGate({ name, setName }){
  const [temp, setTemp] = useState(name || '');
  function save(){ const v = (temp||'').trim(); if(!v) return; setName(v); }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background:'rgba(0,0,0,0.45)' }}>
      <div className="w-[90%] max-w-[360px] rounded-2xl p-4" style={{ background:'var(--panel)', color:'var(--ink)', border:'1px solid var(--cardBorder)' }}>
        <div className="text-lg font-semibold mb-2">Welcome!</div>
        <div className="text-sm mb-3" style={{ color:'var(--muted)' }}>Enter your name to track your progress.</div>
        <input className="w-full rounded-xl px-3 py-2 mb-3 outline-none" style={{ background:'var(--optBg)', border:'1px solid var(--cardBorder)', color:'var(--ink)' }} value={temp} onChange={e=>setTemp(e.target.value)} placeholder="Your name" />
        <button className="w-full rounded-xl px-3 py-2" style={{ background:'linear-gradient(90deg,#7c3aed,#a21caf)', color:'#fff' }} onClick={save}>Let's go</button>
      </div>
    </div>
  );
}

export default function App(){
  // Prevent any horizontal scroll
  useEffect(()=>{ document.documentElement.style.overflowX='hidden'; document.body.style.overflowX='hidden'; },[]);

  // Theme
  const [theme, setTheme] = useLocalStorage('mcq_theme', 'dark');
  useEffect(()=>{ applyTheme(theme); },[theme]);

  // Player name (gate on first run)
  const [name, setName] = useLocalStorage('mcq_name', '');

  // Data & stats
  const [data, setData] = useState(SEEDS);
  const [page, setPage] = useState(1);
  const perPage = 8;
  const [xp, setXp] = useLocalStorage('mcq_xp', 0);
  const [streak, setStreak] = useLocalStorage('mcq_streak', 0);
  const [best, setBest] = useLocalStorage('mcq_best', 0);
  const [stats, setStats] = useLocalStorage('mcq_stats', { answered:0, correct:0, bestStreak:0, perTopic:{} });
  const [tab, setTab] = useLocalStorage('mcq_tab', 'play');

  const fileRef = useRef(null);

  const visible = useMemo(()=> data.slice(0, page*perPage), [data, page]);

  // Infinite scroll
  const listRef = useRef(null);
  useEffect(()=>{
    const el = listRef.current; if(!el) return;
    const onScroll = () => {
      if(el.scrollTop + el.clientHeight >= el.scrollHeight - 140){
        if(visible.length < data.length) setPage(p=>p+1);
      }
    };
    el.addEventListener('scroll', onScroll);
    return ()=> el.removeEventListener('scroll', onScroll);
  }, [visible.length, data.length]);

  function onAnswer(ok, q){
    if(ok){
      setXp(xp + 10);
      const ns = streak + 1; setStreak(ns); if(ns>best){ setBest(ns); setStats(s=>({...s, bestStreak: ns })); }
    } else {
      setStreak(0);
    }
    setStats(s=>{
      const perTopic = { ...(s.perTopic||{}) };
      const t = q.topic || 'Other';
      const cur = perTopic[t] || { answered:0, correct:0 };
      const answered = cur.answered + 1;
      const correct = cur.correct + (ok?1:0);
      perTopic[t] = { answered, correct };
      return { answered: (s.answered||0) + 1, correct: (s.correct||0) + (ok?1:0), bestStreak: Math.max(s.bestStreak||0, ok? (streak+1): s.bestStreak||0), perTopic };
    });
  }

  function resetProgress(){ setXp(0); setStreak(0); setBest(0); setStats({ answered:0, correct:0, bestStreak:0, perTopic:{} }); }
  function loadThousand(){ setData(buildDemoQuestions(1200)); setPage(1); }

  function importQuestionsPrompt(){
    const raw = prompt('Paste JSON array of questions with {q, opts[4], c, lang, topic, diff, exp}');
    if(!raw) return; try{ const arr = JSON.parse(raw); ingestQuestions(arr); }catch(e){ alert('Invalid JSON: '+e.message); }
  }

  function ingestQuestions(arr){
    if(!Array.isArray(arr)) return alert('Not an array');
    const ok = arr.every(o => typeof o.q==='string' && Array.isArray(o.opts) && typeof o.c==='number');
    if(!ok) return alert('Each item must look like {q, opts:[...4], c:index, lang, topic, diff, exp}');
    setData(arr); setPage(1); alert(`Imported ${arr.length} questions`);
  }

  function onFilePick(e){
    const f = e.target.files?.[0]; if(!f) return; const rd = new FileReader();
    rd.onload = () => { try{ const arr = JSON.parse(String(rd.result)); ingestQuestions(arr); }catch(err){ alert('Invalid JSON: '+err.message); } };
    rd.readAsText(f);
    e.target.value = '';
  }

  return (
    <div className="w-full min-h-screen flex items-start justify-center" style={{background:"linear-gradient(180deg, var(--bg1), var(--bg2))", color:"var(--ink)"}}>
      {/* Phone frame */}
      <div className="max-w-[420px] w-full min-h-screen border-[12px] border-black rounded-[40px] shadow-2xl" style={{ background:"var(--panel)" }}>
        {/* Top bar */}
        <div className="sticky top-0 z-20 backdrop-blur" style={{ background:'rgba(0,0,0,0.08)', borderBottom:'1px solid var(--cardBorder)' }}>
          <div className="px-4 pt-3 pb-2 flex items-center justify-between" style={{ color:'var(--ink)' }}>
            <div>
              <div className="text-lg font-semibold">Coding MCQ Reels</div>
              <div className="text-xs" style={{ color:'var(--muted)' }}>Answer • Learn • Level up</div>
            </div>
            <div className="flex gap-2">
              <button className="px-2 py-1 rounded-lg" style={{ border:'1px solid var(--cardBorder)' }} onClick={()=> setTheme(t=> t==='dark'? 'light' : t==='light'? 'neon' : 'dark')}>Theme: {theme}</button>
              <button className="px-2 py-1 rounded-lg" style={{ border:'1px solid var(--cardBorder)' }} onClick={()=> setTab(tab==='play'?'dash':'play')}>{tab==='play'? 'Dashboard' : 'Play'}</button>
            </div>
          </div>
          <div className="px-3 pb-2 flex gap-2 text-sm">
            <div className="rounded-xl px-3 py-1" style={{ background:'var(--chipBg)', border:'1px solid var(--cardBorder)' }}>XP: {xp}</div>
            <div className="rounded-xl px-3 py-1" style{{ background:'var(--chipBg)', border:'1px solid var(--cardBorder)' }}>Streak: {streak}</div>
            <div className="rounded-xl px-3 py-1" style={{ background:'var(--chipBg)', border:'1px solid var(--cardBorder)' }}>Best: {best}</div>
            <button className="rounded-xl px-3 py-1" style{{ background:'linear-gradient(90deg,#7c3aed,#a21caf)', color:'#fff' }} onClick={resetProgress}>Reset</button>
          </div>
          <div className="px-3 pb-2 flex gap-2 text-xs">
            <button className="px-2 py-1 rounded-lg" style{{ border:'1px solid var(--cardBorder)' }} onClick={loadThousand}>Load 1000+</button>
            <button className="px-2 py-1 rounded-lg" style{{ border:'1px solid var(--cardBorder)' }} onClick={importQuestionsPrompt}>Import JSON</button>
            <button className="px-2 py-1 rounded-lg" style{{ border:'1px solid var(--cardBorder)' }} onClick={()=> fileRef.current?.click()}>Upload JSON</button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFilePick} />
            <div className="ml-auto text-xs flex items-center gap-2" style{{ color:'var(--muted)' }}>
              <span>Player:</span>
              <button className="px-2 py-1 rounded-lg" style{{ border:'1px solid var(--cardBorder)' }} onClick={()=>{ const v = prompt('Change your name', name || ''); if(v!=null) setName(v.trim()); }}>{name || '—'}</button>
            </div>
          </div>
        </div>

        {/* Body */}
        {tab==='play' ? (
          <div ref={listRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3" style{{ scrollSnapType:'y mandatory' }}>
            {visible.map((q, i)=> (
              <div key={i} style{{ scrollSnapAlign:'start' }}>
                <Card q={q} onAnswer={onAnswer} />
              </div>
            ))}
            {visible.length===0 && <div className="px-4 py-6 text-sm" style{{ color:'var(--muted)' }}>No questions.</div>}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <Dashboard stats={{ ...stats, bestStreak: Math.max(best, stats.bestStreak||0) }} />
          </div>
        )}
      </div>

      {/* Name Gate */}
      {!name && <NameGate name={name} setName={setName} />}
    </div>
  );
}
