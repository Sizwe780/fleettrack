// ForexConfig.js
module.exports = {
    pairs: ['EURUSD','USDJPY','GBPUSD'],
    defaultHorizonBars: 5,
    defaultBarMs: 60000,
    paperMode: true,           // default: paper trading only
    liveEnabled: false,        // must be enabled manually by governance
    maxLiveAllocationPct: 0.005, // 0.5% of capital per strategy as a safe default
    maxDailyLossPct: 0.02,     // 2% daily loss kill-switch
    maxSingleTradeLossPct: 0.005,
    defaultRiskFraction: 0.002, // fraction of capital per trade (used by risk engine)
    atrPeriod: 14,
    featureWindow: 64,
    predictionIntervalMs: 10000, // how often predictor runs per pair
    persistencePrefix: 'forex-pred-',
    modelSnapshotKey: 'forex-model-snapshot'
  };