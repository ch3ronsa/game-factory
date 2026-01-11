# Game Factory SDK - Simplified API Guide

## 🚀 Quick Start

The SDK is automatically available in your game as `window.SDK`. No imports needed!

```javascript
function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // 1. Register remix variables
    SDK.registerRemix({
        playerSpeed: 5,
        gravity: 0.5,
        backgroundColor: '#000000'
    });
    
    // 2. Listen for updates
    SDK.onRemixUpdate((vars) => {
        playerSpeed = vars.playerSpeed;
        gravity = vars.gravity;
        bgColor = vars.backgroundColor;
    });
    
    // 3. Game ready
    SDK.gameReady();
    SDK.gameStart();
}

function draw() {
    // Use remix variables
    const speed = SDK.getVar('playerSpeed');
    // ... game logic
}

function gameOver() {
    SDK.submitScore(score);
    SDK.gameEnd(score);
}
```

## 📚 API Reference

### SDK.registerRemix(variables)

Register which variables can be remixed/modded.

```javascript
SDK.registerRemix({
    playerSpeed: 5,        // Number
    gravity: 0.5,          // Number
    playerColor: '#ff0000', // String (color)
    enableParticles: true   // Boolean
});
```

### SDK.onRemixUpdate(callback)

Listen for real-time variable updates from the platform.

```javascript
SDK.onRemixUpdate((newVars) => {
    console.log('Variables updated:', newVars);
    
    // Update your game variables
    playerSpeed = newVars.playerSpeed;
    gravity = newVars.gravity;
});
```

### SDK.getVar(key)

Get current value of a variable.

```javascript
const speed = SDK.getVar('playerSpeed');
const gravity = SDK.getVar('gravity');
```

### SDK.getAllVars()

Get all variables as an object.

```javascript
const allVars = SDK.getAllVars();
console.log(allVars); // { playerSpeed: 5, gravity: 0.5, ... }
```

### SDK.submitScore(score)

Submit player's score.

```javascript
SDK.submitScore(1000);
```

### SDK.addScore(value)

Add to current score (convenience method).

```javascript
SDK.addScore(100);  // Adds 100 to current score
const total = SDK.addScore(50);  // Returns new total
```

### SDK.setScore(value)

Set score directly (convenience method).

```javascript
SDK.setScore(500);  // Sets score to 500
```

### SDK.getScore()

Get current score.

```javascript
const currentScore = SDK.getScore();
```

### SDK.gameReady()

Tell the platform your game is ready to play.

```javascript
function setup() {
    createCanvas(windowWidth, windowHeight);
    // ... initialization
    SDK.gameReady();
}
```

### SDK.gameStart()

Tell the platform the game has started.

```javascript
function mousePressed() {
    SDK.gameStart();
    gameActive = true;
}
```

### SDK.gameEnd(finalScore)

Tell the platform the game has ended.

```javascript
function gameOver() {
    SDK.gameEnd(finalScore);
}
```

## 🎮 Complete Example

```javascript
// Game variables
let playerSpeed = 5;
let gravity = 0.5;
let bgColor = '#000000';
let score = 0;
let gameActive = false;

let player = {
    x: 200,
    y: 200,
    vx: 0,
    vy: 0
};

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Register remix variables
    SDK.registerRemix({
        playerSpeed: 5,
        gravity: 0.5,
        backgroundColor: '#000000',
        playerSize: 30
    });
    
    // Listen for real-time updates
    SDK.onRemixUpdate((vars) => {
        playerSpeed = vars.playerSpeed;
        gravity = vars.gravity;
        bgColor = vars.backgroundColor;
        player.size = vars.playerSize;
    });
    
    // Game is ready
    SDK.gameReady();
}

function draw() {
    background(bgColor);
    
    if (!gameActive) {
        fill(255);
        textAlign(CENTER, CENTER);
        text('Click to Start', width/2, height/2);
        return;
    }
    
    // Use remix variables
    if (keyIsDown(LEFT_ARROW)) {
        player.vx = -playerSpeed;
    }
    if (keyIsDown(RIGHT_ARROW)) {
        player.vx = playerSpeed;
    }
    
    // Apply gravity
    player.vy += gravity;
    
    // Update position
    player.x += player.vx;
    player.y += player.vy;
    
    // Draw player
    fill(255);
    const size = SDK.getVar('playerSize');
    rect(player.x, player.y, size, size);
    
    // Update score
    score++;
    SDK.submitScore(score);
    
    // Display score
    fill(255);
    textAlign(LEFT, TOP);
    text('Score: ' + score, 20, 20);
}

function mousePressed() {
    if (!gameActive) {
        gameActive = true;
        SDK.gameStart();
    }
}

function keyPressed() {
    if (key === 'q') {
        gameActive = false;
        SDK.gameEnd(score);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
```

## 🔄 Platform Integration

### Sending Updates to Game (Parent Window)

```javascript
// Get the game iframe
const gameIframe = document.getElementById('game-iframe');

// Update a single variable
gameIframe.contentWindow.postMessage({
    type: 'UPDATE_REMIX',
    payload: {
        playerSpeed: 8
    }
}, '*');

// Update multiple variables
gameIframe.contentWindow.postMessage({
    type: 'UPDATE_REMIX',
    payload: {
        playerSpeed: 8,
        gravity: 1.2,
        backgroundColor: '#ff0000'
    }
}, '*');

// Request current state
gameIframe.contentWindow.postMessage({
    type: 'REQUEST_STATE'
}, '*');

// Reset game
gameIframe.contentWindow.postMessage({
    type: 'RESET_GAME'
}, '*');
```

### Receiving Messages from Game (Parent Window)

```javascript
window.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    
    switch(type) {
        case 'REGISTER_SCHEMA':
            console.log('Game variables:', payload);
            // Show UI controls for these variables
            break;
            
        case 'SUBMIT_SCORE':
            console.log('Score:', payload.score);
            break;
            
        case 'GAME_READY':
            console.log('Game is ready');
            break;
            
        case 'GAME_START':
            console.log('Game started');
            break;
            
        case 'GAME_END':
            console.log('Game ended with score:', payload.score);
            break;
            
        case 'STATE_RESPONSE':
            console.log('Current state:', payload);
            break;
    }
});
```

## 🎯 Best Practices

1. **Register variables early** - Call `registerRemix()` in `setup()`
2. **Use onRemixUpdate** - Don't poll, subscribe to changes
3. **Keep it simple** - Only register variables that make sense to remix
4. **Provide good defaults** - Make sure the game works well with default values
5. **Test with updates** - Test your game with different variable values

## 🔍 Debugging

Enable console logs to see SDK activity:

```javascript
// All SDK methods log to console
// Look for [SDK] prefix in console

SDK.registerRemix({ speed: 5 });
// Console: [SDK] Remix registered: { speed: 5 }

SDK.submitScore(100);
// Console: [SDK] Score: 100
```

## 📡 Message Types

### From Game to Platform

- `REGISTER_SCHEMA` - Game registered remix variables
- `SUBMIT_SCORE` - Score update
- `GAME_READY` - Game initialized
- `GAME_START` - Game started
- `GAME_END` - Game ended
- `STATE_RESPONSE` - Current state (response to REQUEST_STATE)

### From Platform to Game

- `UPDATE_REMIX` - Update variable values
- `REQUEST_STATE` - Request current state
- `RESET_GAME` - Reset the game

## 🚫 Migration from Old SDK

If you have old code using the complex API:

```javascript
// OLD (Complex)
await SDK.init();
SDK.schema.defineSchema([...]);
SDK.lifecycle.start();
SDK.score.send({ value: 100 });

// NEW (Simple)
SDK.registerRemix({ speed: 5 });
SDK.gameStart();
SDK.submitScore(100);
```

The new API is much simpler and easier to use!
