import { NextRequest, NextResponse } from 'next/server';
import { AI_CONFIG } from '@/config/ai';

// Base prompt for new game creation
const SYSTEM_PROMPT = `You are a WORLD-CLASS Game Developer and Creative Technologist specializing in hyper-polished web games using p5.js.

Your mission: Transform user ideas into PROFESSIONAL, JUICY, and PLAYABLE games that feel premium.

=== QUALITY STANDARDS (NON-NEGOTIABLE) ===
1. GAME JUICE: Every action must have visual/audio feedback
   - Particles on collision/score
   - Screen shake on impact
   - Smooth easing transitions (lerp)
   - Color flashes on events
   
2. ARCHITECTURE: Use ES6 Classes for entities (Player, Enemy, Particle, etc.)
   - Clean separation of concerns
   - Reusable components
   
3. LIBRARIES AVAILABLE:
   - p5.js (graphics, input, math)
   - p5.collide2D (collideRectRect, collideCircleCircle, etc.)
   
4. RESPONSIVE: Support windowResized() for dynamic canvas sizing

5. SDK INTEGRATION (MANDATORY):
   - SDK.registerMods() in setup()
   - SDK.onModUpdate() for live parameter changes
   - SDK.setScore() when score changes
   - SDK.gameReady() and SDK.gameStart() lifecycle calls

=== OUTPUT JSON SCHEMA ===
{
  "gameName": "Creative, memorable name",
  "genre": "Action/Puzzle/Platformer/etc.",
  "mechanics": ["Core mechanic 1", "mechanic 2", "mechanic 3"],
  "levelStructure": "Detailed level progression description",
  "mantleAssets": ["Purchasable item 1", "item 2", "item 3"],
  "difficulty": 5,
  "visualStyle": "Neon Cyberpunk / Pixel Art / Minimalist / etc.",
  "startingScene": "Atmospheric description of opening scene",
  "playerActions": ["Jump", "Shoot", "Dash"],
  "modSchema": [
    {
      "key": "playerSpeed",
      "type": "range",
      "label": "Player Speed",
      "defaultValue": 5,
      "min": 1,
      "max": 20,
      "step": 0.5
    },
    {
      "key": "enemyCount",
      "type": "range",
      "label": "Enemy Count",
      "defaultValue": 3,
      "min": 1,
      "max": 10,
      "step": 1
    },
    {
      "key": "themeColor",
      "type": "color",
      "label": "Theme Color",
      "defaultValue": "#00ffcc"
    },
    {
      "key": "particlesEnabled",
      "type": "boolean",
      "label": "Particles",
      "defaultValue": true
    }
  ],
  "gameCode": "COMPLETE PLAYABLE p5.js CODE HERE"
}

=== GAME CODE TEMPLATE ===
// GLOBAL VARIABLES (from modSchema)
let playerSpeed = 5;
let enemyCount = 3;
let themeColor;
let particlesEnabled = true;

// GAME STATE
let player;
let enemies = [];
let particles = [];
let score = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  themeColor = color('#00ffcc');
  
  // Initialize entities
  player = new Player();
  for(let i=0; i<enemyCount; i++) {
    enemies.push(new Enemy());
  }
  
  // SDK INTEGRATION
  SDK.registerMods({
    playerSpeed: 5,
    enemyCount: 3,
    themeColor: '#00ffcc',
    particlesEnabled: true
  });
  
  SDK.onModUpdate((vars) => {
    playerSpeed = vars.playerSpeed;
    themeColor = color(vars.themeColor);
    particlesEnabled = vars.particlesEnabled;
    
    // Adjust enemy count dynamically
    while(enemies.length < vars.enemyCount) {
      enemies.push(new Enemy());
    }
    while(enemies.length > vars.enemyCount) {
      enemies.pop();
    }
  });
  
  SDK.gameReady();
  SDK.gameStart();
}

function draw() {
  background(0, 20); // Trail effect
  
  // Update & Draw
  player.update();
  player.show();
  
  enemies.forEach(e => {
    e.update();
    e.show();
    
    // Collision with p5.collide2D
    if(collideRectRect(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
      score++;
      SDK.setScore(score);
      
      // JUICE: Particles + Screen Shake
      if(particlesEnabled) {
        for(let i=0; i<10; i++) {
          particles.push(new Particle(e.x, e.y));
        }
      }
      e.reset();
    }
  });
  
  // Particles
  particles = particles.filter(p => {
    p.update();
    p.show();
    return p.alpha > 0;
  });
  
  // UI
  fill(themeColor);
  textSize(32);
  text('Score: ' + score, 20, 40);
}

class Player {
  constructor() {
    this.x = width/2;
    this.y = height/2;
    this.w = 40;
    this.h = 40;
  }
  
  update() {
    if(keyIsDown(LEFT_ARROW)) this.x -= playerSpeed;
    if(keyIsDown(RIGHT_ARROW)) this.x += playerSpeed;
    if(keyIsDown(UP_ARROW)) this.y -= playerSpeed;
    if(keyIsDown(DOWN_ARROW)) this.y += playerSpeed;
    
    this.x = constrain(this.x, 0, width-this.w);
    this.y = constrain(this.y, 0, height-this.h);
  }
  
  show() {
    fill(themeColor);
    rect(this.x, this.y, this.w, this.h);
  }
}

class Enemy {
  constructor() {
    this.reset();
    this.w = 30;
    this.h = 30;
  }
  
  reset() {
    this.x = random(width);
    this.y = random(height);
  }
  
  update() {
    // AI behavior here
  }
  
  show() {
    fill(255, 0, 0);
    rect(this.x, this.y, this.w, this.h);
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-3, 3);
    this.vy = random(-3, 3);
    this.alpha = 255;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5;
  }
  
  show() {
    fill(themeColor.levels[0], themeColor.levels[1], themeColor.levels[2], this.alpha);
    circle(this.x, this.y, 5);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

=== CRITICAL RULES ===
1. ALL modSchema variables MUST be declared as GLOBAL variables
2. SDK.registerMods() MUST use EXACT same keys as modSchema
3. Use p5.collide2D for collision detection (collideRectRect, collideCircleCircle, etc.)
4. Add particles, screen shake, or visual feedback for key events
5. Use ES6 Classes for game entities
6. Return ONLY valid JSON, no extra text
7. Code must be COMPLETE and PLAYABLE immediately`;

// Revision prompt for updating existing games
const REVISION_PROMPT = (previousGameData: any, newInstructions: string) => `You are a WORLD-CLASS Game Developer. The user wants to EVOLVE an existing game.

=== CURRENT GAME ===
${JSON.stringify(previousGameData, null, 2)}

=== USER REQUEST ===
"${newInstructions}"

=== YOUR MISSION ===
EVOLVE the game by integrating the user's request while PRESERVING the game's core identity and quality.

=== EVOLUTION RULES ===
1. **PRESERVE QUALITY**: Maintain all "game juice" (particles, animations, feedback)
2. **KEEP ARCHITECTURE**: Use existing class structure, add new classes if needed
3. **MAINTAIN SDK**: Keep all SDK.registerMods(), SDK.onModUpdate(), SDK.setScore() calls
4. **UPDATE modSchema**: Add new parameters if needed, keep existing ones
5. **USE p5.collide2D**: Continue using collision library for any new collision logic
6. **ENHANCE, DON'T BREAK**: Add features without removing existing functionality unless explicitly requested

=== COMMON EVOLUTION PATTERNS ===
- "Add enemies" → Create Enemy class, add enemyCount to modSchema
- "Make it harder" → Increase difficulty parameter, add obstacles
- "Change color" → Update themeColor in modSchema
- "Add power-ups" → Create PowerUp class, add spawn logic

=== OUTPUT FORMAT ===
Return the SAME JSON structure with updated fields:
{
  "gameName": "Updated name (if relevant)",
  "genre": "...",
  "mechanics": [...existing + new...],
  "levelStructure": "...",
  "mantleAssets": [...],
  "difficulty": ...,
  "visualStyle": "...",
  "startingScene": "...",
  "playerActions": [...],
  "modSchema": [...existing + new parameters...],
  "gameCode": "COMPLETE UPDATED CODE"
}

=== CRITICAL ===
- Return ONLY valid JSON
- Code must be COMPLETE and PLAYABLE
- Don't remove existing features unless explicitly asked
- Maintain all SDK integration points`;

// --- DYNAMIC MOCK GENERATOR (SDK UYUMLU VERSİYON) ---
function generateMockGame(genre: 'Platformer' | 'Shooter' | 'Collector' | 'Snake' | 'Pong', description: string) {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  const words = description.split(' ').slice(0, 3).join(' ');
  const baseName = words.replace(/[^a-zA-Z0-9 ]/g, '') || "Retro";
  const generatedName = baseName.length > 2 ? baseName.charAt(0).toUpperCase() + baseName.slice(1) : `Game ${Math.floor(Math.random() * 100)}`;

  // ORTAK DEĞİŞKENLER VE SETUP BAŞLANGICI
  const commonVars = `let score=0, gameState='PLAY';`;

  // SDK INTEGRATION TEMPLATE
  const sdkSetup = (modVars: string, updateLogic: string) => `
        // 1. NOTIFY SDK: Register default settings
        if(window.SDK) {
            window.SDK.registerMods({ ${modVars} });
            
            // 2. LISTEN: Update when slider changes
            window.SDK.onModUpdate((vars) => {
                ${updateLogic}
            });
            
            // 3. READY: Remove loading screen
            window.SDK.gameReady();
            window.SDK.gameStart();
        }
    `;

  // SKOR GÖNDERME YARDIMCISI
  const submitLogic = `if(window.SDK) window.SDK.submitScore(score);`;

  if (genre === 'Snake') {
    const modVars = `speed: 15, snakeColor: '#00ff00'`;
    const updateLogic = `frameRate(vars.speed); playerColor = color(vars.snakeColor);`;

    return {
      gameName: `${generatedName} Snake`,
      genre: "Classic Arcade",
      mechanics: ["Grid", "Growth"],
      levelStructure: "Grid",
      mantleAssets: ["Apple", "Potion"],
      difficulty: 5,
      visualStyle: "Pixelated",
      startingScene: "Hungry...",
      playerActions: ["Turn", "Speed"],
      gameCode: `
                ${commonVars}
                let s, scl=20, food, playerColor;
                
                function setup(){
                    createCanvas(windowWidth,windowHeight);
                    playerColor = color(0,255,100);
                    frameRate(15);
                    s = new Snake();
                    pickLocation();
                    
                    ${sdkSetup(modVars, updateLogic)}
                }
                
                function pickLocation(){
                    let cols=floor(width/scl),rows=floor(height/scl);
                    food=createVector(floor(random(cols)),floor(random(rows)));
                    food.mult(scl);
                }
                
                function draw(){
                    background(20);
                    if(s.eat(food)){
                        pickLocation();
                        score+=10;
                        ${submitLogic}
                    }
                    s.death();
                    s.update();
                    s.show();
                    fill(255,0,100);
                    rectMode(CORNER);
                    rect(food.x,food.y,scl,scl);
                    
                    fill(255);
                    textSize(24);
                    textAlign(LEFT);
                    text("Score: "+score,20,30);
                }
                
                function keyPressed(){
                    if(keyCode===UP_ARROW)s.dir(0,-1);
                    else if(keyCode===DOWN_ARROW)s.dir(0,1);
                    else if(keyCode===RIGHT_ARROW)s.dir(1,0);
                    else if(keyCode===LEFT_ARROW)s.dir(-1,0);
                }
                
                function Snake(){
                    this.x=0;this.y=0;this.xspeed=1;this.yspeed=0;this.total=0;this.tail=[];
                    this.eat=function(pos){let d=dist(this.x,this.y,pos.x,pos.y);if(d<1){this.total++;return true;}else{return false;}};
                    this.dir=function(x,y){this.xspeed=x;this.yspeed=y;};
                    this.death=function(){for(let i=0;i<this.tail.length;i++){let pos=this.tail[i];let d=dist(this.x,this.y,pos.x,pos.y);if(d<1){this.total=0;this.tail=[];score=0;}}};
                    this.update=function(){if(this.total===this.tail.length){for(let i=0;i<this.tail.length-1;i++){this.tail[i]=this.tail[i+1];}}this.tail[this.total-1]=createVector(this.x,this.y);this.x=this.x+this.xspeed*scl;this.y=this.y+this.yspeed*scl;this.x=constrain(this.x,0,width-scl);this.y=constrain(this.y,0,height-scl);};
                    this.show=function(){fill(playerColor);noStroke();rectMode(CORNER);for(let i=0;i<this.tail.length;i++){rect(this.tail[i].x,this.tail[i].y,scl,scl);}rect(this.x,this.y,scl,scl);}
                }
                function windowResized(){resizeCanvas(windowWidth,windowHeight);}
            `
    };
  } else if (genre === 'Pong') {
    const modVars = `ballSpeed: 7, paddleHeight: 100, aiDifficulty: 0.08`;
    const updateLogic = `b.sp = vars.ballSpeed; lp.h = vars.paddleHeight; rp.h = vars.paddleHeight; aiSpeed = vars.aiDifficulty;`;

    return {
      gameName: `${generatedName} Pong`,
      genre: "Sports",
      mechanics: ["Paddle", "Ball"],
      levelStructure: "Court",
      mantleAssets: ["Ball", "Paddle"],
      difficulty: 3,
      visualStyle: "Neon",
      startingScene: "Match Point",
      playerActions: ["Up", "Down"],
      gameCode: `
                ${commonVars}
                let lp={x:30,y:0,w:20,h:100}, rp={x:0,y:0,w:20,h:100};
                let b={x:0,y:0,s:20,a:0,sp:7};
                let aiSpeed = 0.08;
                
                function setup(){
                    createCanvas(windowWidth,windowHeight);
                    rp.x=width-30; rp.y=height/2; lp.y=height/2;
                    b.x=width/2; b.y=height/2; b.a=random(TWO_PI);
                    rectMode(CENTER);
                    
                    ${sdkSetup(modVars, updateLogic)}
                }
                
                function draw(){
                    background(10);
                    stroke(255,50); line(width/2,0,width/2,height); noStroke();
                    
                    fill(255); rect(lp.x,lp.y,lp.w,lp.h);
                    fill('#00ff00'); rect(rp.x,rp.y,rp.w,rp.h);
                    fill(255); ellipse(b.x,b.y,b.s);
                    
                    lp.y=mouseY;
                    rp.y=lerp(rp.y,b.y,aiSpeed);
                    
                    b.x+=cos(b.a)*b.sp; b.y+=sin(b.a)*b.sp;
                    
                    if(b.y<0||b.y>height) b.a*=-1;
                    
                    if(b.x-b.s/2<lp.x+lp.w/2 && b.y>lp.y-lp.h/2 && b.y<lp.y+lp.h/2){
                        b.a=PI-b.a; b.sp+=0.5; score+=1;
                        ${submitLogic}
                    }
                    if(b.x+b.s/2>rp.x-rp.w/2 && b.y>rp.y-rp.h/2 && b.y<rp.y+rp.h/2) b.a=PI-b.a;
                    
                    if(b.x<0||b.x>width){
                        b.x=width/2; b.y=height/2; b.sp=7; b.a=random(TWO_PI);
                        score=0;
                    }
                    
                    textSize(32); textAlign(CENTER); text(score, width/2, 50);
                }
                function windowResized(){resizeCanvas(windowWidth,windowHeight);}
            `
    };
  } else {
    // DEFAULT: PLATFORMER (En yaygın)
    const modVars = `playerSpeed: 5, gravity: 0.6, jumpForce: 12, themeColor: '#00ccff'`;
    const updateLogic = `
            playerSpeed = vars.playerSpeed; 
            grav = vars.gravity; 
            jump = -vars.jumpForce; 
            themeColor = color(vars.themeColor);
        `;

    return {
      gameName: `${generatedName} Jump`,
      genre: "Platformer",
      mechanics: ["Jump", "Gravity"],
      levelStructure: "Vertical",
      mantleAssets: ["Boots", "Jetpack"],
      difficulty: 4,
      visualStyle: "Geometric",
      startingScene: "Climb...",
      playerActions: ["Jump", "Left", "Right"],
      gameCode: `
                ${commonVars}
                let p={x:200,y:300,w:30,h:30,vy:0,g:false};
                let grav=0.6, jump=-12, playerSpeed=5;
                let plats=[], themeColor;
                
                function setup(){
                    createCanvas(windowWidth,windowHeight);
                    themeColor = color(0, 204, 255);
                    
                    for(let i=0;i<6;i++) plats.push({x:i*150,y:100+i*80,w:100,h:20});
                    
                    ${sdkSetup(modVars, updateLogic)}
                }
                
                function draw(){
                    background(20);
                    
                    fill(themeColor);
                    rect(width/2,height/2,width-40,height-40);
                    fill(0,180);
                    rect(width/2,height/2,width,height);
                    
                    fill(255);
                    rect(p.x,p.y,p.w,p.h);
                    
                    p.vy+=grav;
                    p.y+=p.vy;
                    
                    if(keyIsDown(LEFT_ARROW)) p.x -= playerSpeed;
                    if(keyIsDown(RIGHT_ARROW)) p.x += playerSpeed;
                    
                    p.g=false;
                    for(let pl of plats){
                        rect(pl.x+pl.w/2, pl.y+pl.h/2, pl.w, pl.h);
                        
                        if(p.x>pl.x && p.x<pl.x+pl.w && p.y+p.h/2>pl.y && p.y+p.h/2<pl.y+pl.h+20 && p.vy>=0){
                            p.y=pl.y-p.h/2; p.vy=0; p.g=true;
                        }
                    }
                    
                    if((keyIsDown(UP_ARROW)||mouseIsPressed) && p.g){
                        p.vy=jump;
                        score+=10;
                        ${submitLogic}
                    }
                    
                    if(p.y>height){
                        p.y=0; p.vy=0; score=0;
                    }
                    
                    fill(255); textSize(20); textAlign(CENTER);
                    text("Score: " + score, width/2, 40);
                }
                function windowResized(){resizeCanvas(windowWidth,windowHeight);}
            `
    };
  }
}

export async function POST(request: NextRequest) {
  // DEBUG: Log API Key existence (safe log)
  console.log("DEBUG: API Key checking:", !!(process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY));

  let description = "";
  let previousGameData = null;

  console.log('\n========================================');
  console.log('🚀 GAME GENERATION API CALLED');
  console.log('========================================');

  try {
    const json = await request.json();
    description = json.description || "";
    previousGameData = json.previousGameData || null;

    console.log('📝 Request Details:');
    console.log('  - Description:', description.slice(0, 100) + (description.length > 100 ? '...' : ''));
    console.log('  - Is Revision:', !!previousGameData);

    // ========== API KEY VALIDATION ==========
    const apiKey = AI_CONFIG.apiKey;

    if (!apiKey) {
      console.error('❌ API KEY MISSING!');
      // Return explicit error to frontend
      return NextResponse.json({
        success: false,
        error: 'NO_API_KEY',
        message: 'API Key configuration missing. Set OPENROUTER_API_KEY in .env.local'
      }, { status: 400 });
    }

    // ========== OPENROUTER API REQUEST ==========
    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

    // Hardcoded Referer as requested
    const REFERER = "http://localhost:3000";
    const APP_TITLE = "Game Factory";

    const requestBody = {
      "model": "google/gemini-2.0-flash-001",
      "messages": [
        {
          "role": "system",
          "content": previousGameData
            ? REVISION_PROMPT(previousGameData, description)
            : SYSTEM_PROMPT
        },
        {
          "role": "user",
          "content": previousGameData
            ? `Oyunu şu şekilde güncelle: ${description}`
            : `Kullanıcının oyun fikri: ${description}`
        }
      ]
    };

    console.log('\n📡 OpenRouter Request:');
    console.log('  - URL:', apiUrl);
    console.log('  - Headers Referer:', REFERER);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": REFERER,
        "X-Title": APP_TITLE,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    console.log('\n📥 OpenRouter Response:');
    console.log('  - Status:', response.status, response.statusText);

    // ========== ERROR HANDLING ==========
    if (!response.ok) {
      console.error('\n❌ OpenRouter API Error:');
      const errorText = await response.text();
      console.error('  - Error Body:', errorText);

      // Return specific error to frontend to exit "Simulation Mode" loops
      return NextResponse.json({
        success: false,
        isMock: false,
        error: `API_ERROR_${response.status}`,
        message: errorText,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      }, { status: response.status });
    }

    // ========== PARSE RESPONSE ==========
    const completion = await response.json();
    console.log('\n✅ Response Received:');
    console.log('  - Has choices:', !!completion.choices);
    console.log('  - Choices length:', completion.choices?.length || 0);

    const text = completion.choices[0]?.message?.content || "";
    if (!text) {
      console.error('❌ Empty response from AI');
      throw new Error("Empty response from AI");
    }

    console.log('  - Content length:', text.length);
    console.log('  - Content preview:', text.slice(0, 200));

    let gameData;
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      gameData = JSON.parse(cleanedText);
      console.log('\n✅ JSON Parsed Successfully');
      console.log('  - Game Name:', gameData.gameName);
      console.log('  - Has modSchema:', !!gameData.modSchema);
      console.log('  - modSchema items:', gameData.modSchema?.length || 0);
    } catch (parseError) {
      console.error('\n❌ JSON Parse Error:', parseError);
      console.error('  - Raw text:', text.slice(0, 500));
      return NextResponse.json({ error: 'AI yanıtı JSON formatında değil', raw: text }, { status: 500 });
    }

    console.log('\n🎉 SUCCESS - Returning AI-generated game');
    console.log('========================================\n');
    return NextResponse.json({
      success: true,
      gameData,
      isMock: false,
      apiStatus: 'connected'
    });
  } catch (error) {
    console.error('\n💥 FATAL ERROR - Falling back to Mock Mode');
    console.error('  - Error Type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('  - Error Message:', error instanceof Error ? error.message : String(error));
    console.error('  - Stack:', error instanceof Error ? error.stack : 'N/A');
    console.log('========================================\n');

    // Extract detailed error info
    const errorMessage = error instanceof Error ? error.message : String(error);
    let errorCode = 'UNKNOWN';
    let errorHint = 'Check server console for details';

    if (errorMessage.includes('401')) {
      errorCode = '401 UNAUTHORIZED';
      errorHint = 'API key is invalid or expired. Check https://openrouter.ai/keys';
    } else if (errorMessage.includes('402')) {
      errorCode = '402 PAYMENT REQUIRED';
      errorHint = 'Insufficient credits. Add credits at https://openrouter.ai/credits';
    } else if (errorMessage.includes('429')) {
      errorCode = '429 RATE LIMIT';
      errorHint = 'Too many requests. Wait a moment and try again';
    } else if (errorMessage.includes('API Key configuration missing')) {
      errorCode = 'NO API KEY';
      errorHint = 'Set OPENROUTER_API_KEY in .env.local';
    }

    let genre: 'Platformer' | 'Shooter' | 'Collector' | 'Snake' | 'Pong' = 'Shooter';
    const desc = description.toLowerCase();
    if (desc.includes('jump') || desc.includes('zıpla') || desc.includes('platform')) genre = 'Platformer';
    else if (desc.includes('collect') || desc.includes('topla')) genre = 'Collector';
    else if (desc.includes('snake') || desc.includes('yılan')) genre = 'Snake';
    else if (desc.includes('pong') || desc.includes('tennis')) genre = 'Pong';

    const mockGame = generateMockGame(genre, description);
    return NextResponse.json({
      success: true,
      gameData: mockGame,
      isMock: true,
      error: `${errorCode}: ${errorHint}`,
      errorDetails: errorMessage,
      note: "Using simulation mode - Check server console for full details"
    });
  }
}
