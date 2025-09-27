// /core/research/ResearchReportConfig.js

module.exports = {
  // TEMPORARY: Stubbed path resolution for frontend compatibility
  dataDir: 'data', // Replace with actual path logic in backend

  email: {
    from: 'no-reply@fleetcore.example',
    smtp: {
      host: 'localhost',
      port: 1025,
      auth: null,
    },
  },

  archiveToS3: false, // set true and provide credentials in env to enable S3 upload
  defaultTime: '08:00', // default report time (HH:mm, server TZ)
  retentionDays: 365,
  maxPredictionsInReport: 50,
};