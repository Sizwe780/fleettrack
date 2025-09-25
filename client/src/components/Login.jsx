import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-10 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">🔐 Login</h2>
      <form className="space-y-4">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="input" />
        <button type="submit" onClick={() => onLogin(email, password)} className="btn">Login</button>
      </form>
    </div>
  );
}