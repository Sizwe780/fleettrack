import React from 'react';

const ChallengePanel = ({ challenges }) => (
  <div className="challenge-panel">
    <h4>🎯 Tactical Challenges</h4>
    <ul>
      {challenges.map((c, i) => (
        <li key={i}>
          <strong>{c.title}</strong>: {c.description}
          <button onClick={() => c.onComplete()}>Complete</button>
        </li>
      ))}
    </ul>
  </div>
);

export default ChallengePanel;