// src/security/EncryptedFleetMessaging.ts

function encryptPayload(data: object): string {
    const json = JSON.stringify(data);
    const base64 = Buffer.from(json).toString('base64');
    return `enc:${base64}`;
  }
  
  export function sendSecureMessage(message: string, fleetId: string): string {
    const payload = encryptPayload({ message, fleetId });
    return `Encrypted message sent to fleet ${fleetId} with payload: ${payload}`;
  }