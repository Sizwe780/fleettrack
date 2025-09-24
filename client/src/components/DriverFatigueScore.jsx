export default function DriverFatigueScore({ driver }) {
    const fatigueScore = Math.round(
      (driver.totalTrips * 0.5) + (driver.breakViolations * 2)
    );
  
    return (
      <div className="mt-2 text-sm text-yellow-700">
        💤 <strong>Fatigue Score:</strong> {fatigueScore}  
        {fatigueScore > 50 ? ' ⚠️ High Risk' : ' ✅ Stable'}
      </div>
    );
  }