export function initiateCommLink({ driverId, tripId, location }) {
    return {
      sessionId: `ECL-${tripId}-${Date.now()}`,
      participants: [
        { role: "Driver", id: driverId },
        { role: "ProtectionUnit", id: "CampusSecurity" },
        { role: "FleetAI", id: "QuantumConsole" }
      ],
      location,
      status: "active",
      messages: []
    };
  }
  
  export function sendCommMessage(session, sender, message) {
    const msg = {
      sender,
      message,
      timestamp: Date.now()
    };
    session.messages.push(msg);
    return msg;
  }