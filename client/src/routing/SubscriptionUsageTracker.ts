// src/analytics/SubscriptionUsageTracker.ts
interface DriverActivity {
    driverId: string;
    tripsCompleted: number;
    tier: 'Free' | 'Pro' | 'Sovereign' | 'SuperCore';
  }
  
  export function trackUsage(activities: DriverActivity[]): Record<string, number> {
    const usage: Record<string, number> = {};
    activities.forEach(({ driverId, tripsCompleted }) => {
      usage[driverId] = tripsCompleted;
    });
    return usage;
  }