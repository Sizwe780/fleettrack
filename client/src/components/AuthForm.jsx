import React, { useState } from 'react';

export default function AuthForm({ mode = 'login' }) {
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const endpoint = mode === 'signup' ? '/api/signup' : '/api/login';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    console.log(data); // Replace with redirect or token handling
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">{mode === 'signup' ? 'Create Account' : 'Login'}</h2>
      {mode === 'signup' && (
        <input type="text" placeholder="Name" value={form.name}
          onChange={e => handleChange('name', e.target.value)} className="w-full border px-3 py-2 rounded" />
      )}
      <input type="email" placeholder="Email" value={form.email}
        onChange={e => handleChange('email', e.target.value)} className="w-full border px-3 py-2 rounded" />
      <input type="password" placeholder="Password" value={form.password}
        onChange={e => handleChange('password', e.target.value)} className="w-full border px-3 py-2 rounded" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {mode === 'signup' ? 'Sign Up' : 'Login'}
      </button>
    </form>
  );
}