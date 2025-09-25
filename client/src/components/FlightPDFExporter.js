export const generateFlightPDF = async ({ flight, events, pilotSignature }) => {
    const payload = {
      flightId: flight.id,
      pilot: flight.pilot,
      aircraft: flight.aircraft,
      departureTime: flight.departureTime,
      events,
      signature: pilotSignature,
    };
    console.log('📤 Flight PDF Payload:', payload);
    alert('Flight report exported as PDF (simulated)');
  };