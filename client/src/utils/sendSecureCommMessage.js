// src/utils/sendSecureCommMessage.js

/**
 * Securely logs and dispatches a message into the session.
 * Adds audit-grade timestamp and sender metadata.
 *
 * @param {Object} session - The active FleetTrack session object
 * @param {string} sender - The sender of the message (e.g. "FleetAI", "Driver")
 * @param {string} message - The message content to dispatch
 * @returns {Object|null} - The dispatched message payload
 */
export function sendSecureCommMessage(session, sender, message) {
    if (
      !session ||
      typeof sender !== "string" ||
      typeof message !== "string" ||
      sender.trim() === "" ||
      message.trim() === ""
    ) {
      console.warn("⚠️ Invalid message dispatch attempt.");
      return null;
    }
  
    const payload = {
      sender,
      message,
      timestamp: Date.now(),
      auditId: `MSG-${session.sessionId || "UNKNOWN"}-${Date.now()}`
    };
  
    if (Array.isArray(session.messages)) {
      session.messages.push(payload);
    } else {
      session.messages = [payload];
    }
  
    console.log(`📨 [${payload.sender}] ${payload.message}`);
    return payload;
  }