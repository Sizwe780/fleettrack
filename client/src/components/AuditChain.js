// cockpit/modules/AuditChain.js
import crypto from 'crypto';

let previousHash = '';

export const linkAuditEntry = (entry) => {
  const payload = JSON.stringify(entry);
  const hash = crypto.createHash('sha256').update(payload + previousHash).digest('hex');
  previousHash = hash;

  return {
    ...entry,
    hash,
    timestamp: new Date().toISOString()
  };
};