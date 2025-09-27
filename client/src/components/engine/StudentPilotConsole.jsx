import React from "react";
import { getStudentPilotFeatures } from "./StudentPilotFeatures"; // ✅ Correct named import

export default function StudentPilotConsole() {
  const training = getStudentPilotFeatures();

  return (
    <section className="bg-blue-50 p-6 rounded-xl shadow-md border border-blue-300">
      <h3 className="text-lg font-bold text-blue-700 mb-2">🧑‍✈️ Student Pilot Training</h3>
      <p className="text-sm text-gray-700 mb-2">
        Training Status: <strong>{training.status}</strong>
      </p>
      <pre className="text-xs bg-gray-100 p-3 rounded whitespace-pre-wrap break-words">
        {JSON.stringify(training.payload, null, 2)}
      </pre>
      <p className="text-xs text-gray-600 mt-2">
        Use this console to simulate pilot decisions and evaluate response accuracy.
      </p>
    </section>
  );
}