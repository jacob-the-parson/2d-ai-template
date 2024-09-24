function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  );
}

function checkForCharacterCollision({
  characters,
  player,
  characterOffset = { x: 0, y: 0 }
}) {
  player.interactionAsset = null;
  let xCollision = false;
  let yCollision = false;
  const detectionRadius = 100; // Set detection range (adjust as needed)
  
  // Monitor for character detection based on the new radius
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];

    // Check if the player is within the detection radius
    const xDistance = Math.abs(player.position.x - character.position.x + characterOffset.x);
    const yDistance = Math.abs(player.position.y - character.position.y + characterOffset.y);

    // If both x and y distances are within the detection radius, register a collision
    if (xDistance < detectionRadius && yDistance < detectionRadius) {
      xCollision = true;
      yCollision = true;
      player.interactionAsset = character; // Store the character being interacted with
      
      // Throttle logging to once every 2 seconds
      const currentTime = Date.now();
      if (!checkForCharacterCollision.lastLogTime || currentTime - checkForCharacterCollision.lastLogTime > 10000) {
        console.log('Interacting with:', player.interactionAsset);
        checkForCharacterCollision.lastLogTime = currentTime;
      }

      break;
    }
  }

  return { xCollision, yCollision };
}

// Initialize the last log time for the throttling mechanism
checkForCharacterCollision.lastLogTime = 0;
