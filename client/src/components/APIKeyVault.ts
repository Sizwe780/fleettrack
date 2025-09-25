// governance/APIKeyVault.ts
const keys = new Map();

export const storeKey = (userId: string, key: string) => {
  keys.set(userId, { key, created: Date.now() });
};

export const validateKey = (userId: string, key: string) => {
  const record = keys.get(userId);
  return record?.key === key;
};