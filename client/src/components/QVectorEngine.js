// cockpit/engine/QVectorEngine.js
export class QVectorEngine {
    constructor() {
      this.stateSpace = [];
      this.traceLog = [];
    }
  
    entangle(variables) {
      this.stateSpace.push(variables);
    }
  
    simulate(decisionTree) {
      const outcomes = decisionTree.map(branch => {
        const probability = this.calculateProbability(branch);
        return { ...branch, probability };
      });
  
      this.traceLog.push({
        timestamp: Date.now(),
        outcomes
      });
  
      return outcomes.sort((a, b) => b.probability - a.probability);
    }
  
    calculateProbability(branch) {
      const weights = branch.factors.map(f => f.weight * f.value);
      const sum = weights.reduce((a, b) => a + b, 0);
      return Math.min(1, sum / 100);
    }
  
    exportTrace() {
      return this.traceLog.map(log => ({
        timestamp: new Date(log.timestamp).toISOString(),
        topOutcome: log.outcomes[0]
      }));
    }
  }