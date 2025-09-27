function estimateFatigue(driver) {
    const { shiftHours, breaksTaken, biometric } = driver;
    const heartRateAvg = biometric.reduce((sum, b) => sum + b.heartRate, 0) / biometric.length;
    const fatigueScore = Math.round((shiftHours * 1.5 - breaksTaken * 2 + heartRateAvg / 10));
    return {
      fatigueLevel: fatigueScore,
      status: fatigueScore > 70 ? "Fatigued" : fatigueScore > 40 ? "Moderate" : "Fresh",
    };
  }