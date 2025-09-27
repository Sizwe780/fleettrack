// EnsembleAggregator.js
// Blends multiple model outputs into a consensus signal

function simpleHash(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
  
  function normalizeScores(outputs) {
    const scores = outputs.map(o => o.confidence);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const std = Math.sqrt(scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length);
    return outputs.map(o => ({
      ...o,
      zscore: std === 0 ? 0 : (o.confidence - mean) / std,
    }));
  }
  
  export default function EnsembleAggregator(models) {
    const normalized = normalizeScores(models);
    const avgZ = normalized.reduce((a, b) => a + b.zscore, 0) / normalized.length;
    const avgConfidence = models.reduce((a, b) => a + b.confidence, 0) / models.length;
  
    return {
      consensus: avgZ > 0.5 ? "Strong Buy"
                : avgZ > 0.2 ? "Buy"
                : avgZ > -0.2 ? "Hold"
                : avgZ > -0.5 ? "Sell"
                : "Strong Sell",
      confidence: avgConfidence,
      modelCount: models.length,
      blendId: simpleHash(JSON.stringify(models)),
      timestamp: Date.now(),
    };
  }