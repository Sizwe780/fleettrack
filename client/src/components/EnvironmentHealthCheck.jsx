import { useEffect, useState } from 'react';

export default function EnvironmentHealthCheck() {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    const ping = async () => {
      try {
        const res = await fetch('/api/ping');
        const json = await res.json();
        setStatus(json.status ?? '✅ Healthy');
      } catch {
        setStatus('❌ Offline');
      }
    };
    ping();
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mt-6">
      <h3 className="text-lg font-bold mb-2">🌐 Environment Health</h3>
      <p className="text-sm">Backend Status: {status}</p>
    </div>
  );
}