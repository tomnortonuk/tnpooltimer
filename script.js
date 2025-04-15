// First, wrap all our DOM-dependent code in a DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
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

    // DOM Elements - move all these inside DOMContentLoaded
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const startGameBtn = document.getElementById('start-game');
    const nextShotBtn = document.getElementById('next-shot');
    const resetGameBtn = document.getElementById('reset-game');
    const timerDisplay = document.getElementById('timer-display');
    const playerNameDisplay = document.getElementById('player-name');
    const splashScreen = document.getElementById('splash-screen');

    // Handle splash screen
    setTimeout(function() {
        console.log('Removing splash screen');
        splashScreen.style.display = 'none';
        setupScreen.classList.add('active');
    }, 3000);

    // Audio Context
    let audioContext = null;

    // Initialize audio on first user interaction
    function initAudio() {
        if (audioContext) return;
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context initialized');
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
        }
    }

    // Play pip sound
    function playPip() {
        try {
            // Try Web Audio API first
            if (audioContext) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.1);
            }
            
            // Fallback to HTML5 Audio
            const pipSound = document.getElementById('pip');
            if (pipSound) {
                pipSound.currentTime = 0;
                pipSound.play().catch(e => console.error('Pip playback failed:', e));
            }
        } catch (error) {
            console.error('Error playing pip:', error);
        }
    }

    // Play alarm sound
    function playAlarm() {
        try {
            const soundId = gameState.currentPlayer === 1 ? gameState.player1Sound : gameState.player2Sound;
            const audio = document.getElementById(soundId);
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => console.error('Alarm playback failed:', e));
                
                // Stop the audio after 7 seconds
                setTimeout(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }, 7000);
            }
        } catch (error) {
            console.error('Error playing alarm:', error);
        }
    }

    // Update the timer function
    function startTimer() {
        gameState.timeLeft = gameState.shotTime;
        updateTimerDisplay();
        
        gameState.timer = setInterval(() => {
            gameState.timeLeft--;
            updateTimerDisplay();
            
            // Play pip sound for last 5 seconds
            if (gameState.timeLeft > 0 && gameState.timeLeft <= 5) {
                playPip();
            }
            
            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timer);
                playAlarm();
            }
        }, 1000);
    }

    // Update test sound function
    function playTestSound(playerNumber) {
        try {
            initAudio(); // Initialize audio context
            const soundSelect = document.getElementById(`player${playerNumber}-sound`);
            const soundId = soundSelect.value;
            const audio = document.getElementById(soundId);
            
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => console.error('Test sound playback failed:', e));
                
                setTimeout(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }, 2000);
            }
        } catch (error) {
            console.error('Error playing test sound:', error);
        }
    }

    // Initialize audio on various user interactions
    document.querySelectorAll('.test-sound').forEach(button => {
        button.addEventListener('click', () => {
            initAudio();
            const playerNumber = button.getAttribute('data-player');
            playTestSound(playerNumber);
        });
    });

    startGameBtn.addEventListener('click', () => {
        initAudio();
        saveSettings();
        setupScreen.classList.remove('active');
        gameScreen.classList.add('active');
        gameState.currentPlayer = 1;
        playerNameDisplay.textContent = gameState.player1;
        startTimer();
    });

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

    // Update timer display
    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(gameState.timeLeft);
    }

    // Switch to next player
    function nextPlayer() {
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        playerNameDisplay.textContent = gameState.currentPlayer === 1 ? gameState.player1 : gameState.player2;
        startTimer();
    }

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

    // Initialize
    loadSettings();
}); 