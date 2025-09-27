import React, { useState } from "react";
import axios from "axios";

const InsightMint = () => {
  const [userId, setUserId] = useState("");
  const [insightId, setInsightId] = useState("");
  const [payload, setPayload] = useState("");
  const [credit, setCredit] = useState(null);

  const mintCredit = async () => {
    try {
      const response = await axios.post("/api/mint_credit", {
        user_id: userId,
        insight_id: insightId,
        insight_payload: payload,
      });
      setCredit(response.data);
    } catch (error) {
      console.error("Minting failed:", error);
    }
  };

  return (
    <div className="insight-mint">
      <h2>🧠 Mint Insight Credit</h2>
      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Insight ID"
        value={insightId}
        onChange={(e) => setInsightId(e.target.value)}
      />
      <textarea
        placeholder="Insight Payload (JSON)"
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
      />
      <button onClick={mintCredit}>Mint Credit</button>

      {credit && (
        <div className="credit-display">
          <h3>✅ Credit Minted</h3>
          <pre>{JSON.stringify(credit, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default InsightMint;