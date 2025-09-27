import axios from "axios";

export const runQuantumLoop = async ({ concept }) =>
  axios.post("/api/cognition/quantum-loop", { concept }).then(res => res.data);

export const runCausalReactor = async ({ goal }) =>
  axios.post("/api/cognition/causal-reactor", { goal }).then(res => res.data);

export const runCancerResolver = async ({ profile }) =>
  axios.post("/api/cognition/cancer-resolver", { profile }).then(res => res.data);

export const runLotteryPredictor = async ({ entropy }) =>
  axios.post("/api/cognition/lottery-predictor", { entropy }).then(res => res.data);