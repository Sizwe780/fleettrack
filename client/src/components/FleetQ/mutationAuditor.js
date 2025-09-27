function logMutation({ actor, action, before, after }) {
    return {
      actor,
      action,
      before,
      after,
      timestamp: Date.now(),
      hash: generateHash({ actor, action, before, after })
    };
  }