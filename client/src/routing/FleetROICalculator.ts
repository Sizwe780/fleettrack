// src/analytics/FleetROICalculator.ts
export function calculateROI(costs: number, savings: number): string {
    const roi = ((savings - costs) / costs) * 100;
    return `${roi.toFixed(2)}% ROI`;
  }