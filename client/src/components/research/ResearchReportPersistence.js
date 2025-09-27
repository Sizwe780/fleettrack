// /core/research/ResearchReportPersistence.js

// TEMPORARY STUBS TO PREVENT BUILD ERRORS IN FRONTEND
const fs = {
  existsSync: () => false,
  mkdirSync: () => {},
  writeFileSync: () => {},
  readFileSync: () => '{}',
  readdirSync: () => [],
};

const path = {
  join: (...args) => args.join('/'),
};

const dataDir = 'data'; // placeholder path

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

function saveReport(projectId, dateKey, report) {
  const dir = path.join(dataDir, 'research-reports', projectId);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${dateKey}.json`);
  fs.writeFileSync(file, JSON.stringify(report, null, 2), 'utf8');
  return file;
}

function loadReport(projectId, dateKey) {
  const file = path.join(dataDir, 'research-reports', projectId, `${dateKey}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function listReports(projectId, limit = 30) {
  const dir = path.join(dataDir, 'research-reports', projectId);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, limit);
}

module.exports = { saveReport, loadReport, listReports };