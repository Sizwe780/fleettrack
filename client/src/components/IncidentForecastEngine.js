const IncidentForecastEngine = (trip) => {
    const riskFactors = [];
  
    if (trip.analysis?.ifta?.fuelUsed > 500) riskFactors.push('High fuel consumption');
    if (trip.analysis?.remarks?.includes('engine')) riskFactors.push('Engine-related remark');
    if (trip.analysis?.violations?.includes('maintenance overdue')) riskFactors.push('Maintenance overdue');
  
    const riskLevel = riskFactors.length >= 2 ? 'High' : riskFactors.length === 1 ? 'Moderate' : 'Low';
  
    return { riskLevel, riskFactors };
  };
  
  export default IncidentForecastEngine;