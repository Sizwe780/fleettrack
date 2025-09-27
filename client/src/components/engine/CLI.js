import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function startGame() {
  console.log("🚨 Incoming Message from Driver D-009:");
  console.log('"There\'s a protest blocking the main gate. I\'m stuck."');
  console.log("\nOptions:");
  console.log("1. Escalate to ProtectionUnit");
  console.log("2. Reroute via South Gate");
  console.log("3. Send AI reassurance message");

  rl.question("Type your command: ", (answer) => {
    switch (answer.trim()) {
      case "1":
        console.log("🔺 Incident escalated. ProtectionUnit dispatched.");
        break;
      case "2":
        console.log("🛣️ Rerouting driver via South Gate.");
        break;
      case "3":
        console.log("🤖 FleetAI: 'Stay calm. Alternate route being calculated.'");
        break;
      default:
        console.log("❌ Invalid command. Try again.");
    }
    rl.close();
  });
}

startGame();