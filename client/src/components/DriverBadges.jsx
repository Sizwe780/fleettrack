import React from 'react';

const getBadges = (driverStats) => {
  const badges = [];

  if (driverStats.totalTrips >= 100) {
    badges.push({ label: 'Century Driver', color: 'bg-yellow-100 text-yellow-800' });
  }

  if (driverStats.violationCount === 0 && driverStats.totalTrips >= 20) {
    badges.push({ label: 'Zero Violation', color: 'bg-green-100 text-green-800' });
  }

  if (driverStats.avgHealthScore >= 90) {
    badges.push({ label: 'Fleet Health Champ', color: 'bg-blue-100 text-blue-800' });
  }

  if (driverStats.avgProfit >= 1000) {
    badges.push({ label: 'Profit Driver', color: 'bg-purple-100 text-purple-800' });
  }

  return badges;
};

const DriverBadges = ({ driverStats }) => {
  const badges = getBadges(driverStats);

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {badges.map((badge, i) => (
        <span key={i} className={`px-3 py-1 text-sm rounded-full font-medium ${badge.color}`}>
          {badge.label}
        </span>
      ))}
      {badges.length === 0 && (
        <span className="text-sm text-gray-500">No badges earned yet</span>
      )}
    </div>
  );
};

export default DriverBadges;