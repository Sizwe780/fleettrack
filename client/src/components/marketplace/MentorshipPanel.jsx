import React, { useState } from "react";
import { printDocument } from "../../firebase";

export default function MentorshipPanel({ sessionData, userId }) {
  const [printedSession, setPrintedSession] = useState(null);
  const [remarks, setRemarks] = useState("");

  const handlePrintSessionSummary = async () => {
    const enrichedSession = { ...sessionData, remarks };
    const payload = await printDocument(userId, "MentorshipSession", enrichedSession);
    setPrintedSession(payload);

    const printContents = `
      <div style="font-family: serif; padding: 40px; line-height: 1.6;">
        <img src="${payload.logoUrl}" alt="FleetTrack ∞ Logo" style="height: 60px; margin-bottom: 20px;" />
        <h2 style="font-size: 22px; margin-bottom: 12px;">🎓 Mentorship Session Summary</h2>
        <p><strong>Document ID:</strong> ${payload.docId}</p>
        <p><strong>Generated:</strong> ${payload.createdAt}</p>
        <p><strong>Author UID:</strong> ${userId}</p>
        <hr style="margin: 20px 0;" />
        <p><strong>Mentor:</strong> ${sessionData.mentor}</p>
        <p><strong>Topic:</strong> ${sessionData.topic}</p>
        <p><strong>Duration:</strong> ${sessionData.duration} mins</p>
        <p><strong>Remarks:</strong> ${remarks || "—"}</p>
      </div>
    `;

    const win = window.open('', '', 'height=800,width=1000');
    win.document.write(`<html><head><title>Mentorship Summary</title></head><body>${printContents}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  return (
    <div className="p-6 bg-white rounded shadow max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-4">🎓 Mentorship Summary</h2>
      <div className="text-sm space-y-2">
        <p><strong>Mentor:</strong> {sessionData.mentor}</p>
        <p><strong>Topic:</strong> {sessionData.topic}</p>
        <p><strong>Duration:</strong> {sessionData.duration} mins</p>
        <label className="block mt-4 text-sm font-medium text-gray-700">Remarks:</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm"
          placeholder="Enter mentor or participant remarks..."
        />
      </div>

      <button
        onClick={handlePrintSessionSummary}
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Print Summary
      </button>

      {printedSession && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs">
          <p><strong>Document ID:</strong> {printedSession.docId}</p>
          <p><strong>Generated:</strong> {printedSession.createdAt}</p>
          <p><strong>Author UID:</strong> {printedSession.uid}</p>
          <p><strong>Printed:</strong> ✅</p>
        </div>
      )}
    </div>
  );
}