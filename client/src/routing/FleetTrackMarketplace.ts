// src/analytics/FleetTrackMarketplace.ts
interface Plugin {
    name: string;
    version: string;
    active: boolean;
  }
  
  export function listActivePlugins(plugins: Plugin[]): string[] {
    return plugins.filter(p => p.active).map(p => `${p.name}@${p.version}`);
  }