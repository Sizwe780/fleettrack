export const generateMissionPDF = async ({ mission, events, signatureDataUrl }) => {
    // Simulated payload structure
    const payload = {
      missionId: mission.id,
      commander: mission.commander,
      vehicle: mission.vehicle,
      launchTime: mission.launchTime,
      events,
      signature: signatureDataUrl,
    };
  
    console.log('📄 PDF Export Payload:', payload);
    alert('Mission report exported as PDF (simulated)');
  };