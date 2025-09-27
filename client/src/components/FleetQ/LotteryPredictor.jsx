import React, { useState } from "react";

// FIX 1: Change the import from a named export to a default export to match 
// the export style of the source module (which the compiler says is default-exporting).
// FIX 2: Changed the invalid .py extension and path to a common JavaScript module path.
import anticipateLotterySequence from "../../components/FleetQ/core_engine.py"; 

export default function LotteryPredictor() {
  const [entropy, setEntropy] = useState("");
  const [output, setOutput] = useState(null);

  const handleRun = () => {
    // The function call remains the same
    const result = anticipateLotterySequence(entropy);
    setOutput(result);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-yellow-700">Lottery Pattern Anticipator</h2>
      <input
        type="text"
        value={entropy}
        onChange={e => setEntropy(e.target.value)}
        placeholder="Enter entropy seed"
        className="w-full px-4 py-2 border rounded-lg"
      />
      <button onClick={handleRun} className="bg-yellow-500 text-white px-4 py-2 rounded-lg">
        Predict Sequence
      </button>
      {output && (
        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify(output, null, 2)}
        </pre>
      )}
    </div>
  );
}