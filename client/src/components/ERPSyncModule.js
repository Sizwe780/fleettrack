export const syncToERP = ({ clientId, invoices, payroll, logsheets }) => {
    const payload = {
      clientId,
      invoices,
      payroll,
      logsheets,
      syncedAt: new Date().toISOString(),
    };
    console.log('📤 ERP sync payload:', payload);
    alert('ERP sync complete (simulated)');
  };