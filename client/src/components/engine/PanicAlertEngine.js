// 🧠 Panic Alert Engine

/**
 * Generates a panic alert payload for escalation modules.
 * @param {Object} params - Alert parameters
 * @param {string} params.driver - Driver ID
 * @param {string} params.trip - Trip ID
 * @param {string} params.location - Location of incident
 * @returns {Object} Panic alert object
 */
function triggerPanicAlert({ driver = "Unknown", trip = "Unknown", location = "Unknown" }) {
    return {
      alertId: `ALERT-${Date.now()}`,
      recipients: ["SecurityOps", "FleetCommand", "DriverSupport"],
      escalationWindow: "90 seconds",
      alertPayload: {
        driver,
        trip,
        location,
        timestamp: new Date().toISOString(),
        priority: "HIGH",
        type: "PANIC"
      }
    };
  }
  
  // ✅ Export cleanly
  export { triggerPanicAlert };