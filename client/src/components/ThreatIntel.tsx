import React, { useEffect, useState } from 'react';

type Threat = {
  type: string;
  location: string;
  level: string;
};

const ThreatIntel = () => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const res = await fetch('/api/threat-feed');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Threat[] = await res.json();
        setThreats(data);
      } catch (err) {
        console.error('Threat feed fetch failed:', err);
        setError('Failed to load threat zones');
      } finally {
        setLoading(false);
      }
    };

    fetchThreats();
  }, []);

  return (
    <div className="threat-intel">
      <h3>Live Threat Zones</h3>
      {loading && <p>Loading threat data...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <ul>
          {threats.map((t, i) => (
            <li key={i}>
              <strong>{t?.type ?? 'Unknown threat'}</strong> near{' '}
              {t?.location ?? 'Unknown location'} —{' '}
              {t?.level ?? 'Unspecified level'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ThreatIntel;