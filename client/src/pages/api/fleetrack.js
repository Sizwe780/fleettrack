export default function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { seed } = req.body;
  
    if (!seed || typeof seed !== "string" || seed.trim() === "") {
      return res.status(400).json({ error: "Seed is required." });
    }
  
    const insights = Array.from({ length: 3 }).map((_, i) => ({
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
  
    res.status(200).json({ insights });
  }