export const syncFleetToRegistry = ({ fleet }) => {
    const payload = {
      fleet,
      syncedAt: new Date().toISOString(),
      registry: 'South Africa National Transport Authority',
    };
    console.log('📡 Registry sync:', payload);
    alert('Fleet data synced to national registry (simulated)');
  };