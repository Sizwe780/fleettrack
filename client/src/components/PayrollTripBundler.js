export const bundleTripsForPayroll = ({ driverId, trips }) => {
    const totalHours = trips.reduce((sum, t) => sum + t.durationHours, 0);
    const totalTrips = trips.length;
    const bundle = {
      driverId,
      totalTrips,
      totalHours,
      payPeriod: 'Sep 2025',
      exportedAt: new Date().toISOString(),
    };
    console.log('🧾 Payroll bundle:', bundle);
    return bundle;
  };