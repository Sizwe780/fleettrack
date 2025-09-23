import React, { useState } from 'react';

export default function TripSubmissionForm() {
  const [form, setForm] = useState({
    driverId: '',
    startLocation: '',
    endLocation: '',
    cargoType: '',
    notes: '',
    timestamp: new Date().toISOString()
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault(); // 💡 This prevents the page from reloading.
    const res = await fetch('/api/trips/submit', { // 💡 Change to the new route
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      <h3 className="text-lg font-bold"> 📍  Submit Trip</h3>
      <input type="text" placeholder="Driver ID" value={form.driverId}
        onChange={e => handleChange('driverId', e.target.value)} className="w-full border px-3 py-2 rounded" />
      <input type="text" placeholder="Start Location" value={form.startLocation}
        onChange={e => handleChange('startLocation', e.target.value)} className="w-full border px-3 py-2 rounded" />
      <input type="text" placeholder="End Location" value={form.endLocation}
        onChange={e => handleChange('endLocation', e.target.value)} className="w-full border px-3 py-2 rounded" />
      <input type="text" placeholder="Cargo Type" value={form.cargoType}
        onChange={e => handleChange('cargoType', e.target.value)} className="w-full border px-3 py-2 rounded" />
      <textarea placeholder="Notes" value={form.notes}
        onChange={e => handleChange('notes', e.target.value)} className="w-full border px-3 py-2 rounded" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Trip</button>
    </form>
  );
}