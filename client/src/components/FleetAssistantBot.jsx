import React, { useState } from 'react';

export default function FleetAssistantBot() {
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi! I’m your Fleet Assistant. How can I help?' }]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    setMessages([...messages, { role: 'user', text: input }, { role: 'bot', text: `You asked: "${input}". Here's what I found…` }]);
    setInput('');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-10 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🤖 Fleet Assistant Bot</h2>
      <div className="space-y-2 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'bot' ? 'text-blue-600' : 'text-gray-800'}>{m.text}</div>
        ))}
      </div>
      <div className="mt-4 flex space-x-2">
        <input value={input} onChange={e => setInput(e.target.value)} className="input flex-1" placeholder="Ask a question…" />
        <button onClick={handleSend} className="btn">Send</button>
      </div>
    </div>
  );
}