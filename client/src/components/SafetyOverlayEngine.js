export const exportAuditBundle = ({ tripId, logsheets, receipts, signature, complianceScore }) => {
    const bundle = {
      tripId,
      logsheets,
      receipts,
      signature,
      complianceScore,
      exportedAt: new Date().toISOString(),
    };
    console.log('📋 Audit bundle:', bundle);
    alert('Audit bundle exported (simulated)');
  };