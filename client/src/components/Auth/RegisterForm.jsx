import React, { useState } from 'react';

const RegisterForm = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'free' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    alert('Registered successfully');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <select onChange={e => setForm({ ...form, role: e.target.value })}>
        <option value="free">Free</option>
        <option value="premium">FleetTrack Pro</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;