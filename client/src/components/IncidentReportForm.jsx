import React, { useState } from 'react';

export default function IncidentReportForm() {
  const [report, setReport] = useState({
    location: '',
    severity: 'low',
    description: '',
    photo: null
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setReport(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = e => {
    handleChange('photo', e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('location', report.location);
    formData.append('severity', report.severity);
    formData.append('description', report.description);
    if (report.photo) formData.append('photo', report.photo);

    try {
      const res = await fetch('/api/incident', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setSubmitted(true);
        setReport({ location: '', severity: 'low', description: '', photo: null });
      } else {
        console.error('Incident submission failed');
      }
    } catch (err) {
      console.error('Error submitting incident:', err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">📍 Incident Report</h2>

      {submitted && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          Incident submitted successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Location (e.g. GPS or landmark)"
          value={report.location}
          onChange={e => handleChange('location', e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <select
          value={report.severity}
          onChange={e => handleChange('severity', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
        </select>

        <textarea
          placeholder="Describe the incident..."
          value={report.description}
          onChange={e => handleChange('description', e.target.value)}
          className="w-full border px-3 py-2 rounded"
          rows={4}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
        />

        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
}