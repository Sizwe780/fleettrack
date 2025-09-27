// ProcessWorker.js
// Worker thread entry that delegates to FleetCoreNeural handlers.

const { parentPort } = require('worker_threads');
const Neural = require('./FleetCoreNeural');

parentPort.on('message', async msg => {
  if (msg.type !== 'task') return;
  const { payload } = msg;
  try {
    let result;
    switch (payload.handler) {
      case 'simulate':
        result = await Neural.runSimulation(payload.args);
        break;
      case 'mentorMatch':
        result = await Neural.matchMentors(payload.args);
        break;
      case 'predictPublish':
        result = await Neural.predictPublishQuality(payload.args);
        break;
      case 'updatePublishModel':
        result = await Neural.updatePublishModel(payload.args.module, payload.args.outcome);
        break;
      case 'trackGrowth':
        result = await Neural.trackGrowth(payload.args);
        break;
      default:
        result = { ok: false, reason: 'unknown handler' };
    }
    parentPort.postMessage({ type: 'result', result });
  } catch (err) {
    parentPort.postMessage({ type: 'error', error: String(err) });
  }
});