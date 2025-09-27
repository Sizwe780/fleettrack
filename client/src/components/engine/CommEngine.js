export function fleetAIResponse(session, incomingMessage) {
    if (!session || !incomingMessage) return null;
  
    const triggers = [
      { keyword: "panic", response: "Driver distress detected. Escalating to ProtectionUnit." },
      { keyword: "accident", response: "Incident logged. Dispatching emergency protocol." },
      { keyword: "delay", response: "Trip delay noted. Adjusting route and notifying stakeholders." }
    ];
  
    for (const trigger of triggers) {
      if (incomingMessage.toLowerCase().includes(trigger.keyword)) {
        return sendSecureCommMessage(session, "FleetAI", trigger.response);
      }
    }
  
    return null;
  }