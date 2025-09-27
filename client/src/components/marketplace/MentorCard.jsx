import React from 'react';
//import './MentorCard.css'; // Optional: for cockpit-grade styling

const MentorCard = ({ mentor }) => {
  const { name, specialty, badges, availability, avatar } = mentor;

  return (
    <div className="mentor-card" role="button" aria-label={`Request mentorship from ${name}`}>
      <img src={avatar} alt={`${name}'s avatar`} className="mentor-avatar" />
      <div className="mentor-info">
        <h3>{name}</h3>
        <p><strong>Specialty:</strong> {specialty}</p>
        <p><strong>Availability:</strong> {availability}</p>
        <div className="mentor-badges">
          {badges.map((badge, index) => (
            <span key={index} className="badge">{badge}</span>
          ))}
        </div>
        <button className="request-btn">Request Mentorship</button>
      </div>
    </div>
  );
};

export default MentorCard;