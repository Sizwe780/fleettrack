import React, { useState } from 'react';

const FleetCopilotChat = () => {
  const [messages, setMessages] = useState([
    { sender: 'copilot', text: 'Hi! I’m your FleetTrack assistant. Ask me anything about your trips, drivers, or fleet health.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    const botResponse = generateResponse(input);

    setMessages(prev => [...prev, userMessage, botResponse]);
    setInput('');
  };

  const generateResponse = (query) => {
    // Simulated AI logic (replace with real backend later)
    if (query.toLowerCase().includes('best time to depart')) {
      return { sender: 'copilot', text: 'Based on traffic trends, the best time to depart is 06:45 AM for minimal delays.' };
    }
    if (query.toLowerCase().includes('driver performance')) {
      return { sender: 'copilot', text: 'Driver Sizwe Ngwenya has a 92% efficiency score and zero flagged trips this month.' };
    }
    return { sender: 'copilot', text: 'I’m still learning—try asking about trip stats, driver health, or route suggestions.' };
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md border max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">FleetTrack Co-Pilot</h2>
      <div className="h-64 overflow-y-auto border rounded-md p-2 mb-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.sender === 'copilot' ? 'text-blue-700' : 'text-gray-800 font-medium'}`}>
            <span className="block">{msg.sender === 'copilot' ? '🧠 Co-Pilot:' : '🧍 You:'}</span>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about trips, drivers, routes..."
          className="flex-1 border rounded-md px-3 py-2"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default FleetCopilotChat;