const Persistence = require('./ResearchReportPersistence');
const Config = require('./ResearchReportConfig');

// 🔁 Conditional imports based on environment
const isProd = process.env.NODE_ENV === 'production';

const Audit = isProd ? require('../FleetCoreAudit') : { log: () => {} };
const Pulse = isProd ? require('../FleetCorePulse') : { inc: () => {} };
const fs = isProd ? require('fs') : { mkdirSync: () => {}, writeFileSync: () => {} };
const path = isProd ? require('path') : { resolve: () => '', join: () => '' };
const nodemailer = isProd
  ? require('nodemailer')
  : { createTransport: () => ({ sendMail: async () => ({}) }) };

async function sendEmail(recipients = [], subject, htmlBody) {
  if (!recipients || recipients.length === 0) {
    return { ok: false, reason: 'no recipients' };
  }

  const smtp = Config?.email?.smtp;
  const transporter = nodemailer.createTransport(smtp);
  const mail = {
    from: Config?.email?.from || 'noreply@fleettrack.ai',
    to: recipients.join(','),
    subject,
    html: htmlBody,
  };

  try {
    const timestamp = new Date().toISOString();

    if (smtp?.host === 'localhost') {
      const file = `email-${Date.now()}.html`;
      Audit.log('research.report.email.saved', { recipients, file, timestamp });
      return { ok: true, devFile: file };
    }

    const info = await transporter.sendMail(mail);
    Audit.log('research.report.email.sent', { recipients, info, timestamp });
    Pulse.inc('researchReportsEmailed', recipients.length);
    return { ok: true, info };
  } catch (e) {
    Audit.log('research.report.email.error', {
      error: String(e),
      recipients,
      timestamp: new Date().toISOString(),
    });
    return { ok: false, error: String(e) };
  }
}

async function publishToEndpoint(report, app) {
  if (!report?.projectId || !report?.dateKey) {
    return { ok: false, reason: 'invalid report metadata' };
  }

  const pubDir = path.resolve(__dirname, '..', 'data', 'public', 'reports', report.projectId);
  fs.mkdirSync(pubDir, { recursive: true });

  const target = path.join(pubDir, `${report.dateKey}.json`);
  fs.writeFileSync(target, JSON.stringify(report, null, 2), 'utf8');

  Audit.log('research.report.published', {
    projectId: report.projectId,
    path: target,
    timestamp: new Date().toISOString(),
  });

  return { ok: true, path: target };
}

module.exports = { sendEmail, publishToEndpoint };