export const generateMissionReceipt = ({ mission, cost, signature }) => {
    const receipt = {
      missionId: mission.id,
      commander: mission.commander,
      vehicle: mission.vehicle,
      launchTime: mission.launchTime,
      cost: `R${cost}`,
      signature,
    };
    console.log('📤 Mission Receipt:', receipt);
    alert('Receipt generated for employer (simulated)');
  };