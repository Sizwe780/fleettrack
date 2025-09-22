import React, { useState } from 'react';

const DriverChat = () => {
  const [messages, setMessages] = useState([
    { sender: 'dispatch', text: 'New trip assigned: PE → Durban' },
    { sender: 'driver', text: 'Received. Departing now.' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'driver', text: input }]);
    setInput('');
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">💬 Dispatch Chat</h2>
      <div className="bg-white p-4 rounded shadow h-96 overflow-y-auto space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`text-sm ${msg.sender === 'driver' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded ${msg.sender === 'driver' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-md"
        />
        <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Send
        </button>
      </div>
    </div>
  );
};

export default DriverChat;