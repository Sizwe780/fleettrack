import React, { useState } from 'react';

export function DVIRForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [status, setStatus] = useState<'passed' | 'failed'>('passed');
  const [details, setDetails] = useState<string[]>([]);

  const handleSubmit = () => {
    onSubmit({
      dvirStatus: status,
      inspectionDetails: details,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="dvir-form">
      <h3>📝 DVIR Inspection</h3>
      <select value={status} onChange={(e) => setStatus(e.target.value as any)}>
        <option value="passed">Passed</option>
        <option value="failed">Failed</option>
      </select>
      <textarea
        placeholder="Inspection notes..."
        onChange={(e) => setDetails(e.target.value.split('\n'))}
      />
      <button onClick={handleSubmit}>Submit Inspection</button>
    </div>
  );
}