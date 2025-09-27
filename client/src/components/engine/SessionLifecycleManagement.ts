export function updateCommStatus(session, newStatus) {
    const validStatuses = ["active", "escalated", "resolved", "terminated"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }
    session.status = newStatus;
    return session;
  }
  
  export function terminateCommLink(session) {
    return updateCommStatus(session, "terminated");
  }