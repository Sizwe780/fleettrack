export const exportClientBundle = ({ clientId, logsheets, receipts, feedback }) => {
    const bundle = {
      clientId,
      logsheets,
      receipts,
      feedback,
      exportedAt: new Date().toISOString(),
    };
    console.log('📤 Exporting client bundle:', bundle);
    alert('Client export bundle ready (simulated)');
  };