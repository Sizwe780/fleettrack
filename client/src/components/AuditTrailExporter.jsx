export default function AuditTrailExporter({ logs }) {
    const exportCSV = () => {
      const header = ['Action', 'Actor', 'Timestamp', 'Reason'];
      const rows = logs.map(log => [
        log.action,
        log.actor,
        new Date(log.timestamp).toLocaleString(),
        log.reason ?? '—'
      ]);
      const csv = [header, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fleet-audit-log.csv';
      link.click();
    };
  
    return (
      <button onClick={exportCSV} className="mt-4 px-4 py-2 bg-gray-800 text-white rounded">
        📤 Export Audit Logs
      </button>
    );
  }