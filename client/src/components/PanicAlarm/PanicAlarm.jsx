import React from "react";
import { auth } from "../../firebase";

export default function PanicAlarm() {
  const uid = auth.currentUser?.uid;

  const handlePanic = async () => {
    const location = await getLocation();
    await fetch("/api/panic-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, location })
    });
    alert("Emergency alert sent to nearby fleet and operators.");
  };

  const getLocation = () =>
    new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(pos => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    });

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handlePanic}
        className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-full shadow-lg text-lg"
      >
        🚨 Panic
      </button>
    </div>
  );
}