export const exportPublicSectorBundle = ({ department, logsheets, receipts, complianceScores }) => {
    const bundle = {
      department,
      logsheets,
      receipts,
      complianceScores,
      exportedAt: new Date().toISOString(),
    };
    console.log('📤 Public sector export:', bundle);
    alert('Export bundle ready for government audit (simulated)');
  };