export function broadcastPanic(alertPayload) {
    const recipients = [
      "Nearby FleetTrack users",
      "Campus Security",
      "Emergency Dispatch",
      "Trusted Contacts"
    ];
  
    recipients.forEach(recipient => {
      console.log(`Broadcasting to ${recipient}:`, alertPayload.message);
      // Future: push notification, SMS, voice alert
    });
  
    return {
      broadcasted: true,
      recipients,
      escalationTimer: 60000 // 60 seconds
    };
  }