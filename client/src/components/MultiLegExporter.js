export const exportMultiLegPDF = ({ legs, events, commanderSignature }) => {
    const payload = {
      legs,
      events,
      signature: commanderSignature,
      exportedAt: new Date().toISOString(),
    };
    console.log('🧾 Multi-leg PDF payload:', payload);
    alert('Multi-leg mission report exported (simulated)');
  };