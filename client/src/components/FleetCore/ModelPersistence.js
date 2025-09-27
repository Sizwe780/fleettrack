// ModelPersistence.js
// Snapshot and restore for online logistic model in FleetCoreNeural.

const Persistence = require('./FleetCorePersistence');
const Neural = require('./FleetCoreNeural');

function snapshotModel() {
  // extract weights and bias
  if (!Neural.__getOnlineModel) return;
  const m = Neural.__getOnlineModel();
  Persistence.saveJSON('onlineModel', { weights: m.weights, bias: m.bias, dims: m.dims });
}

function restoreModel() {
  const data = Persistence.loadJSON('onlineModel');
  if (!data) return false;
  if (!Neural.__setOnlineModel) return false;
  Neural.__setOnlineModel(data);
  return true;
}

module.exports = { snapshotModel, restoreModel };