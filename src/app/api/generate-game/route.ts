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
  "gameCode": "TAM OYNANABILIR p5.js KODU - ZORUNLU SDK ENTEGRASYONU: Oyun kodunun EN BAŞINDA (setup fonksiyonunun içinde) MUTLAKA şu satırları ekle: SDK.registerRemix({ playerSpeed: 5, gravity: 0.8, jumpPower: 10 }); ve SDK.onRemixUpdate((vars) => { playerSpeed = vars.playerSpeed; gravity = vars.gravity; jumpPower = vars.jumpPower; }); Ardından SDK.gameReady(); ve SDK.gameStart(); çağır. Oyun bittiğinde SDK.gameEnd(score); kullan. Skor güncellemek için SDK.submitScore(score) veya SDK.addScore(10) kullan. ÖRNEK KOD YAPISI: let playerSpeed = 5; let gravity = 0.8; let score = 0; function setup() { createCanvas(windowWidth, windowHeight); SDK.registerRemix({ playerSpeed: 5, gravity: 0.8 }); SDK.onRemixUpdate((vars) => { playerSpeed = vars.playerSpeed; gravity = vars.gravity; }); SDK.gameReady(); SDK.gameStart(); } function draw() { background(0); /* oyun mantığı */ SDK.submitScore(score); } function keyPressed() { if (key === 'q') SDK.gameEnd(score); } - Sadece saf JavaScript kodu yaz, HTML tagları OLMASIN. Canvas boyutunu createCanvas(windowWidth, windowHeight) ile responsive yap."
}

KRİTİK: gameCode içinde SDK.registerRemix() çağrısı ZORUNLUDUR! Bu olmadan oyun çalışmaz. SADECE geçerli JSON döndür, başka hiçbir açıklama veya metin ekleme.`;

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

    // SDK ENTEGRASYON ŞABLONU
    // Bu fonksiyon her oyunun setup() kısmına enjekte edilecek
    const sdkSetup = (remixVars: string, updateLogic: string) => `
        // 1. SDK İLE KONUŞ: Varsayılan ayarları bildir
        if(window.SDK) {
            window.SDK.registerRemix({ ${remixVars} });
            
            // 2. DİNLE: Slider oynayınca burası çalışsın
            window.SDK.onRemixUpdate((vars) => {
                ${updateLogic}
            });
            
            // 3. HAZIRIM: Yükleme ekranını kaldır
            window.SDK.gameReady();
            window.SDK.gameStart();
        }
    `;

    // SKOR GÖNDERME YARDIMCISI
    const submitLogic = `if(window.SDK) window.SDK.submitScore(score);`;

    if (genre === 'Snake') {
        const remixVars = `speed: 15, snakeColor: '#00ff00'`;
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
                    
                    ${sdkSetup(remixVars, updateLogic)}
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
        const remixVars = `ballSpeed: 7, paddleHeight: 100, aiDifficulty: 0.08`;
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
                    
                    ${sdkSetup(remixVars, updateLogic)}
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
        const remixVars = `playerSpeed: 5, gravity: 0.6, jumpForce: 12, themeColor: '#00ccff'`;
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
                    
                    ${sdkSetup(remixVars, updateLogic)}
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
    let description = "";
    try {
        const json = await request.json();
        description = json.description || "";

        const apiKey = AI_CONFIG.apiKey;
        if (!apiKey) throw new Error('API Key configuration missing');

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Game Factory",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    { "role": "system", "content": SYSTEM_PROMPT },
                    { "role": "user", "content": `Kullanıcının oyun fikri: ${description}` }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
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

        return NextResponse.json({ success: true, gameData, isMock: false });
    } catch (error) {
        console.error('API Error:', error);

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
            note: "Using Dynamic Mock due to API Error"
        });
    }
}
