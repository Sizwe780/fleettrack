// infrastructure/APIKeyVault.ts
const validKeys: Record<string, string> = {
    'user-123': 'key-abc',
    'admin-456': 'key-def',
  };
  
  export function validateKey(userId: string, apiKey: string): boolean {
    return validKeys[userId] === apiKey;
  }