export default function ViolationReportGenerator({ drivers }) {
    const exportViolations = () => {
      const header = ['Driver', 'Break Violations', 'Route Deviations', 'Fatigue Score'];
      const rows = drivers.map(d => [
        d.name,
        d.breakViolations,
        d.routeDeviations,
        d.fatigueScore
      ]);
      const csv = [header, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'driver-violations.csv';
      link.click();
    };
  
    return (
      <button onClick={exportViolations} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">
        📤 Export Violation Report
      </button>
    );
  }