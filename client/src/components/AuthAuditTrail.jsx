await addDoc(collection(db, `apps/fleet-track-app/auditLogs`), {
    action: 'User login',
    actor: userId,
    timestamp: new Date().toISOString(),
    role: userRole
  });