// src/routing/GeoSentienceLayer.ts
interface GeoSignal {
    location: string;
    stressLevel: number;
    fatigueIndex: number;
  }
  
  export function detectGeoStress(signal: GeoSignal): boolean {
    return signal.stressLevel > 70 || signal.fatigueIndex > 60;
  }