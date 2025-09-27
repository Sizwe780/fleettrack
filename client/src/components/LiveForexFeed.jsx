// web/src/components/LiveForexFeed.jsx
import React, { useEffect, useRef, useState } from 'react';

export default function LiveForexFeed({ apiKey, pair = null }) {
  const [events, setEvents] = useState([]);
  const evtSourceRef = useRef(null);

  useEffect(() => {
    const url = `${process.env.REACT_APP_API_URL || ''}/api/forex/subscribe`;
    const headers = { 'x-api-key': apiKey || '' };
    // Build SSE URL with API key as header not supported natively; use simple proxy or attach key as query param for demo
    const sseUrl = `${url}?apiKey=${encodeURIComponent(apiKey || '')}`;
    const es = new EventSource(sseUrl, { withCredentials: false });
    evtSourceRef.current = es;

    es.addEventListener('prediction', e => {
      try {
        const data = JSON.parse(e.data);
        if (pair && data.pair !== pair) return;
        setEvents(prev => [data].concat(prev).slice(0, 200));
      } catch (err) { console.error('SSE parse error', err); }
    });

    es.addEventListener('heartbeat', () => { /* noop */ });

    es.addEventListener('quota_exceeded', e => {
      try { console.warn('quota_exceeded', JSON.parse(e.data)); } catch(e) {}
      es.close();
    });

    es.onerror = (err) => {
      console.error('SSE error', err);
      // attempt reconnect strategy handled by EventSource in browser automatically
    };

    return () => { es.close(); };
  }, [apiKey, pair]);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', width: '100%' }}>
      <h3>Live Forex Predictions{pair ? ` — ${pair}` : ''}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 12 }}>
        {events.map(ev => (
          <div key={ev.id} style={{ borderRadius: 8, padding: 12, background: '#0f172a', color: '#fff', boxShadow: '0 4px 14px rgba(2,6,23,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{new Date(ev.ts).toLocaleString()}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{ev.pair}</div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{ev.ensemble && ev.ensemble.ensembleScore ? (ev.ensemble.ensembleScore > 0 ? 'UP' : 'DOWN') : '—'}</div>
              <div style={{ marginTop: 6 }}>
                <span style={{ fontSize: 14, marginRight: 8 }}>ProbUp: <b>{(ev.ensemble && ev.ensemble.probUp || 0).toFixed(3)}</b></span>
                <span style={{ fontSize: 14 }}>ProbDown: <b>{(ev.ensemble && ev.ensemble.probDown || 0).toFixed(3)}</b></span>
              </div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                Confidence: <b>{(ev.ensemble && ev.ensemble.confidence || 0).toFixed(2)}</b>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                ModelWeights:
                {(ev.ensemble && ev.ensemble.modelWeights || []).map(m => (
                  <div key={m.modelId} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{m.modelId}</span>
                    <span>{(m.weight || 0).toFixed(3)}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                <details style={{ color: '#cbd5e1' }}>
                  <summary>Provenance</summary>
                  <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8, color: '#cbd5e1' }}>{JSON.stringify(ev.provenance || ev.ensemble.provenance || {}, null, 2)}</pre>
                </details>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}