// TEMPORARY FIX
const onlineModel = {}; // or null, or a mock function if needed
// persistence helpers
function __getOnlineModel() {
    return { weights: onlineModel.weights, bias: onlineModel.bias, dims: onlineModel.dims };
  }
  function __setOnlineModel(data) {
    if (!data) return;
    onlineModel.weights = data.weights || onlineModel.weights;
    onlineModel.bias = data.bias || onlineModel.bias;
    onlineModel.dims = data.dims || onlineModel.dims;
  }
  
  module.exports.__getOnlineModel = __getOnlineModel;
  module.exports.__setOnlineModel = __setOnlineModel;