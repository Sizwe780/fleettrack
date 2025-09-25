export const submitMissionFeedback = async ({ missionId, rating, notes }) => {
    console.log(`🧠 Feedback for ${missionId}: ${rating} stars — ${notes}`);
    alert('Feedback submitted (simulated)');
  };