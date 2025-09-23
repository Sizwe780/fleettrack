import React from 'react';
import FleetPulseMap from './FleetPulseMap'; // Optional live heatmap
import StatBadge from './StatBadge'; // Reusable stat component

const LandingHero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-900 to-blue-600 text-white py-16 px-6 md:px-12">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Africa’s Smartest Fleet Platform
        </h1>
        <p className="text-lg md:text-xl mb-6">
          Real-time tracking. Predictive maintenance. Offline-first intelligence.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <StatBadge label="Trips Logged" value="12,480+" />
          <StatBadge label="Drivers Onboarded" value="320+" />
          <StatBadge label="Fleet Health Accuracy" value="98%" />
        </div>

        <div className="rounded-xl overflow-hidden shadow-lg border border-white">
          <FleetPulseMap />
        </div>

        <p className="mt-6 text-sm text-blue-100">
          Built for South African fleets. Scales continent-wide.
        </p>
      </div>
    </section>
  );
};

export default LandingHero;