import React from 'react';

const MentorOverlay = ({ module, mentors, onRequest }) => {
  const relevantMentors = mentors.filter(m =>
    module.badgesRequired.some(badge => m.specialties.includes(badge))
  );

  return (
    <div className="mentor-overlay">
      <h4>Suggested Mentors</h4>
      {relevantMentors.map((mentor) => (
        <div key={mentor.id} className="mentor-suggestion">
          <p>{mentor.name} – {mentor.specialties.join(', ')}</p>
          <button onClick={() => onRequest(mentor.id)}>
            Request Mentorship
          </button>
        </div>
      ))}
    </div>
  );
};

export default MentorOverlay;