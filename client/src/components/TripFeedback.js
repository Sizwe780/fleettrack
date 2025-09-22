import React, { useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const TripFeedback = ({ tripId }) => {
  const [message, setMessage] = useState('');

  const submitFeedback = async () => {
    await addDoc(collection(db, `feedback/${tripId}/messages`), {
      message,
      createdAt: serverTimestamp(),
    });
    setMessage('');
  };

  return (
    <div className="mt-6 bg-red-100 p-4 rounded-md">
      <h3 className="text-lg font-bold">📝 Report Issue</h3>
      <textarea
        className="w-full p-2 rounded-md"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={submitFeedback} className="mt-2 btn">Submit</button>
    </div>
  );
};

export default TripFeedback;