// src/components/layout/OperatorFeedbackLoop.jsx
import React, { useState } from 'react';

export default function OperatorFeedbackLoop() {
  const [feedback, setFeedback] = useState('');

  return (
    <div className="feedback-loop">
      <textarea
        placeholder="Operator feedback..."
        onChange={e => setFeedback(e.target.value)}
      />
      <button onClick={() => console.log(`Feedback submitted: ${feedback}`)}>
        Submit
      </button>
    </div>
  );
}