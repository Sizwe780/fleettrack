import React, { useEffect, useState } from 'react';
import ModuleCard from './ModuleCard';
import { fetchModulesForStudent } from '../../api/fleetstore';
import './FleetStore.css'; // Optional: cockpit-grade styling

const FleetStore = ({ studentId }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModulesForStudent(studentId).then(data => {
      setModules(data);
      setLoading(false);
    });
  }, [studentId]);

  return (
    <div className="fleetstore-container">
      <h2>🧭 FleetStore Tactical Marketplace</h2>
      {loading ? (
        <p>Loading modules...</p>
      ) : (
        <div className="module-grid">
          {modules.map((mod) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FleetStore;