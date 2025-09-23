import React, { useState } from 'react';

export default function DeliveryProofForm() {
  const [form, setForm] = useState({
    packageId: '',
    recipientName: '',
    signature: '',
    photo: null
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val) data.append(key, val);
    });

    await fetch('/api/delivery', {
      method: 'POST',
      body: data
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">📦 Delivery Confirmation</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Package ID" value={form.packageId}
          onChange={e => handleChange('packageId', e.target.value)} className="w-full border px-3 py-2 rounded" />
        <input type="text" placeholder="Recipient Name" value={form.recipientName}
          onChange={e => handleChange('recipientName', e.target.value)} className="w-full border px-3 py-2 rounded" />
        <input type="text" placeholder="Signature (typed or scanned)" value={form.signature}
          onChange={e => handleChange('signature', e.target.value)} className="w-full border px-3 py-2 rounded" />
        <input type="file" accept="image/*" onChange={e => handleChange('photo', e.target.files[0])} />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Submit Proof</button>
      </form>
    </div>
  );
}