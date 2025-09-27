export function validateSender(session, senderId) {
    return session.participants.some(p => p.id === senderId);
  }
  
  export function sendSecureCommMessage(session, senderId, message) {
    if (!validateSender(session, senderId)) {
      throw new Error(`Unauthorized sender: ${senderId}`);
    }
  
    const msg = {
      sender: senderId,
      message,
      timestamp: Date.now(),
      audit: {
        verified: true,
        method: "role-check",
        signature: `SIG-${senderId}-${Date.now()}`
      }
    };
  
    session.messages.push(msg);
    return msg;
  }