import { describe, it, expect } from 'vitest';
import { CenturionGrid100 } from '@/cockpit/engine/CenturionGrid100';

describe('CenturionGrid100 Simulation', () => {
  it('should run all cores and return 100 results', async () => {
    const grid = new CenturionGrid100(100);
    const payload = { simulationSeed: 'fleettrack-test' };
    const results = await grid.runAll(payload);

    expect(results).toHaveLength(100);
    results.forEach(result => {
      expect(result).toHaveProperty('coreId');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('topAction');
      expect(result).toHaveProperty('confidenceScore');
      expect(result.outcome).toBeInstanceOf(Array);
    });
  });

  it('should produce deterministic seeds per core', async () => {
    const grid = new CenturionGrid100(3);
    const payload = { simulationSeed: 'fleettrack-test' };
    const results = await grid.runAll(payload);

    const seeds = results.map(r => r.seed);
    const unique = new Set(seeds);
    expect(unique.size).toBe(3);
  });
});