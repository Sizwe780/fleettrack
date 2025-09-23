import React, { useEffect } from 'react';
import FleetTrackExportReportEmail from './FleetTrackExportReportEmail';
import { sendEmail } from './emailUtils';
import { renderToStaticMarkup } from 'react-dom/server';

export default function FleetTrackEmailScheduler({ exportHistory = [], recipient = 'compliance@fleettrack.africa' }) {
  useEffect(() => {
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    const monthlyHistory = exportHistory.filter(entry =>
      new Date(entry.timestamp).getMonth() === now.getMonth()
    );

    if (monthlyHistory.length === 0) return;

    const emailPayload = (
      <FleetTrackExportReportEmail
        history={monthlyHistory}
        month={currentMonth}
      />
    );

    const htmlBody = renderToStaticMarkup(emailPayload);

    sendEmail({
      to: recipient,
      subject: `FleetTrack Monthly Export Summary – ${currentMonth}`,
      body: htmlBody,
    });
  }, [exportHistory, recipient]);

  return (
    <div className="text-sm text-gray-600">
      📬 Monthly export report scheduled for delivery to <strong>{recipient}</strong>.
    </div>
  );
}