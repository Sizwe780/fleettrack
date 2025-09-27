// src/utils/escalateIncident.js

import { sendSecureCommMessage } from "../utils/sendSecureCommMessage";
import { updateCommStatus } from "../utils/sendSecureCommStatus"; // ✅ corrected path

export function escalateIncident(session, severity, description) {
  if (
    !session ||
    typeof severity !== "string" ||
    typeof description !== "string" ||
    !severity.trim() ||
    !description.trim()
  ) {
    console.warn("⚠️ Invalid escalation attempt.");
    return null;
  }

  const auditId = `ESC-${session.sessionId || "UNKNOWN"}-${Date.now()}`;
  const alertMessage = `Incident escalated: ${description} [Severity: ${severity}]`;

  const alertPayload = {
    sender: "FleetAI",
    message: alertMessage,
    timestamp: Date.now(),
    severity,
    auditId
  };

  const escalation = {
    severity,
    description,
    timestamp: alertPayload.timestamp,
    escalatedBy: "FleetAI",
    auditTrail: auditId
  };

  // Update session status
  if (typeof updateCommStatus === "function") {
    updateCommStatus(session, "escalated");
  }

  // Ensure message log exists
  if (!Array.isArray(session.messages)) {
    session.messages = [];
  }

  // Log locally
  session.messages.push(alertPayload);

  // Dispatch securely
  if (typeof sendSecureCommMessage === "function") {
    sendSecureCommMessage(session, "FleetAI", alertMessage);
  }

  return {
    escalation,
    alert: alertPayload
  };
}