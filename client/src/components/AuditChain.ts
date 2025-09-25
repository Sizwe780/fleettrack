// compliance/AuditChain.ts
import crypto from 'crypto';

export type AuditEntry = {
  type: string;
  payload: object;
  timestamp: string;
  previousHash: string;
  hash: string;
};

let auditChain: AuditEntry[] = [];

const generateHash = (entry: Omit<AuditEntry, 'hash'>): string => {
  return crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex');
};

export const logChainEvent = (type: string, payload: object): void => {
  const previousHash = auditChain.length ? auditChain[auditChain.length - 1].hash : '';
  const baseEntry = {
    type,
    payload,
    timestamp: new Date().toISOString(),
    previousHash,
  };
  const hash = generateHash(baseEntry);
  auditChain.push({ ...baseEntry, hash });
};

export const getAuditChain = (): AuditEntry[] => {
  return [...auditChain]; // return a copy for safety
};

export const resetAuditChain = (): void => {
  auditChain = [];
};