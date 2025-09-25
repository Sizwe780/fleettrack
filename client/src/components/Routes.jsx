import {
    PilotPanel,
    DispatcherPanel,
    EmployerPanel,
    AuditorPanel,
    RegulatorPanel
  } from '../modules/TripModules';
  
  export const getPanelByRole = (role) => {
    switch (role) {
      case 'pilot': return <PilotPanel />;
      case 'dispatcher': return <DispatcherPanel />;
      case 'employer': return <EmployerPanel />;
      case 'auditor': return <AuditorPanel />;
      case 'regulator': return <RegulatorPanel />;
      default: return <DispatcherPanel />;
    }
  };