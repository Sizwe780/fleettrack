import React, { useState } from "react";

// FIX: Change the import from named export { resolveCancerSignature } 
// to a default export import resolveCancerSignature.
// The name can be chosen by you, but matching the function name is best practice.
import resolveCancerSignature from "../../components/FleetQ/core_engine.py"; 

export default function CancerResolver() {
  const [profile, setProfile] = useState("");
  const [output, setOutput] = useState(null);

  const handleRun = () => {
    // This function call remains the same
    const result = resolveCancerSignature(profile); 
    setOutput(result);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-red-700">Cancer Resolution Simulation</h2>
      <input
        type="text"
        value={profile}
        onChange={e => setProfile(e.target.value)}
        placeholder="Enter genetic profile"
        className="w-full px-4 py-2 border rounded-lg"
      />
      <button onClick={handleRun} className="bg-red-600 text-white px-4 py-2 rounded-lg">
        Simulate Resolution
      </button>
      {output && (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify(output, null, 2)}
        </pre>
      )}
    </div>
  );
}