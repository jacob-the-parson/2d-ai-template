// Increase the HTML5 audio pool size to handle multiple sounds if needed
Howler.html5PoolSize = 20; // Adjust this value if you have multiple sounds playing

// Define the audio object but don't initialize it yet
let audio = {};

function initializeAudio() {
  if (audio.Map) return; // If already initialized, do nothing

  // Initialize the map audio
  audio.Map = new Howl({
    src: ['./audio/map.wav'],
    html5: true, // Ensures that HTML5 Audio is used
    volume: 0.1,
  });

  console.log("Audio initialized.");
}

function startMapAudio() {
  if (!audio.Map) {
    console.log("Audio not initialized. Initializing now...");
    initializeAudio(); // Initialize audio if not already done
  }
  if (audio.Map.playing()) return; // Prevent multiple starts
  audio.Map.play();
  console.log('Map audio started.');
}

// Unlock Howler's AudioContext after user interaction
function unlockAudioContext() {
  if (Howler.ctx && Howler.ctx.state === 'suspended') {
    Howler.ctx.resume().then(() => {
      console.log('AudioContext resumed.');
      startMapAudio(); // Start map audio after unlocking AudioContext
    });
  } else {
    startMapAudio(); // Start map audio if already unlocked
  }
}

// Add event listeners to initialize audio on user interaction
window.addEventListener('click', unlockAudioContext);
window.addEventListener('keydown', unlockAudioContext);
