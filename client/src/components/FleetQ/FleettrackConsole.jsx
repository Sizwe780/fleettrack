import React, { useState } from "react";

function FleetTrackConsole() {
  const [seed, setSeed] = useState("");
  const [insights, setInsights] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const generateInsights = () => {
    setError("");
    setLoading(true);

    if (!seed.trim()) {
      setError("Seed is required.");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      const mock = Array.from({ length: 3 }).map((_, i) => ({
        id: `insight-${i}`,
        payload: {
          depth: Math.floor(Math.random() * 100),
          inserted: `Payload-${i}`,
          insight_score: parseFloat((Math.random() * 10).toFixed(2)),
          veto_triggered: Math.random() > 0.5,
          collapse_vector: Array.from({ length: 5 }, () =>
            parseFloat((Math.random() * 1).toFixed(4))
          ),
        },
      }));
      setInsights(mock);
      setLoading(false);
    }, 1000);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(insights, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fleettrack_insights.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "auto" }}>
      <h2>🚀 FleetTrack Console</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="Enter seed"
          style={{
            padding: "0.5rem",
            width: "60%",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginRight: "0.5rem",
          }}
        />
        <button
          onClick={generateInsights}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Generating..." : "Run"}
        </button>
        <button
          onClick={exportJSON}
          disabled={insights.length === 0}
          style={{
            marginLeft: "0.5rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: insights.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          Export JSON
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {insights.length > 0 && (
        <div>
          <h3>🧠 Preemptive Insights</h3>
          {insights.map((item, index) => {
            const { depth, inserted, insight_score, veto_triggered, collapse_vector } = item.payload;
            return (
              <div
                key={index}
                style={{
                  marginBottom: "1rem",
                  border: "1px solid #ccc",
                  padding: "1rem",
                  borderRadius: "4px",
                  backgroundColor: "#fefefe",
                }}
              >
                <p><strong>Depth:</strong> {depth}</p>
                <p><strong>Payload:</strong> {inserted}</p>
                <p><strong>Insight Score:</strong> {insight_score}</p>
                <p><strong>Veto Triggered:</strong> {veto_triggered ? "✅ Yes" : "❌ No"}</p>
                <p><strong>Collapse Vector:</strong> [{collapse_vector.join(", ")}]</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FleetTrackConsole;