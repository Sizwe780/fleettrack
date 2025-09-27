import { useState, useEffect } from 'react';
import { CenturionGrid1000 } from '@engine/CenturionGrid1000';

export default function useCenturionSimulation({ seed = 'fleettrack', daysAhead = 2 }) {
  const [grid] = useState(() => new CenturionGrid1000(1000));
  const [feed, setFeed] = useState([]);
  const [summary, setSummary] = useState({});
  const [confidence, setConfidence] = useState([]);

  useEffect(() => {
    const payload = { simulationSeed: seed };

    async function simulate() {
      await grid.runBatches(payload);
      setFeed(grid.generateFeed(daysAhead));
      setSummary(grid.getDomainSummary());
      setConfidence(grid.getConfidenceDistribution());
    }

    simulate();
  }, [seed, daysAhead]);

  return { feed, summary, confidence };
}