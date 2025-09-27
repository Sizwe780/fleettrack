export function getSessionSummary(session) {
    return {
      sessionId: session.sessionId,
      status: session.status,
      participants: session.participants,
      lastMessage: session.messages[session.messages.length - 1],
      messageCount: session.messages.length,
      location: session.location
    };
  }