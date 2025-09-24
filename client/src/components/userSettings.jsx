import React, { useState } from 'react';

export default function UserSettings() {
  const [settings, setSettings] = useState({ notifications: true, darkMode: false });

  const handleToggle = key => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">⚙️ Settings</h2>
      <div className="space-y-4">
        <label className="flex items-center justify-between">
          <span>Enable Notifications</span>
          <input type="checkbox" checked={settings.notifications} onChange={() => handleToggle('notifications')} />
        </label>
        <label className="flex items-center justify-between">
          <span>Dark Mode</span>
          <input type="checkbox" checked={settings.darkMode} onChange={() => handleToggle('darkMode')} />
        </label>
      </div>
    </div>
  );
}