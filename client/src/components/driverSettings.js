import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DriverSettings = () => {
  const [settings, setSettings] = useState({ notifications: true, fuelUnit: 'L' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      setSettings({
        notifications: data.notifications ?? true,
        fuelUnit: data.fuelUnit ?? 'L'
      });
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const updateSetting = async (key, value) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await setDoc(doc(db, 'users', user.uid), newSettings, { merge: true });
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <h2 className="text-2xl font-bold">⚙️ Driver Settings</h2>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 rounded-full border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white p-4 rounded shadow space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Enable Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => updateSetting('notifications', e.target.checked)}
                className="w-5 h-5"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Fuel Unit</span>
              <select
                value={settings.fuelUnit}
                onChange={(e) => updateSetting('fuelUnit', e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="L">Liters (L)</option>
                <option value="gal">Gallons (gal)</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DriverSettings;