import React, { useState } from 'react';

export default function Register({ onRegister }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'operator' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-10 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">📝 Register</h2>
      <form className="space-y-4">
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="input" />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="input" />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="input" />
        <select name="role" value={form.role} onChange={handleChange} className="input">
          <option value="operator">Operator</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" onClick={() => onRegister(form)} className="btn">Create Account</button>
      </form>
    </div>
  );
}