import { Route } from 'lucide-react';

export default function RouteSuggestion({ origin, destination, route, avgDuration }) {
  return (
    <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 flex items-center gap-2">
      <Route className="w-4 h-4" />
      Suggested Route: <strong>{origin} → {destination}</strong> via <span className="underline">{route}</span> · Avg Duration: {avgDuration} hrs
    </div>
  );
}