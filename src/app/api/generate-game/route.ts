import { NextRequest, NextResponse } from 'next/server';
import { AI_CONFIG } from '@/config/ai';

const SYSTEM_PROMPT = `Sen hem bir Oyun Tasarımı Uzmanı hem de deneyimli bir p5.js Geliştiricisisin. Kullanıcının girdiği oyun fikrini analiz et ve aşağıdaki şemaya uygun bir JSON objesi döndür.

JSON Formatı:
{
  "gameName": "Oyunun Adı (yaratıcı ve akılda kalıcı)",
  "genre": "Oyun Türü (Action, RPG, Puzzle, Strategy, Adventure, Platformer, vb.)",
  "mechanics": ["Mekanik 1", "Mekanik 2", "Mekanik 3"],
  "levelStructure": "Seviye yapısının detaylı açıklaması",
  "mantleAssets": ["mETH ile alınabilecek eşya 1", "eşya 2", "eşya 3"],
  "difficulty": 1-10 arası zorluk seviyesi (sayı olarak),
  "visualStyle": "Görsel stil (Cyberpunk, Pixel Art, Low Poly, vb.)",
  "startingScene": "Oyunun başlangıç sahnesinin atmosferik betimlemesi",
  "playerActions": ["Saldır", "Kaç", "Keşfet" gibi oyunun başlangıcında yapılabilecek 3 eylem],
  "gameCode": "TAM OYNANABILIR p5.js KODU - Önemli: Sadece saf JavaScript kodu yaz, p5.js CDN script etiketi EKLEME. Kod mutlaka setup() ve draw() fonksiyonlarını içermeli. Canvas boyutunu createCanvas(windowWidth, windowHeight) ile responsive yap. windowResized() fonksiyonu ekle. Hem dokunmatik (touchStarted, touchMoved) hem de klavye (keyPressed) kontrolleri ekle. Görsel stil ve mekaniklere uygun tam çalışan bir oyun kodu oluştur. Oyunun temel mekaniklerini ve interaktif elementlerini ekle."
}

ÖNEMLİ: SADECE geçerli JSON döndür, başka hiçbir açıklama veya metin ekleme. gameCode alanına p5.js CDN linki ekleme, sadece JavaScript kodu yaz.`;

// --- DYNAMIC MOCK GENERATOR EXTENDED ---

function generateMockGame(genre: 'Platformer' | 'Shooter' | 'Collector' | 'Snake' | 'Pong', description: string) {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);

    // Name generation
    const words = description.split(' ').slice(0, 3).join(' ');
    const baseName = words.replace(/[^a-zA-Z0-9 ]/g, '') || "Retro";
    const generatedName = baseName.length > 2 ? baseName.charAt(0).toUpperCase() + baseName.slice(1) : `Game ${Math.floor(Math.random() * 100)}`;

    const commonSetup = `
        let score = 0;
        let themeColor;
        let playerColor;
        let gameState = 'PLAY';
        
        function setup() {
            createCanvas(windowWidth, windowHeight);
            themeColor = color(${r}, ${g}, ${b});
            playerColor = color(${255 - r}, ${255 - b}, ${255 - g});
            rectMode(CENTER);
            textAlign(CENTER);
            frameRate(60);
        }
        
        function windowResized() {
            resizeCanvas(windowWidth, windowHeight);
        }
    `;

    if (genre === 'Snake') {
        const title = `${generatedName} Snake`;
        return {
            gameName: title,
            genre: "Classic Arcade",
            mechanics: ["Grid Movement", "Growth", "High Score"],
            levelStructure: "Enclosed grid arena.",
            mantleAssets: ["Golden Apple", "Speed Potion", "Ghost Mode"],
            difficulty: 5,
            visualStyle: "Pixelated",
            startingScene: "The serpent hungers...",
            playerActions: ["Turn", "Speed Up", "Pause"],
            gameCode: `
                ${commonSetup}
                let s;
                let scl = 20;
                let food;

                function setup() {
                    createCanvas(windowWidth, windowHeight);
                    themeColor = color(${r}, ${g}, ${b});
                    playerColor = color(0, 255, 100);
                    s = new Snake();
                    pickLocation();
                    frameRate(10);
                }

                function pickLocation() {
                    let cols = floor(width/scl);
                    let rows = floor(height/scl);
                    food = createVector(floor(random(cols)), floor(random(rows)));
                    food.mult(scl);
                }

                function draw() {
                    background(20);
                    if (s.eat(food)) {
                        pickLocation();
                        score += 10;
                    }
                    s.death();
                    s.update();
                    s.show();
                    
                    fill(255, 0, 100);
                    rectMode(CORNER);
                    rect(food.x, food.y, scl, scl);
                    
                    fill(255);
                    textSize(24);
                    textAlign(LEFT);
                    text("Score: " + score, 20, 30);
                    textAlign(CENTER);
                }

                function keyPressed() {
                    if (keyCode === UP_ARROW) s.dir(0, -1);
                    else if (keyCode === DOWN_ARROW) s.dir(0, 1);
                    else if (keyCode === RIGHT_ARROW) s.dir(1, 0);
                    else if (keyCode === LEFT_ARROW) s.dir(-1, 0);
                }

                function Snake() {
                    this.x = 0;
                    this.y = 0;
                    this.xspeed = 1;
                    this.yspeed = 0;
                    this.total = 0;
                    this.tail = [];

                    this.eat = function(pos) {
                        let d = dist(this.x, this.y, pos.x, pos.y);
                        if (d < 1) {
                            this.total++;
                            return true;
                        } else {
                            return false;
                        }
                    }

                    this.dir = function(x, y) {
                        this.xspeed = x;
                        this.yspeed = y;
                    }

                    this.death = function() {
                        for (let i = 0; i < this.tail.length; i++) {
                            let pos = this.tail[i];
                            let d = dist(this.x, this.y, pos.x, pos.y);
                            if (d < 1) {
                                this.total = 0;
                                this.tail = [];
                                score = 0;
                            }
                        }
                    }

                    this.update = function() {
                        if (this.total === this.tail.length) {
                            for (let i = 0; i < this.tail.length - 1; i++) {
                                this.tail[i] = this.tail[i + 1];
                            }
                        }
                        this.tail[this.total - 1] = createVector(this.x, this.y);

                        this.x = this.x + this.xspeed * scl;
                        this.y = this.y + this.yspeed * scl;

                        this.x = constrain(this.x, 0, width - scl);
                        this.y = constrain(this.y, 0, height - scl);
                    }

                    this.show = function() {
                        fill(playerColor);
                        noStroke();
                        rectMode(CORNER);
                        for (let i = 0; i < this.tail.length; i++) {
                            rect(this.tail[i].x, this.tail[i].y, scl, scl);
                        }
                        rect(this.x, this.y, scl, scl);
                    }
                }
            `
        };
    }
    else if (genre === 'Pong') {
        const title = `${generatedName} Tennis`;
        return {
            gameName: title,
            genre: "Sports",
            mechanics: ["Paddle Control", "Physics Ball", "AI Opponent"],
            levelStructure: "1v1 Court.",
            mantleAssets: ["Fireball", "Big Paddle", "Wall"],
            difficulty: 3,
            visualStyle: "Neon Tennis",
            startingScene: "Match point!",
            playerActions: ["Up", "Down", "Serve"],
            gameCode: `
                ${commonSetup}
                let leftPaddle, rightPaddle, ball;

                function setup() {
                    createCanvas(windowWidth, windowHeight);
                    themeColor = color(${r}, ${g}, ${b});
                    rectMode(CENTER);
                    
                    leftPaddle = { x: 30, y: height/2, w: 20, h: 100 };
                    rightPaddle = { x: width-30, y: height/2, w: 20, h: 100 };
                    ball = { x: width/2, y: height/2, s: 20, ang: random(TWO_PI), speed: 7 };
                }

                function draw() {
                    background(10);
                    
                    // Net
                    stroke(255, 50);
                    line(width/2, 0, width/2, height);
                    noStroke();

                    // Paddles
                    fill(255);
                    rect(leftPaddle.x, leftPaddle.y, leftPaddle.w, leftPaddle.h);
                    fill(themeColor);
                    rect(rightPaddle.x, rightPaddle.y, rightPaddle.w, rightPaddle.h);
                    
                    // Ball
                    fill(255);
                    ellipse(ball.x, ball.y, ball.s);
                    
                    // Logic
                    leftPaddle.y = mouseY;
                    
                    // Simple AI
                    let destY = ball.y;
                    rightPaddle.y = lerp(rightPaddle.y, destY, 0.08);
                    
                    // Ball Move
                    ball.x += cos(ball.ang) * ball.speed;
                    ball.y += sin(ball.ang) * ball.speed;
                    
                    // Bounce Canvas
                    if (ball.y < 0 || ball.y > height) {
                        ball.ang *= -1;
                    }
                    
                    // Bounce Paddles
                    if (ball.x - ball.s/2 < leftPaddle.x + leftPaddle.w/2) {
                        if (ball.y > leftPaddle.y - leftPaddle.h/2 && ball.y < leftPaddle.y + leftPaddle.h/2) {
                            ball.ang = PI - ball.ang + random(-0.2, 0.2);
                            ball.speed += 0.5;
                        }
                    }
                    
                    if (ball.x + ball.s/2 > rightPaddle.x - rightPaddle.w/2) {
                        if (ball.y > rightPaddle.y - rightPaddle.h/2 && ball.y < rightPaddle.y + rightPaddle.h/2) {
                            ball.ang = PI - ball.ang + random(-0.2, 0.2);
                        }
                    }
                    
                    // Score Reset
                    if (ball.x < 0 || ball.x > width) {
                        ball.x = width/2;
                        ball.y = height/2;
                        ball.speed = 7;
                        ball.ang = random(TWO_PI);
                    }
                }
            `
        };
    }
    else if (genre === 'Platformer') {
        const title = `${generatedName} Jump`;
        return {
            gameName: title,
            genre: "Platformer",
            mechanics: ["Procedural Jumping", "Gravity Physics", "Dynamic Color"],
            levelStructure: "Infinite vertical climb with randomized platforms.",
            mantleAssets: ["Gravity Boots", "Jetpack", "Shield"],
            difficulty: 4,
            visualStyle: "Abstract Geometric",
            startingScene: `You stand ready to conquer the towers.`,
            playerActions: ["Jump", "Move Left", "Move Right"],
            gameCode: `
                ${commonSetup}
                let player = { x: 200, y: 300, w: 30, h: 30, vy: 0, grounded: false };
                let gravity = 0.6;
                let jumpForce = -12;
                let platforms = [];
                for(let i=0; i<6; i++) { platforms.push({ x: i*150, y: 100 + i*80, w: 100, h: 20 }); }
                
                function draw() {
                    background(20);
                    noStroke(); fill(themeColor); rect(width/2, height/2, width-40, height-40);
                    fill(0, 150); rect(width/2, height/2, width, height);

                    fill(playerColor); rect(player.x, player.y, player.w, player.h);
                    player.vy += gravity; player.y += player.vy;
                    if (keyIsDown(LEFT_ARROW)) player.x -= 5;
                    if (keyIsDown(RIGHT_ARROW)) player.x += 5;
                    
                    fill(255); player.grounded = false;
                    for(let p of platforms) {
                        rect(p.x + p.w/2, p.y + p.h/2, p.w, p.h);
                        if (player.x > p.x && player.x < p.x + p.w && player.y + player.h/2 > p.y && player.y + player.h/2 < p.y + p.h + 20 && player.vy >= 0) {
                                player.y = p.y - player.h/2; player.vy = 0; player.grounded = true;
                        }
                    }
                    if ((keyIsDown(UP_ARROW) || mouseIsPressed) && player.grounded) player.vy = jumpForce;
                    if (player.y > height) { player.y = 0; player.vy = 0; score = 0; }
                    fill(255); textSize(20); text("${title}", width/2, 40);
                }
            `
        };
    }
    else if (genre === 'Collector') {
        const title = `${generatedName} Rush`;
        return {
            gameName: title,
            genre: "Arcade Collector",
            mechanics: ["Mouse Tracking", "Item Collection", "Score Multiplier"],
            levelStructure: "A confined arena where items spawn rapidly.",
            mantleAssets: ["Magnet", "Time Freeze", "Double Points"],
            difficulty: 4,
            visualStyle: "Minimalist",
            startingScene: "Collect the glowing orbs.",
            playerActions: ["Move Mouse", "Collect", "Dodge"],
            gameCode: `
                ${commonSetup}
                let collectables = []; let pX=0, pY=0;
                function draw() {
                    background(20);
                    pX = lerp(pX, mouseX, 0.1); pY = lerp(pY, mouseY, 0.1);
                    noStroke(); fill(playerColor); ellipse(pX, pY, 40, 40);
                    if (frameCount % 30 === 0) collectables.push({x: random(width), y: random(height), s: random(10,30), life: 255});
                    for(let i=collectables.length-1; i>=0; i--) {
                        let c = collectables[i]; c.life -= 2;
                        fill(themeColor); stroke(255, c.life); ellipse(c.x, c.y, c.s);
                        if (dist(pX, pY, c.x, c.y) < (20 + c.s/2)) { collectables.splice(i, 1); score += 10; } 
                        else if (c.life <= 0) collectables.splice(i, 1);
                    }
                    noStroke(); fill(255); textSize(24); text("Score: " + score, width/2, 50);
                }
            `
        };
    } else {
        // SHOOTER DEFAULT
        const title = `${generatedName} Wars`;
        return {
            gameName: title,
            genre: "Space Shooter",
            mechanics: ["Shooting", "Dodging", "Waves"],
            levelStructure: "Endless waves of enemies from the top.",
            mantleAssets: ["Laser", "Nuke", "Shield"],
            difficulty: 6,
            visualStyle: "Neon Retro",
            startingScene: "Defend against the incoming assault.",
            playerActions: ["Shoot", "Left", "Right"],
            gameCode: `
                ${commonSetup}
                let playerX; let bullets = []; let enemies = [];
                function setup() {
                    createCanvas(windowWidth, windowHeight);
                    themeColor = color(${r}, ${g}, ${b});
                    rectMode(CENTER); textAlign(CENTER); playerX = width/2;
                }
                function draw() {
                    background(10);
                    fill(255); triangle(playerX, height-50, playerX-20, height-20, playerX+20, height-20);
                    if (keyIsDown(LEFT_ARROW)) playerX -= 6;
                    if (keyIsDown(RIGHT_ARROW)) playerX += 6;
                    if (mouseIsPressed && frameCount % 10 === 0) bullets.push({x: playerX, y: height-50});
                    fill(themeColor);
                    for(let i=bullets.length-1; i>=0; i--) { bullets[i].y -= 10; ellipse(bullets[i].x, bullets[i].y, 10, 10); if(bullets[i].y < 0) bullets.splice(i, 1); }
                    if (frameCount % 40 === 0) enemies.push({x: random(width), y: -20, s: random(20, 50)});
                    for(let i=enemies.length-1; i>=0; i--) { enemies[i].y += 3; fill(200, 50, 50); rect(enemies[i].x, enemies[i].y, enemies[i].s, enemies[i].s); }
                    fill(255); text("${title}", width/2, 40); text("Hold Mouse to Shoot", width/2, height-20);
                }
                function windowResized() { resizeCanvas(windowWidth, windowHeight); }
            `
        };
    }
}

export async function POST(request: NextRequest) {
    let description = "";
    try {
        const json = await request.json();
        description = json.description || "";

        if (!description || typeof description !== 'string') {
            return NextResponse.json(
                { error: 'Oyun açıklaması gerekli' },
                { status: 400 }
            );
        }

        const apiKey = AI_CONFIG.apiKey;
        if (!apiKey) {
            throw new Error('API Key configuration missing');
        }

        // OpenRouter Integration
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Game Factory",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-lite-preview-02-05:free", // Safest free option on OR
                "messages": [
                    { "role": "system", "content": SYSTEM_PROMPT },
                    { "role": "user", "content": `Kullanıcının oyun fikri: ${description}` }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter/Gemini API Error: ${response.status} - ${errorText}`);
        }

        const completion = await response.json();
        const text = completion.choices[0]?.message?.content || "";

        if (!text) throw new Error("Empty response from AI");

        let gameData;
        try {
            const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            gameData = JSON.parse(cleanedText);
        } catch {
            return NextResponse.json({ error: 'AI yanıtı JSON formatında değil', raw: text }, { status: 500 });
        }

        return NextResponse.json({ success: true, gameData, isMock: false }); // Explicitly false
    } catch (error) {
        console.error('API Handover Failed - Switching to Mock:', error);

        // --- FALLBACK LOGIC ---
        const desc = description.toLowerCase();
        let genre: 'Platformer' | 'Shooter' | 'Collector' | 'Snake' | 'Pong' = 'Shooter';

        if (desc.includes('jump') || desc.includes('zıpla') || desc.includes('platform') || desc.includes('mario') || desc.includes('koş')) {
            genre = 'Platformer';
        } else if (desc.includes('collect') || desc.includes('topla') || desc.includes('yakala') || desc.includes('coin') || desc.includes('altın')) {
            genre = 'Collector';
        } else if (desc.includes('yılan') || desc.includes('snake') || desc.includes('büyü') || desc.includes('ye')) {
            genre = 'Snake';
        } else if (desc.includes('tenis') || desc.includes('pong') || desc.includes('masa') || desc.includes('raket')) {
            genre = 'Pong';
        } else if (desc.includes('savaş') || desc.includes('war') || desc.includes('uzay') || desc.includes('space') || desc.includes('shoot') || desc.includes('ateş')) {
            genre = 'Shooter';
        }

        const mockGame = generateMockGame(genre, description);

        return NextResponse.json({
            success: true,
            gameData: mockGame,
            isMock: true,
            note: "Using Dynamic Mock due to API Error"
        });
    }
}
