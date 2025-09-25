export const validateCertification = ({ tripData }) => {
    const isoCompliant = tripData.logsheets.length > 0 && tripData.signature;
    const aviationCompliant = tripData.altitude && tripData.pilot;
    const transportCompliant = tripData.route && tripData.slaScore >= 80;
  
    return {
      ISO_9001: isoCompliant,
      ICAO: aviationCompliant,
      DOT: transportCompliant,
    };
  };