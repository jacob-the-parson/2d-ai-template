// Initialize canvas
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

// Set up collision boundaries
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, 70 + i));
}

const charactersMap = [];
for (let i = 0; i < charactersMapData.length; i += 70) {
  charactersMap.push(charactersMapData.slice(i, 70 + i));
}

const boundaries = [];
const offset = {
  x: -735,
  y: -650
};

// Create boundary objects
collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      );
  });
});

// Set up the old man character
const characters = [];
const oldManImg = new Image();
oldManImg.src = './img/oldMan/Idle.png';

charactersMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    // Check for the old man character with symbol 1031
    if (symbol === 1031) {
      const oldMan = new Character({
        position: {
          x: j * Boundary.width + offset.x,
          y: i * Boundary.height + offset.y
        },
        image: oldManImg,
        frames: {
          max: 4,
          hold: 60
        },
        scale: 3,
        dialogue: [] // Start with an empty dialogue array
      });
      
      characters.push(oldMan);

      // Add this boundary to make the old man collidable
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      );
    }
  });
});


// Load images for player and background
const image = new Image();
image.src = './img/Pellet Town.png';

const foregroundImage = new Image();
foregroundImage.src = './img/foregroundObjects.png';

const playerDownImage = new Image();
playerDownImage.src = './img/playerDown.png';

const playerUpImage = new Image();
playerUpImage.src = './img/playerUp.png';

const playerLeftImage = new Image();
playerLeftImage.src = './img/playerLeft.png';

const playerRightImage = new Image();
playerRightImage.src = './img/playerRight.png';

// Create the player sprite
const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2
  },

  image: playerDownImage,
  frames: {
    max: 4,
    hold: 10
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage
  }
});

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: image
});

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: foregroundImage
});

// Define key states
const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false }
};

// Define movable objects
const movables = [background, ...boundaries, foreground, ...characters];
const renderables = [background, ...boundaries, ...characters, player, foreground];

function animate() {
  const animationId = window.requestAnimationFrame(animate);
  renderables.forEach((renderable) => {
    renderable.draw();
  });

  let moving = true;
  player.animate = false;

  let moveX = 0;
  let moveY = 0;

  // Determine movement direction
  if (keys.w.pressed) moveY = 3;
  if (keys.s.pressed) moveY = -3;
  if (keys.a.pressed) moveX = 3;
  if (keys.d.pressed) moveX = -3;

  // Normalize diagonal movement
  if (moveX !== 0 && moveY !== 0) {
    moveX *= 0.7071; // Approximately 1 / sqrt(2)
    moveY *= 0.7071;
  }

  // Set player animation and image
  if (moveX !== 0 || moveY !== 0) {
    player.animate = true;
    if (Math.abs(moveX) > Math.abs(moveY)) {
      player.image = moveX > 0 ? player.sprites.left : player.sprites.right;
    } else {
      player.image = moveY > 0 ? player.sprites.up : player.sprites.down;
    }
  }

  // Check for collisions
  let collided = false;
  for (let i = 0; i < boundaries.length; i++) {
    const boundary = boundaries[i];
    if (
      rectangularCollision({
        rectangle1: player,
        rectangle2: {
          ...boundary,
          position: {
            x: boundary.position.x + moveX,
            y: boundary.position.y + moveY
          }
        }
      })
    ) {
      collided = true;
      break;
    }
  }

  // Check for character collisions
  const characterCollision = checkForCharacterCollision({
    characters,
    player,
    characterOffset: { x: moveX, y: moveY }
  });

  // Move map if not collided
  if (!collided && !characterCollision.collision) {
    movables.forEach((movable) => {
      movable.position.x += moveX;
      movable.position.y += moveY;
    });
  }
}

animate();

// Function to fetch NPC response from OpenAI API
async function fetchNPCResponse(prompt) {
  try {
    // Indicate that the old man is thinking
    document.querySelector('#characterDialogueBox').innerHTML = "The old man is thinking...";
    
    const response = await fetch('http://localhost:3000/api/openai/getResponse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch response from OpenAI API');
    }

    const data = await response.json();
    return data.response; // Extract the actual response content
  } catch (error) {
    console.error('Error fetching NPC response:', error);
    return "The old man seems unable to respond right now.";
  }
}

// Interaction logic
window.addEventListener('keydown', (e) => {
  if (player.isInteracting) {
    switch (e.key) {
      case ' ':
        player.interactionAsset.dialogueIndex++;
        const { dialogueIndex, dialogue } = player.interactionAsset;
        if (dialogueIndex <= dialogue.length - 1) {
          document.querySelector('#characterDialogueBox').innerHTML = dialogue[dialogueIndex];
          return;
        }

        // Finish conversation
        player.isInteracting = false;
        player.interactionAsset.dialogueIndex = 0;
        document.querySelector('#characterDialogueBox').style.display = 'none';
        break;
    }
    return;
  }

  switch (e.key) {
    case ' ':
      if (!player.interactionAsset) {
        console.log('No interaction asset found.');
        return;
      }

      console.log('Starting interaction with:', player.interactionAsset);
      console.log('Player image:', player.interactionAsset.image);
      console.log('Old man image:', oldManImg);

      // Check if interacting with the old man by comparing image sources
if (player.interactionAsset.image.src === oldManImg.src) {
        console.log('Interacting with the old man');
        if (player.interactionAsset.dialogue.length === 0) {
          fetchNPCResponse("What wisdom do you have to share?")
            .then((npcResponse) => {
              player.interactionAsset.dialogue = [npcResponse];
              player.interactionAsset.dialogueIndex = 0;
              document.querySelector('#characterDialogueBox').innerHTML = npcResponse;
              console.log('Displaying NPC response:', npcResponse);
              document.querySelector('#characterDialogueBox').style.display = 'flex';
              player.isInteracting = true;
            })
            .catch((error) => {
              console.error('Error fetching NPC response:', error);
              player.interactionAsset.dialogue = ["I'm having trouble thinking right now..."];
              player.interactionAsset.dialogueIndex = 0;
              document.querySelector('#characterDialogueBox').innerHTML = "I'm having trouble thinking right now...";
              document.querySelector('#characterDialogueBox').style.display = 'flex';
              player.isInteracting = true;
            });
        } else {
          const firstMessage = player.interactionAsset.dialogue[0];
          document.querySelector('#characterDialogueBox').innerHTML = firstMessage;
          document.querySelector('#characterDialogueBox').style.display = 'flex';
          player.isInteracting = true;
        }
      } else {
        console.log('Player is interacting with a different character or object.');
      }
      break;
      
    case 'w':
    case 'a':
    case 's':
    case 'd':
      keys[e.key].pressed = true;
      break;
  }
});


// Add keyup event listener to reset key states
window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
    case 'a':
    case 's':
    case 'd':
      keys[e.key].pressed = false;
      break;
  }
});
