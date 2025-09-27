import React from "react";
import Plot from "react-plotly.js";

const MutationForkPanel = ({ forks }) => {
  if (!forks || forks.length === 0) return <p>No mutation forks available.</p>;

  return (
    <div className="mutation-fork-panel">
      <h2>🧬 Mutation Forks</h2>
      <Plot
        data={forks.map((fork, idx) => ({
          x: fork.map((_, i) => i),
          y: fork,
          type: "scatter",
          mode: "lines+markers",
          name: `Fork ${idx}`,
        }))}
        layout={{
          title: "Mutation Lineage",
          xaxis: { title: "Index" },
          yaxis: { title: "Amplitude", range: [-1, 1] },
        }}
      />
    </div>
  );
};

export default MutationForkPanel;