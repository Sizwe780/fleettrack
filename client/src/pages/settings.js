import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, 'users', user.uid, 'settings', 'preferences');
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSettings(snap.data());
      } else {
        setSettings({
          notificationsEnabled: true,
          defaultDriverFilter: '',
          defaultMinProfit: 0,
          defaultMaxFuel: 9999
        });
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveSettings = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !settings) return;

    const ref = doc(db, 'users', user.uid, 'settings', 'preferences');
    await setDoc(ref, settings, { merge: true });
    console.log('✅ Settings saved');
  };

  if (loading || !settings) return <p className="mt-10 text-center">Loading settings...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">User Settings</h2>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.notificationsEnabled}
          onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
        />
        Enable Push Notifications
      </label>

      <input
        type="text"
        placeholder="Default Driver Filter"
        value={settings.defaultDriverFilter}
        onChange={(e) => handleChange('defaultDriverFilter', e.target.value)}
        className="w-full p-2 border rounded-md"
      />

      <input
        type="number"
        placeholder="Default Min Profit (R)"
        value={settings.defaultMinProfit}
        onChange={(e) => handleChange('defaultMinProfit', Number(e.target.value))}
        className="w-full p-2 border rounded-md"
      />

      <input
        type="number"
        placeholder="Default Max Fuel (L)"
        value={settings.defaultMaxFuel}
        onChange={(e) => handleChange('defaultMaxFuel', Number(e.target.value))}
        className="w-full p-2 border rounded-md"
      />

      <button
        onClick={saveSettings}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Save Settings
      </button>
    </div>
  );
};

export default SettingsPage;