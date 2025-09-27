import React, { useState, useEffect } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { logCognitionEvent } from '../../utils/logCognitionEvent';
import { ExportLogsheet } from '../../components/application/ExportLogsheet';
import { DVIRForm } from '../../components/application/DVIRForm';
import { DispatchViewer } from '../../components/application/DispatchViewer';
import { CognitionTriggerPanel } from '../../components/application/CognitionTriggerPanel';

export default function DriverConsole({ uid }: { uid: string }) {
  const { saveDVIR, fetchDispatch } = useFirestore();
  const [dispatch, setDispatch] = useState<any>(null);

  const handleDVIRSubmit = async (data: any) => {
    await saveDVIR(uid, data);
    await logCognitionEvent(uid, 'dvirSubmitted', data);
  };

  const handleTrigger = async (type: string, value: number) => {
    await logCognitionEvent(uid, type, value);
  };

  useEffect(() => {
    fetchDispatch(uid).then(setDispatch);
  }, [uid]);

  return (
    <div className="driver-console p-6 space-y-6">
      <h2 className="text-xl font-bold text-indigo-700">🚚 Driver Console</h2>
      <DVIRForm onSubmit={handleDVIRSubmit} />
      <DispatchViewer dispatch={dispatch} />
      <CognitionTriggerPanel onTrigger={handleTrigger} />
      <ExportLogsheet uid={uid} />
    </div>
  );
}