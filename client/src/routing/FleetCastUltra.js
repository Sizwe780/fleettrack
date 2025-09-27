// src/ops/FleetCastUltra.js
import { sendEncryptedMessage } from '../security/EncryptedFleetMessaging';

export function broadcastToFleet(message, fleetId, routeId) {
  const payload = {
    fleetId,
    routeId,
    message,
    timestamp: new Date().toISOString(),
  };

  return sendEncryptedMessage(JSON.stringify(payload), fleetId);
}