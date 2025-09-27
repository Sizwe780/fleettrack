// FleetCorePulse.js
// Generates a pulse signal object based on confidence levels

function generatePulseSignal({ pair, confidence }) {
    const signal = confidence >= 0.85
      ? "Strong Buy"
      : confidence >= 0.65
      ? "Buy"
      : confidence >= 0.45
      ? "Hold"
      : confidence >= 0.25
      ? "Sell"
      : "Strong Sell";
  
    return {
      pair,
      confidence,
      signal,
      timestamp: Date.now(),
    };
  }
  
  export default generatePulseSignal;