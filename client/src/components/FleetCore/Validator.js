// Validator.js
// Runs candidate signals through a light walk-forward simulator with slippage and transaction cost model.
// Expects: historicalCandles(pair, timeframe, start, end) to be provided as function in opts.

const { runSimulation } = require('./FleetCoreNeural'); // optional MonteCarlo helper for stress
const crypto = require('crypto');

function defaultTTC(price, side, size, opts = {}) {
  // simple transaction cost: spread + slippage proportional to size*impactFactor
  const spread = opts.spread || 0.0001; // example 1 pip ~ 0.0001
  const impact = (opts.impactFactor || 0.00002) * Math.max(1, size);
  return spread + impact;
}

// very small backtest engine for decisions: candle array [{ t, open, high, low, close, volume }]
function runWalkForward(candles = [], signals = [], opts = {}) {
  // signals: [{ ts, decision: 'buy'|'sell', size, horizonBars }]
  // returns summary metrics
  if (!candles || candles.length === 0) return { ok: false, reason: 'no-data' };

  const priceAt = ts => {
    // find candle with t >= ts or last close
    const c = candles.find(ca => ca.t >= ts);
    return c ? c.open : candles[candles.length - 1].close;
  };

  let trades = [];
  for (const s of signals) {
    const entryPrice = priceAt(s.ts);
    const exitIdx = candles.findIndex(c => c.t >= (s.ts + (s.horizonBars || 1) * (opts.barMs || 60000)));
    const exitCandle = exitIdx >= 0 ? candles[exitIdx] : candles[candles.length - 1];
    const exitPrice = exitCandle.close;
    const direction = (s.decision === 'buy') ? 1 : -1;
    const rawPnL = direction * (exitPrice - entryPrice) * (s.size || 1);
    const cost = defaultTTC(entryPrice, s.decision, s.size || 1, opts) + defaultTTC(exitPrice, s.decision, s.size || 1, opts);
    const netPnL = rawPnL - cost;
    trades.push({ entryPrice, exitPrice, rawPnL, netPnL, ts: s.ts, decision: s.decision, size: s.size });
  }

  const wins = trades.filter(t => t.netPnL > 0).length;
  const losses = trades.length - wins;
  const winRate = trades.length ? wins / trades.length : 0;
  const avgWin = trades.filter(t => t.netPnL > 0).reduce((a, b) => a + b.netPnL, 0) / Math.max(1, wins);
  const avgLoss = trades.filter(t => t.netPnL <= 0).reduce((a, b) => a + b.netPnL, 0) / Math.max(1, losses || 1);
  const expectancy = trades.length ? trades.reduce((a, b) => a + b.netPnL, 0) / trades.length : 0;
  const totalNet = trades.reduce((a, b) => a + b.netPnL, 0);
  const maxDrawdown = computeDrawdown(trades);

  return {
    id: `val-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    ts: Date.now(),
    ok: true,
    trades,
    stats: { count: trades.length, winRate, avgWin, avgLoss, expectancy, totalNet, maxDrawdown }
  };
}

function computeDrawdown(trades) {
  // simple cumulative P&L drawdown
  let cum = 0;
  let peak = 0;
  let maxDd = 0;
  trades.forEach(t => {
    cum += t.netPnL;
    if (cum > peak) peak = cum;
    const dd = peak - cum;
    if (dd > maxDd) maxDd = dd;
  });
  return maxDd;
}

module.exports = { runWalkForward, defaultTTC, computeDrawdown };