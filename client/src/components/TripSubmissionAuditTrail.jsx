await addDoc(collection(db, 'auditLogs'), {
    action: 'Trip submission cascade',
    actor: userId,
    timestamp: new Date().toISOString(),
    reason: 'TripForm submission → full pipeline'
  });