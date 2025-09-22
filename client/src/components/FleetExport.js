import { exportTrips } from '../utils/exportTripData';

const FleetExport = ({ trips }) => {
  const handleExport = () => {
    exportTrips(trips);
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleExport}
        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
      >
        📄 Export All Trips (PDF)
      </button>
    </div>
  );
};

export default FleetExport;