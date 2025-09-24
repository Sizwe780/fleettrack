import React, { useEffect } from 'react';
import FleetTrackExportDigest from './FleetTrackExportDigest';
import { sendEmail } from './emailUtils';
import { renderToStaticMarkup } from 'react-dom/server';

export default function FleetTrackExportDigestEmail({ exportHistory = [], recipient = 'ops@fleettrack.africa' }) {
  useEffect(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const weeklyHistory = exportHistory.filter(entry => {
      const ts = new Date(entry.timestamp);
      return ts >= startOfWeek && ts <= now;
    });

    if (weeklyHistory.length === 0) return;

    const weekLabel = `Week of ${startOfWeek.toLocaleDateString()}–${now.toLocaleDateString()}`;
    const emailPayload = (
      <FleetTrackExportDigest
        history={weeklyHistory}
        weekLabel={weekLabel}
      />
    );

    const htmlBody = renderToStaticMarkup(emailPayload);

    sendEmail({
      to: recipient,
      subject: `FleetTrack Weekly Export Digest – ${weekLabel}`,
      body: htmlBody,
    });
  }, [exportHistory, recipient]);

  return (
    <div className="text-sm text-gray-600">
      📬 Weekly export digest scheduled for delivery to <strong>{recipient}</strong>.
    </div>
  );
}