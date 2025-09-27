// src/routing/DynamicRouteRewriter.js
export function rewriteRoute(currentRoute, liveData) {
    if (liveData.incident || liveData.congestionLevel > 80) {
      return liveData.alternateRoute;
    }
    return currentRoute;
  }