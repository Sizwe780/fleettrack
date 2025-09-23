export default function TripReplayExporter({ trip }) {
    const exportReplay = () => {
      const blob = new Blob([JSON.stringify(trip.coordinates)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${trip.id}-replay.json`;
      link.click();
    };
  
    return (
      <button onClick={exportReplay} className="mt-2 px-3 py-1 bg-gray-700 text-white rounded">
        📤 Export Replay
      </button>
    );
  }