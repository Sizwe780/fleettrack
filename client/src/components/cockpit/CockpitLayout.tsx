import React from 'react';
import CockpitView from './CockpitView';
import SidebarLayout from '../../components/SidebarLayout';

// ✅ Use static path for logo if it's in /public
const fleetTrackLogoPath = '/icon-192.png';

export default function CockpitLayout({ uid }: { uid: string }) {
  return (
    <SidebarLayout
      logo={fleetTrackLogoPath}
      title="FleetTrack ∞ Cockpit"
      navItems={[
        { label: 'Personal Intelligence', route: '/cockpit/personal' },
        { label: 'Vehicle Surveillance', route: '/cockpit/vehicle' },
        { label: 'Logistics Intelligence', route: '/cockpit/logistics' },
        { label: 'Billing & Compliance', route: '/cockpit/billing' },
        { label: 'Admin Console', route: '/cockpit/admin' },
        { label: 'FleetMarket', route: '/cockpit/modules' }
      ]}
      footer={
        <div className="footer-meta">
          <p><strong>UID:</strong> {uid}</p>
          <p><strong>Cert ID:</strong> CERT-{uid}-{new Date().toISOString()}</p>
          <p>
            <strong>Status:</strong>{' '}
            <span style={{ color: '#28a745' }}>✅ Mutation-safe</span> ·{' '}
            <span style={{ color: '#17a2b8' }}>🧠 Cognition-ready</span> ·{' '}
            <span style={{ color: '#007bff' }}>📤 Export-compliant</span>
          </p>
        </div>
      }
    >
      <CockpitView uid={uid} />
    </SidebarLayout>
  );
}