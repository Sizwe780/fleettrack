// governance/SnapshotTracer.tsx
import React, { useEffect } from 'react';

const SnapshotTracer = ({ payload, children }) => {
  useEffect(() => {
    console.log('SnapshotTracer:', payload);
  }, [payload]);

  return <>{children}</>;
};

export default SnapshotTracer;