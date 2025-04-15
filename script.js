// Game state
let gameState = {
    player1: 'Player 1',
    player2: 'Player 2',
    player1Sound: 'sound1',
    player2Sound: 'sound2',
    shotTime: 45,
    currentPlayer: 1,
    timer: null,
    timeLeft: 0
};

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const startGameBtn = document.getElementById('start-game');
const nextShotBtn = document.getElementById('next-shot');
const resetGameBtn = document.getElementById('reset-game');
const timerDisplay = document.getElementById('timer-display');
const playerNameDisplay = document.getElementById('player-name');

// Load saved settings
function loadSettings() {
    const savedSettings = localStorage.getItem('poolTimerSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        gameState = { ...gameState, ...settings };
        
        // Update form values
        document.getElementById('player1').value = gameState.player1;
        document.getElementById('player2').value = gameState.player2;
        document.getElementById('player1-sound').value = gameState.player1Sound;
        document.getElementById('player2-sound').value = gameState.player2Sound;
        document.getElementById('shot-time').value = gameState.shotTime;
    }
}

// Save settings
function saveSettings() {
    gameState.player1 = document.getElementById('player1').value;
    gameState.player2 = document.getElementById('player2').value;
    gameState.player1Sound = document.getElementById('player1-sound').value;
    gameState.player2Sound = document.getElementById('player2-sound').value;
    gameState.shotTime = parseInt(document.getElementById('shot-time').value);
    
    localStorage.setItem('poolTimerSettings', JSON.stringify({
        player1: gameState.player1,
        player2: gameState.player2,
        player1Sound: gameState.player1Sound,
        player2Sound: gameState.player2Sound,
        shotTime: gameState.shotTime
    }));
}

// Format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Start timer
function startTimer() {
    gameState.timeLeft = gameState.shotTime;
    updateTimerDisplay();
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            playAlarm();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(gameState.timeLeft);
}

// Play alarm sound
function playAlarm() {
    const soundId = gameState.currentPlayer === 1 ? gameState.player1Sound : gameState.player2Sound;
    const audio = document.getElementById(soundId);
    audio.currentTime = 0;
    audio.play();
    
    // Stop the audio after 5 seconds
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 5000);
}

// Play test sound
function playTestSound(playerNumber) {
    const soundSelect = document.getElementById(`player${playerNumber}-sound`);
    const soundId = soundSelect.value;
    const audio = document.getElementById(soundId);
    
    // Play for 1 second
    audio.currentTime = 0;
    audio.play();
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 1000);
}

// Switch to next player
function nextPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    playerNameDisplay.textContent = gameState.currentPlayer === 1 ? gameState.player1 : gameState.player2;
    startTimer();
}

// Start game
startGameBtn.addEventListener('click', () => {
    saveSettings();
    setupScreen.classList.remove('active');
    gameScreen.classList.add('active');
    gameState.currentPlayer = 1;
    playerNameDisplay.textContent = gameState.player1;
    startTimer();
});

// Next shot button
nextShotBtn.addEventListener('click', () => {
    clearInterval(gameState.timer);
    nextPlayer();
});

// Reset game
resetGameBtn.addEventListener('click', () => {
    clearInterval(gameState.timer);
    gameScreen.classList.remove('active');
    setupScreen.classList.add('active');
});

// Test sound buttons
document.querySelectorAll('.test-sound').forEach(button => {
    button.addEventListener('click', () => {
        const playerNumber = button.getAttribute('data-player');
        playTestSound(playerNumber);
    });
});

// Initialize
loadSettings(); 