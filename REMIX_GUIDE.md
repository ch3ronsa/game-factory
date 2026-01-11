# Remix.gg Style Modding - Usage Examples

## 🎨 Schema Definition (Moddable Parameters)

### Basic Example

```javascript
async function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Initialize SDK
    await SDK.init({ debug: true });
    
    // Define what can be modded
    SDK.schema.defineSchema([
        {
            key: 'playerSpeed',
            type: 'range',
            label: 'Player Speed',
            defaultValue: 5,
            min: 1,
            max: 10,
            step: 0.5,
            description: 'How fast the player moves'
        },
        {
            key: 'gravity',
            type: 'number',
            label: 'Gravity',
            defaultValue: 0.5,
            min: 0,
            max: 2
        },
        {
            key: 'backgroundColor',
            type: 'color',
            label: 'Background Color',
            defaultValue: '#000000'
        },
        {
            key: 'enableParticles',
            type: 'boolean',
            label: 'Enable Particles',
            defaultValue: true
        }
    ]);
}
```

### Using Schema Values in Game

```javascript
let playerSpeed;
let gravity;
let bgColor;

function setup() {
    // ... SDK init and schema definition ...
    
    // Get initial values
    playerSpeed = SDK.schema.getValue('playerSpeed');
    gravity = SDK.schema.getValue('gravity');
    bgColor = SDK.schema.getValue('backgroundColor');
    
    // Listen for real-time updates
    SDK.schema.onUpdate((key, value) => {
        console.log(`${key} changed to ${value}`);
        
        // Update game variables in real-time
        if (key === 'playerSpeed') playerSpeed = value;
        if (key === 'gravity') gravity = value;
        if (key === 'backgroundColor') bgColor = value;
    });
}

function draw() {
    // Use the moddable values
    background(bgColor);
    
    // Player movement with moddable speed
    if (keyIsDown(LEFT_ARROW)) {
        playerX -= playerSpeed;
    }
    if (keyIsDown(RIGHT_ARROW)) {
        playerX += playerSpeed;
    }
    
    // Apply moddable gravity
    playerVelocityY += gravity;
}
```

## 🖼️ Asset Mapping (Sprite Replacement)

### Basic Asset Mapping

```javascript
async function setup() {
    createCanvas(windowWidth, windowHeight);
    await SDK.init();
    
    // Map original assets to remix URLs
    SDK.assets.mapAssets([
        {
            originalUrl: '/sprites/player.png',
            remixUrl: 'https://example.com/custom-player.png',
            type: 'sprite'
        },
        {
            originalUrl: '/sprites/enemy.png',
            remixUrl: 'https://example.com/custom-enemy.png',
            type: 'sprite'
        },
        {
            originalUrl: '/sounds/jump.mp3',
            remixUrl: 'https://example.com/custom-jump.mp3',
            type: 'audio'
        }
    ]);
}
```

### Loading Remixed Images

```javascript
let playerSprite;
let enemySprite;

async function preload() {
    // SDK automatically uses remixed URLs if available
    playerSprite = await SDK.assets.loadImage('/sprites/player.png');
    enemySprite = await SDK.assets.loadImage('/sprites/enemy.png');
}

function draw() {
    background(0);
    
    // Draw with potentially remixed sprites
    image(playerSprite, playerX, playerY);
    image(enemySprite, enemyX, enemyY);
}
```

### With p5.js loadImage Integration

```javascript
let playerImg;

function preload() {
    // Get the remixed URL
    const playerUrl = SDK.assets.getAssetUrl('/sprites/player.png');
    
    // Use with p5.js
    playerImg = loadImage(playerUrl);
}
```

## 🔄 Real-time Updates from Parent Window

### Parent Window Code (Remix UI)

```javascript
// Send variable update to game iframe
const gameIframe = document.getElementById('game-iframe');

gameIframe.contentWindow.postMessage({
    type: 'UPDATE_VARIABLE',
    data: {
        key: 'playerSpeed',
        value: 8
    }
}, '*');

// Bulk update multiple variables
gameIframe.contentWindow.postMessage({
    type: 'BULK_UPDATE',
    data: {
        playerSpeed: 8,
        gravity: 1.2,
        backgroundColor: '#ff0000'
    }
}, '*');

// Update assets
gameIframe.contentWindow.postMessage({
    type: 'UPDATE_ASSETS',
    data: {
        mappings: [
            {
                originalUrl: '/sprites/player.png',
                remixUrl: 'https://new-url.com/player.png',
                type: 'sprite'
            }
        ]
    }
}, '*');
```

### Game Code (Receives Updates)

```javascript
// Updates are automatically handled by SDK
// Just subscribe to changes:

SDK.schema.onUpdate((key, value) => {
    console.log(`Remix update: ${key} = ${value}`);
    
    // Apply changes immediately
    switch(key) {
        case 'playerSpeed':
            player.speed = value;
            break;
        case 'gravity':
            world.gravity = value;
            break;
        case 'backgroundColor':
            bgColor = color(value);
            break;
    }
});
```

## 🎮 Complete Remix-Ready Game Example

```javascript
// Game variables
let player = {
    x: 200,
    y: 200,
    speed: 5,
    size: 30,
    sprite: null
};

let world = {
    gravity: 0.5,
    bgColor: '#000000'
};

let particles = [];
let particlesEnabled = true;

async function preload() {
    // Load sprites (will use remixed versions if available)
    player.sprite = await SDK.assets.loadImage('/sprites/player.png');
}

async function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // Initialize SDK
    await SDK.init({ gameId: 'my-remix-game', debug: true });
    
    // Define moddable schema
    SDK.schema.defineSchema([
        { key: 'playerSpeed', type: 'range', label: 'Speed', defaultValue: 5, min: 1, max: 15 },
        { key: 'playerSize', type: 'range', label: 'Size', defaultValue: 30, min: 10, max: 100 },
        { key: 'gravity', type: 'number', label: 'Gravity', defaultValue: 0.5, min: 0, max: 3 },
        { key: 'bgColor', type: 'color', label: 'Background', defaultValue: '#000000' },
        { key: 'particlesEnabled', type: 'boolean', label: 'Particles', defaultValue: true }
    ]);
    
    // Map assets
    SDK.assets.mapAssets([
        { originalUrl: '/sprites/player.png', remixUrl: '/sprites/player.png', type: 'sprite' }
    ]);
    
    // Listen for real-time updates
    SDK.schema.onUpdate((key, value) => {
        if (key === 'playerSpeed') player.speed = value;
        if (key === 'playerSize') player.size = value;
        if (key === 'gravity') world.gravity = value;
        if (key === 'bgColor') world.bgColor = value;
        if (key === 'particlesEnabled') particlesEnabled = value;
    });
    
    // Listen for asset updates
    SDK.assets.onAssetLoad((url, success) => {
        console.log(`Asset ${url} loaded: ${success}`);
    });
    
    // Start game
    await SDK.lifecycle.start();
}

function draw() {
    // Use moddable background color
    background(world.bgColor);
    
    // Player movement with moddable speed
    if (keyIsDown(LEFT_ARROW)) player.x -= player.speed;
    if (keyIsDown(RIGHT_ARROW)) player.x += player.speed;
    if (keyIsDown(UP_ARROW)) player.y -= player.speed;
    if (keyIsDown(DOWN_ARROW)) player.y += player.speed;
    
    // Draw player with moddable size and potentially remixed sprite
    if (player.sprite) {
        image(player.sprite, player.x, player.y, player.size, player.size);
    } else {
        fill(255);
        rect(player.x, player.y, player.size, player.size);
    }
    
    // Particles (if enabled)
    if (particlesEnabled && frameCount % 5 === 0) {
        particles.push({ x: player.x, y: player.y, life: 255 });
    }
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.y += world.gravity;
        p.life -= 5;
        
        fill(255, p.life);
        ellipse(p.x, p.y, 5);
        
        if (p.life <= 0) particles.splice(i, 1);
    }
}

async function keyPressed() {
    if (key === 'q') {
        await SDK.lifecycle.finish(score);
    }
}
```

## 📡 Message Protocol

### Messages Sent by Game (to Parent)

```typescript
// Schema defined
{
    type: 'SCHEMA_DEFINED',
    data: {
        schema: { properties: [...] },
        currentValues: { playerSpeed: 5, gravity: 0.5 }
    }
}

// Assets manifest
{
    type: 'ASSETS_MANIFEST',
    data: {
        assets: [
            { originalUrl: '...', remixUrl: '...', type: 'sprite' }
        ]
    }
}
```

### Messages Received by Game (from Parent)

```typescript
// Update single variable
{
    type: 'UPDATE_VARIABLE',
    data: { key: 'playerSpeed', value: 8 }
}

// Bulk update
{
    type: 'BULK_UPDATE',
    data: { playerSpeed: 8, gravity: 1.2 }
}

// Update assets
{
    type: 'UPDATE_ASSETS',
    data: {
        mappings: [...]
    }
}

// Request current schema
{
    type: 'REQUEST_SCHEMA'
}
```

## 🎯 Best Practices

1. **Always define schema early** - Call `defineSchema()` in `setup()`
2. **Use onUpdate for reactivity** - Subscribe to changes instead of polling
3. **Validate values** - SDK automatically validates against schema
4. **Preload assets** - Use `SDK.assets.loadImage()` in `preload()`
5. **Test with mock data** - Send test messages from console during development

```javascript
// Test in browser console:
window.postMessage({
    type: 'UPDATE_VARIABLE',
    data: { key: 'playerSpeed', value: 10 }
}, '*');
```
