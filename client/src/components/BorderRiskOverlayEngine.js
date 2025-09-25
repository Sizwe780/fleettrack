export const generateBorderRiskOverlay = ({ route }) => {
    return route.map((r, i) => ({
      zone: r,
      customsDelay: Math.random() > 0.7 ? '🚨 Delay risk' : '✅ Clear',
      riskLevel: Math.random() > 0.8 ? 'High' : 'Low',
    }));
  };