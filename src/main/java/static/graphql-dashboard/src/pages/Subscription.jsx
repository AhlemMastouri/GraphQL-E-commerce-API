import { useState, useEffect, useRef } from 'react';
import { createWsClient } from '../graphql/client';
import {
  SUB_PRODUCT_CREATED, SUB_PRODUCT_DELETED,
  SUB_ORDER_CREATED, SUB_ORDER_UPDATED, SUB_ORDER_DELETED,
} from '../graphql/operations';

const EVENT_META = {
  productCreated: { label: 'Produit créé',     color: '#3B6D11', bg: '#EAF3DE', border: '#97C459' },
  productDeleted: { label: 'Produit supprimé', color: '#A32D2D', bg: '#FCEBEB', border: '#F09595' },
  orderCreated:   { label: 'Commande créée',   color: '#0C447C', bg: '#E6F1FB', border: '#85B7EB' },
  orderUpdated:   { label: 'Commande MAJ',     color: '#854F0B', bg: '#FAEEDA', border: '#F0C070' },
  orderDeleted:   { label: 'Commande supp.',   color: '#A32D2D', bg: '#FCEBEB', border: '#F09595' },
};

const STATUS_META = {
  connecting: { label: 'Connexion...', color: '#854F0B', bg: '#FAEEDA', dot: '#F0C070' },
  connected:  { label: 'Connecté',    color: '#3B6D11', bg: '#EAF3DE', dot: '#97C459' },
  error:      { label: 'Erreur WS',   color: '#A32D2D', bg: '#FCEBEB', dot: '#F09595' },
  closed:     { label: 'Fermé',       color: '#888',    bg: '#f5f5f3', dot: '#ccc'    },
};

function Badge({ type }) {
  const s = EVENT_META[type];
  return (
    <span style={{ background: s.bg, color: s.color, border: `0.5px solid ${s.border}`, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function formatData(type, data) {
  if (!data) return '—';
  try {
    if (type === 'productCreated') return `"${data.name}" — ${Number(data.price).toFixed(2)} €  (stock: ${data.stock})`;
    if (type === 'productDeleted') return `ID supprimé : ${data.id}`;
    if (type === 'orderCreated')   return `Commande #${data.id} — ${data.user?.name || '?'} → ${data.status}`;
    if (type === 'orderUpdated')   return `Commande #${data.id} → ${data.status}`;
    if (type === 'orderDeleted')   return `Commande #${data.id} supprimée`;
  } catch { }
  return JSON.stringify(data);
}

export default function Subscriptions() {
  const [events,  setEvents]  = useState([]);
  const [status,  setStatus]  = useState('connecting');
  const [filter,  setFilter]  = useState('all');
  const [paused,  setPaused]  = useState(false);
  const [logs,    setLogs]    = useState([]);
  const pausedRef = useRef(false);
  const cntRef    = useRef(0);

  const addLog = (msg) => setLogs(p => [`${new Date().toLocaleTimeString('fr-FR')} — ${msg}`, ...p].slice(0, 20));

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    addLog('Ouverture connexion WebSocket…');

    const { addSub, close } = createWsClient((s) => {
      setStatus(s);
      addLog(`Statut WebSocket : ${s}`);
    });

    const subs = [
      { query: SUB_PRODUCT_CREATED, type: 'productCreated', extract: d => d.productCreated },
      { query: SUB_PRODUCT_DELETED, type: 'productDeleted', extract: d => d.productDeleted },
      { query: SUB_ORDER_CREATED,   type: 'orderCreated',   extract: d => d.orderCreated   },
      { query: SUB_ORDER_UPDATED,   type: 'orderUpdated',   extract: d => d.orderUpdated   },
      { query: SUB_ORDER_DELETED,   type: 'orderDeleted',   extract: d => d.orderDeleted   },
    ];

    const unsubs = subs.map(({ query, type, extract }) =>
      addSub(
        query,
        (raw) => {
          const data = extract(raw);
          addLog(`✅ ${EVENT_META[type].label} reçu`);
          if (!pausedRef.current) {
            cntRef.current += 1;
            setEvents(prev => [{ id: cntRef.current, type, data, time: new Date() }, ...prev].slice(0, 100));
          }
        },
        (err) => addLog(`❌ Erreur subscription ${type}: ${JSON.stringify(err)}`),
      )
    );

    return () => { unsubs.forEach(u => u()); close(); };
  }, []);

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);
  const counts   = Object.keys(EVENT_META).reduce((a, k) => ({ ...a, [k]: events.filter(e => e.type === k).length }), {});
  const sm       = STATUS_META[status] || STATUS_META.connecting;

  return (
    <div>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontSize:16, fontWeight:500, marginBottom:2 }}>Événements temps réel</h2>
          <p style={{ fontSize:12, color:'#888' }}>ws://localhost:8088/tp1/graphql-ws</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {/* Status pill */}
          <span style={{ display:'flex', alignItems:'center', gap:6, background:sm.bg, color:sm.color, border:`0.5px solid ${sm.dot}`, borderRadius:99, padding:'4px 12px', fontSize:12, fontWeight:500 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:sm.dot, display:'inline-block', animation: status==='connected' ? 'blink 2s infinite' : 'none' }} />
            {sm.label}
          </span>
          <button onClick={() => setPaused(p => !p)}
            style={{ height:30, padding:'0 12px', border:'0.5px solid #ccc', borderRadius:8, background: paused?'#FAEEDA':'none', color: paused?'#854F0B':'#666', fontSize:12, cursor:'pointer' }}>
            {paused ? '▶ Reprendre' : '⏸ Pause'}
          </button>
          <button onClick={() => { setEvents([]); setLogs([]); }}
            style={{ height:30, padding:'0 12px', border:'0.5px solid #F09595', borderRadius:8, background:'none', color:'#A32D2D', fontSize:12, cursor:'pointer' }}>
            Effacer
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:8, marginBottom:'1.25rem' }}>
        {Object.entries(EVENT_META).map(([key, s]) => (
          <div key={key} onClick={() => setFilter(f => f===key ? 'all' : key)}
            style={{ background:s.bg, border:`0.5px solid ${filter===key ? s.color : s.border}`, borderRadius:8, padding:'10px 12px', cursor:'pointer', outline: filter===key ? `2px solid ${s.border}` : 'none' }}>
            <div style={{ fontSize:11, color:s.color, marginBottom:4, fontWeight:500 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:500, color:s.color }}>{counts[key]}</div>
          </div>
        ))}
      </div>

      {/* Events table */}
      <div style={{ border:'0.5px solid #e5e5e5', borderRadius:12, overflow:'hidden', marginBottom:'1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center', color:'#aaa', fontSize:13 }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📡</div>
            <div style={{ marginBottom:4 }}>En attente d'événements…</div>
            <div style={{ fontSize:11 }}>Crée ou supprime un produit / commande pour voir les événements ici</div>
          </div>
        ) : (
          <div style={{ maxHeight:360, overflowY:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead style={{ position:'sticky', top:0 }}>
                <tr style={{ background:'#f5f5f3' }}>
                  {['#', 'Heure', 'Type', 'Détail'].map(h => (
                    <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontWeight:500, fontSize:12, color:'#888', borderBottom:'0.5px solid #e5e5e5' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id} style={{ borderBottom: i<filtered.length-1 ? '0.5px solid #e5e5e5' : 'none', animation: i===0 ? 'slideIn 0.2s ease' : 'none' }}>
                    <td style={{ padding:'10px 14px', color:'#bbb', fontSize:11 }}>#{e.id}</td>
                    <td style={{ padding:'10px 14px', color:'#888', fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' }}>
                      {e.time.toLocaleTimeString('fr-FR')}
                    </td>
                    <td style={{ padding:'10px 14px' }}><Badge type={e.type} /></td>
                    <td style={{ padding:'10px 14px', color:'#444' }}>{formatData(e.type, e.data)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Debug log */}
      <details style={{ marginTop:'1rem' }}>
        <summary style={{ fontSize:12, color:'#888', cursor:'pointer', userSelect:'none', marginBottom:6 }}>
          🛠 Journal de connexion ({logs.length})
        </summary>
        <div style={{ background:'#111', borderRadius:8, padding:'10px 14px', maxHeight:180, overflowY:'auto' }}>
          {logs.length === 0
            ? <div style={{ color:'#555', fontSize:11 }}>Aucun log</div>
            : logs.map((l, i) => (
              <div key={i} style={{ color: l.includes('❌') ? '#F09595' : l.includes('✅') ? '#97C459' : '#aaa', fontSize:11, lineHeight:1.7, fontFamily:'monospace' }}>{l}</div>
            ))
          }
        </div>
      </details>
    </div>
  );
}
