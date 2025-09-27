export function getStudentPilotFeatures({ isNovice, isFatigued }) {
    const base = [
      "Simplified UI",
      "Guided trip replay",
      "Hazard warnings",
      "Mobile sync",
      "Voice command console"
    ];
  
    if (isNovice) base.push("Trip walkthrough mode", "Route complexity explainer");
    if (isFatigued) base.push("Fatigue alerts", "Break reminders", "Reroute suggestions");
  
    return base;
  }

  export const getTrainingModules = () => [
    "Navigation Basics",
    "Fuel Management",
    "Emergency Protocols"
  ];
  
  export const getModuleStatus = (moduleName) => ({
    module: moduleName,
    status: "incomplete",
    lastAccessed: new Date().toISOString()
  });