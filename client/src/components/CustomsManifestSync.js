export const syncManifestToBorder = ({ manifest, borderStation }) => {
    const payload = {
      manifest,
      borderStation,
      syncedAt: new Date().toISOString(),
    };
    console.log('📦 Customs sync:', payload);
    alert('Manifest synced to border control (simulated)');
  };