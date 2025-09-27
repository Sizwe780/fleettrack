import React, { useState } from "react";
import CollapseVectorViewer from "./CollapseVectorViewer";
import InsightMint from "./InsightMint";
import FleetTrackConsole from "./FleetTrackConsole";
import MutationForkPanel from "./MutationForkPanel";
import GenesisChainViewer from "./GenesisChainViewer";
import axios from "axios";

const FleetQDashboard = () => {
  const [seed, setSeed] = useState("");
  const [collapseVector, setCollapseVector] = useState([]);
  const [mutationForks, setMutationForks] = useState([]);
  const [genesisChain, setGenesisChain] = useState([]);

  const runCollapse = async () => {
    try {
      const response = await axios.post("/api/collapse", { seed });
      setCollapseVector(response.data.mutated_vector || []);
    } catch (error) {
      console.error("Collapse failed:", error);
    }
  };

  const runGenesisChain = async () => {
    try {
      const response = await axios.post("/api/genesis_chain", {
        seed,
        length: 10,
      });
      setGenesisChain(response.data || []);
    } catch (error) {
      console.error("GenesisChain failed:", error);
    }
  };

  return (
    <div className="fleetq-dashboard">
      <h1>🧠 FleetCoreQuantumX ∞ Dashboard</h1>
      <input
        type="text"
        placeholder="Seed"
        value={seed}
        onChange={(e) => setSeed(e.target.value)}
      />
      <button onClick={runCollapse}>Simulate Collapse</button>
      <button onClick={runGenesisChain}>Render GenesisChain</button>

      <CollapseVectorViewer vector={collapseVector} />
      <InsightMint />
      <FleetTrackConsole />
      <MutationForkPanel forks={mutationForks} />
      <GenesisChainViewer chain={genesisChain} />
    </div>
  );
};

export default FleetQDashboard;