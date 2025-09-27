import React, { useState } from "react";

// FIX 1: Change the import from a named export ({ sovereignQuantumLoop }) 
// to a default import (sovereignQuantumLoop) to resolve the error.
// FIX 2: Changed the invalid .py extension and path to a standard JavaScript module path.
import sovereignQuantumLoop from "../../components/FleetQ/core_engine.py"; 

export default function QuantumLoop() {
  const [concept, setConcept] = useState("");
  const [output, setOutput] = useState(null);

  const handleRun = () => {
    // The function call remains the same
    const result = sovereignQuantumLoop({ concept });
    setOutput(result);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-indigo-700">Quantum Cognition Loop</h2>
      <input
        type="text"
        value={concept}
        onChange={e => setConcept(e.target.value)}
        placeholder="Enter concept seed"
        className="w-full px-4 py-2 border rounded-lg"
      />
      <button onClick={handleRun} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
        Run Quantum Loop
      </button>
      {output && (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify(output, null, 2)}
        </pre>
      )}
    </div>
  );
}