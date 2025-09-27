import React, { useState } from "react";
// FIX 1: The import path is changed from a Python file (.py) 
// to a standard JavaScript module path (assuming it is in the parent directory).
// FIX 2: The named import { sovereignCausalLoop } is changed to a default import,
// which resolves the error that the source file only has a default export.
import sovereignCausalLoop from  "../../components/FleetQ/core_engine.py"; 

export default function CausalReactor() {
  const [desired, setDesired] = useState("");
  const [output, setOutput] = useState(null);

  const handleRun = () => {
    // The function call remains the same
    const result = sovereignCausalLoop(desired);
    setOutput(result);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-purple-700">Causal Reactor</h2>
      <input
        type="text"
        value={desired}
        onChange={e => setDesired(e.target.value)}
        placeholder="Enter desired outcome"
        className="w-full px-4 py-2 border rounded-lg"
      />
      <button onClick={handleRun} className="bg-purple-600 text-white px-4 py-2 rounded-lg">
        Simulate Backward Outcome
      </button>
      {output && (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify(output, null, 2)}
        </pre>
      )}
    </div>
  );
}