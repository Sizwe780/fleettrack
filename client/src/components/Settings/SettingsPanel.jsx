import React from 'react';

const SettingsPanel = () => {
  return (
    <div className="settings-panel">
      <h2>Settings</h2>
      <label>
        <input type="checkbox" /> Enable notifications
      </label>
      <label>
        <input type="checkbox" /> Compact map layout
      </label>
      <label>
        <input type="checkbox" /> Export logsheets as PDF
      </label>
    </div>
  );
};

export default SettingsPanel;