export function escalateIfNoResponse(alertId, location) {
    setTimeout(() => {
      console.log(`Escalating alert ${alertId} to units within 5km of`, location);
      // Future: sync with satellite, traffic control, medical grid
    }, 60000);
  }