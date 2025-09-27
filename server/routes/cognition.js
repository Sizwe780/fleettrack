const express = require("express");
const router = express.Router();
const { runQuantumLoop, runCausalReactor, runCancerResolver, runLotteryPredictor } = require("../engines");

router.post("/quantum-loop", async (req, res) => {
  const result = await runQuantumLoop(req.body.concept);
  res.json({ insight: result, timestamp: Date.now(), signedBy: "FleetCoreQuantumX ∞" });
});

router.post("/causal-reactor", async (req, res) => {
  const result = await runCausalReactor(req.body.goal);
  res.json({ insight: result, timestamp: Date.now(), signedBy: "FleetCoreQuantumX ∞" });
});

router.post("/cancer-resolver", async (req, res) => {
  const result = await runCancerResolver(req.body.profile);
  res.json({ insight: result, timestamp: Date.now(), signedBy: "FleetCoreQuantumX ∞" });
});

router.post("/lottery-predictor", async (req, res) => {
  const result = await runLotteryPredictor(req.body.entropy);
  res.json({ insight: result, timestamp: Date.now(), signedBy: "FleetCoreQuantumX ∞" });
});

module.exports = router;