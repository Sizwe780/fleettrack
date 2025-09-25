export const exportDossier = ({ fleetId, logsheets, receipts, scores, signatures }) => {
    const dossier = {
      fleetId,
      logsheets,
      receipts,
      scores,
      signatures,
      exportedAt: new Date().toISOString(),
    };
    console.log('📤 Compliance dossier:', dossier);
    alert('Dossier ready for audit or investor export (simulated)');
  };