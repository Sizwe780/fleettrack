import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DriverWizard = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    licenseNumber: '',
    vehicleId: '',
    role: 'driver'
  });

  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('');

    try {
      const cleanData = {
        ...form,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'users'), cleanData);
      setStatus('Driver onboarded successfully.');
      setForm({
        name: '',
        email: '',
        licenseNumber: '',
        vehicleId: '',
        role: 'driver'
      });
    } catch (err) {
      console.error('Driver onboarding error:', err);
      setStatus('Error onboarding driver.');
    } finally {
      setIsLoading(false);
    }
  };

  const Input = ({ label, name, value, type = 'text' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        value={value}
        type={type}
        onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
        required
        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow-md border">
      <h2 className="text-xl font-bold mb-4">Driver Onboarding Wizard</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" name="name" value={form.name} />
        <Input label="Email Address" name="email" value={form.email} type="email" />
        <Input label="License Number" name="licenseNumber" value={form.licenseNumber} />
        <Input label="Assigned Vehicle ID" name="vehicleId" value={form.vehicleId} />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          {isLoading ? 'Onboarding...' : 'Add Driver'}
        </button>
      </form>
      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
    </div>
  );
};

export default DriverWizard;