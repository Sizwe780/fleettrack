// src/security/RoleMatrixV3.ts
type Role = 'driver' | 'dispatcher' | 'admin' | 'sovereign';

interface AccessMatrix {
  [key: string]: {
    read: boolean;
    write: boolean;
    override?: boolean;
  };
}

const defaultMatrix: AccessMatrix = {
  trips: { read: false, write: false },
};

export const getAccessMatrix = (role: Role): AccessMatrix => {
  switch (role) {
    case 'driver':
      return {
        trips: { read: true, write: false },
      };
    case 'dispatcher':
      return {
        trips: { read: true, write: true },
        alerts: { read: true, write: false },
      };
    case 'admin':
      return {
        trips: { read: true, write: true },
        users: { read: true, write: true },
      };
    case 'sovereign':
      return {
        trips: { read: true, write: true, override: true },
        users: { read: true, write: true },
        audit: { read: true, write: false },
      };
    default:
      return defaultMatrix;
  }
};