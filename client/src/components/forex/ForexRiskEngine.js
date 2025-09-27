import FleetCorePersistence from '/fleetcore/FleetCorePersistence';
import FleetCoreAudit from '/fleetcore/FleetCoreAudit';
// ForexRiskEngine.js
// Converts predictions to position sizing and enforces kill-switches and exposure/limits.

const Config = require('./ForexConfig');
const Persistence = require('../FleetCorePersistence');
const Audit = require('../FleetCoreAudit');

let state = {
  capital: 100000, // simulated capital; persist/override in production
  dailyLoss: 0,
  lastResetDay: new Date().toISOString().slice(0,10),
  enabledLive: false
};

function loadState() {
  const s = Persistence.loadJSON('forex-risk-state');
  if (s) state = Object.assign(state, s);
}
function saveState() { Persistence.saveJSON('forex-risk-state', state); }

function resetDailyIfNeeded() {
  const today = new Date().toISOString().slice(0,10);
  if (state.lastResetDay !== today) {
    state.dailyLoss = 0;
    state.lastResetDay = today;
    saveState();
  }
}

function computeSize(prediction) {
  // fractional Kelly-lite style sizing with ATR scaling (ATR stubbed)
  resetDailyIfNeeded();
  const edge = Math.max(0.0001, Math.abs(prediction.ensemble.ensembleScore)); // small floor
  const volScale = 1; // stub: use ATR to scale
  const riskFraction = Config.defaultRiskFraction;
  const size = Math.max(0.0001, state.capital * riskFraction * edge * volScale); // notional sizing
  return Math.min(size, state.capital * Config.maxLiveAllocationPct);
}

function registerTradeOutcome(pnl) {
  state.dailyLoss += Math.min(0, pnl); // accumulate losses
  saveState();
  if (Math.abs(state.dailyLoss) > state.capital * Config.maxDailyLossPct) {
    Audit.log('forex.risk.kill', { reason: 'daily-loss', dailyLoss: state.dailyLoss, cap: state.capital * Config.maxDailyLossPct });
    // signal kill (consumer should enforce)
    return { kill: true, reason: 'daily-loss' };
  }
  return { kill: false };
}

function canLiveTrade() {
  return state.enabledLive && !Config.paperMode && !isKilled();
}

function isKilled() {
  // simple: daily loss threshold check + other flags
  return Math.abs(state.dailyLoss) > state.capital * Config.maxDailyLossPct;
}

// admin controls
function enableLive(by) { state.enabledLive = true; saveState(); Audit.log('forex.risk.enableLive', { by }); }
function disableLive(by) { state.enabledLive = false; saveState(); Audit.log('forex.risk.disableLive', { by }); }

loadState();

module.exports = { computeSize, registerTradeOutcome, canLiveTrade, isKilled, enableLive, disableLive, state };