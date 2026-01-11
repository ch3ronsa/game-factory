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
  "gameCode": "TAM OYNANABILIR p5.js KODU. ÖNEMLI SDK KURALLARI: 1) Oyun başında 'await SDK.init()' çağır (async setup kullan). 2) Oyun başladığında 'await SDK.lifecycle.start()' çağır. 3) Oyun bittiğinde 'await SDK.lifecycle.finish(score)' çağır. 4) Skor göndermek için 'await SDK.score.send({ value: score })' kullan. 5) Sadece saf JavaScript kodu yaz, HTML tagları OLMASIN. 6) setup() ve draw() fonksiyonlarını mutlaka içermeli. 7) Canvas boyutunu createCanvas(windowWidth, windowHeight) ile responsive yap ve windowResized() fonksiyonunu ekle. SDK global olarak 'window.SDK' üzerinden erişilebilir."
}

ÖNEMLİ: SADECE geçerli JSON döndür, başka hiçbir açıklama veya metin ekleme. gameCode alanına p5.js CDN linki ekleme, sadece JavaScript kodu yaz.`;

// --- DYNAMIC MOCK GENERATOR (Preserved) ---
function generateMockGame(genre: 'Platformer' | 'Shooter' | 'Collector' | 'Snake' | 'Pong', description: string) {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    const words = description.split(' ').slice(0, 3).join(' ');
    const baseName = words.replace(/[^a-zA-Z0-9 ]/g, '') || "Retro";
    const generatedName = baseName.length > 2 ? baseName.charAt(0).toUpperCase() + baseName.slice(1) : `Game ${Math.floor(Math.random() * 100)}`;
    const commonSetup = `let score=0,themeColor,playerColor,gameState='PLAY';function setup(){createCanvas(windowWidth,windowHeight);themeColor=color(${r},${g},${b});playerColor=color(${255 - r},${255 - b},${255 - g});rectMode(CENTER);textAlign(CENTER);frameRate(60);}function windowResized(){resizeCanvas(windowWidth,windowHeight);}`;

    if (genre === 'Snake') {
        return { gameName: `${generatedName} Snake`, genre: "Classic Arcade", mechanics: ["Grid", "Growth"], levelStructure: "Grid", mantleAssets: ["Apple", "Potion"], difficulty: 5, visualStyle: "Pixelated", startingScene: "Hungry...", playerActions: ["Turn", "Speed"], gameCode: `${commonSetup}let s,scl=20,food;function setup(){createCanvas(windowWidth,windowHeight);themeColor=color(${r},${g},${b});playerColor=color(0,255,100);s=new Snake();pickLocation();frameRate(15);}function pickLocation(){let cols=floor(width/scl),rows=floor(height/scl);food=createVector(floor(random(cols)),floor(random(rows)));food.mult(scl);}function draw(){background(20);if(s.eat(food)){pickLocation();score+=10;}s.death();s.update();s.show();fill(255,0,100);rectMode(CORNER);rect(food.x,food.y,scl,scl);fill(255);textSize(24);textAlign(LEFT);text("Score: "+score,20,30);textAlign(CENTER);}function keyPressed(){if(keyCode===UP_ARROW)s.dir(0,-1);else if(keyCode===DOWN_ARROW)s.dir(0,1);else if(keyCode===RIGHT_ARROW)s.dir(1,0);else if(keyCode===LEFT_ARROW)s.dir(-1,0);}function Snake(){this.x=0;this.y=0;this.xspeed=1;this.yspeed=0;this.total=0;this.tail=[];this.eat=function(pos){let d=dist(this.x,this.y,pos.x,pos.y);if(d<1){this.total++;return true;}else{return false;}};this.dir=function(x,y){this.xspeed=x;this.yspeed=y;};this.death=function(){for(let i=0;i<this.tail.length;i++){let pos=this.tail[i];let d=dist(this.x,this.y,pos.x,pos.y);if(d<1){this.total=0;this.tail=[];score=0;}}};this.update=function(){if(this.total===this.tail.length){for(let i=0;i<this.tail.length-1;i++){this.tail[i]=this.tail[i+1];}}this.tail[this.total-1]=createVector(this.x,this.y);this.x=this.x+this.xspeed*scl;this.y=this.y+this.yspeed*scl;this.x=constrain(this.x,0,width-scl);this.y=constrain(this.y,0,height-scl);};this.show=function(){fill(playerColor);noStroke();rectMode(CORNER);for(let i=0;i<this.tail.length;i++){rect(this.tail[i].x,this.tail[i].y,scl,scl);}rect(this.x,this.y,scl,scl);}}` };
    } else if (genre === 'Pong') {
        return { gameName: `${generatedName} Pong`, genre: "Sports", mechanics: ["Paddle", "Ball"], levelStructure: "Court", mantleAssets: ["Ball", "Paddle"], difficulty: 3, visualStyle: "Neon", startingScene: "Match Point", playerActions: ["Up", "Down"], gameCode: `${commonSetup}let lp={x:30,y:0,w:20,h:100},rp={x:0,y:0,w:20,h:100},b={x:0,y:0,s:20,a:0,sp:7};function setup(){createCanvas(windowWidth,windowHeight);rp.x=width-30;rp.y=height/2;lp.y=height/2;b.x=width/2;b.y=height/2;b.a=random(TWO_PI);themeColor=color(${r},${g},${b});rectMode(CENTER);}function draw(){background(10);stroke(255,50);line(width/2,0,width/2,height);noStroke();fill(255);rect(lp.x,lp.y,lp.w,lp.h);fill(themeColor);rect(rp.x,rp.y,rp.w,rp.h);fill(255);ellipse(b.x,b.y,b.s);lp.y=mouseY;rp.y=lerp(rp.y,b.y,0.08);b.x+=cos(b.a)*b.sp;b.y+=sin(b.a)*b.sp;if(b.y<0||b.y>height)b.a*=-1;if(b.x-b.s/2<lp.x+lp.w/2&&b.y>lp.y-lp.h/2&&b.y<lp.y+lp.h/2){b.a=PI-b.a;b.sp+=0.5;}if(b.x+b.s/2>rp.x-rp.w/2&&b.y>rp.y-rp.h/2&&b.y<rp.y+rp.h/2)b.a=PI-b.a;if(b.x<0||b.x>width){b.x=width/2;b.y=height/2;b.sp=7;b.a=random(TWO_PI);}}` };
    } else if (genre === 'Platformer') {
        return { gameName: `${generatedName} Jump`, genre: "Platformer", mechanics: ["Jump", "Gravity"], levelStructure: "Vertical", mantleAssets: ["Boots", "Jetpack"], difficulty: 4, visualStyle: "Geometric", startingScene: "Climb...", playerActions: ["Jump", "Left", "Right"], gameCode: `${commonSetup}let p={x:200,y:300,w:30,h:30,vy:0,g:false},grav=0.6,jump=-12,plats=[];for(let i=0;i<6;i++)plats.push({x:i*150,y:100+i*80,w:100,h:20});function draw(){background(20);fill(themeColor);rect(width/2,height/2,width-40,height-40);fill(0,180);rect(width/2,height/2,width,height);fill(playerColor);rect(p.x,p.y,p.w,p.h);p.vy+=grav;p.y+=p.vy;if(keyIsDown(LEFT_ARROW))p.x-=5;if(keyIsDown(RIGHT_ARROW))p.x+=5;fill(255);p.g=false;for(let pl of plats){rect(pl.x+pl.w/2,pl.y+pl.h/2,pl.w,pl.h);if(p.x>pl.x&&p.x<pl.x+pl.w&&p.y+p.h/2>pl.y&&p.y+p.h/2<pl.y+pl.h+20&&p.vy>=0){p.y=pl.y-p.h/2;p.vy=0;p.g=true;}}if((keyIsDown(UP_ARROW)||mouseIsPressed)&&p.g)p.vy=jump;if(p.y>height){p.y=0;p.vy=0;score=0;}fill(255);textSize(20);text("${generatedName} Jump",width/2,40);}` };
    } else if (genre === 'Collector') {
        return { gameName: `${generatedName} Rush`, genre: "Collector", mechanics: ["Mouse", "Collect"], levelStructure: "Arena", mantleAssets: ["Magnet"], difficulty: 4, visualStyle: "Minimalist", startingScene: "Collect...", playerActions: ["Move"], gameCode: `${commonSetup}let c=[],px=0,py=0;function draw(){background(20);px=lerp(px,mouseX,0.1);py=lerp(py,mouseY,0.1);fill(playerColor);ellipse(px,py,40);if(frameCount%30==0)c.push({x:random(width),y:random(height),s:random(10,30),l:255});for(let i=c.length-1;i>=0;i--){let o=c[i];o.l-=2;fill(themeColor);stroke(255,o.l);ellipse(o.x,o.y,o.s);if(dist(px,py,o.x,o.y)<20+o.s/2){c.splice(i,1);score+=10;}else if(o.l<=0)c.splice(i,1);}noStroke();fill(255);textSize(24);text("Score: "+score,width/2,50);}` };
    } else {
        return { gameName: `${generatedName} Wars`, genre: "Shooter", mechanics: ["Shoot", "Dodge"], levelStructure: "Waves", mantleAssets: ["Laser"], difficulty: 6, visualStyle: "Neon", startingScene: "Defend...", playerActions: ["Shoot", "Move"], gameCode: `${commonSetup}let px,b=[],e=[];function setup(){createCanvas(windowWidth,windowHeight);themeColor=color(${r},${g},${b});rectMode(CENTER);textAlign(CENTER);px=width/2;}function draw(){background(10);fill(255);triangle(px,height-50,px-20,height-20,px+20,height-20);if(keyIsDown(LEFT_ARROW))px-=6;if(keyIsDown(RIGHT_ARROW))px+=6;if(mouseIsPressed&&frameCount%10==0)b.push({x:px,y:height-50});fill(themeColor);for(let i=b.length-1;i>=0;i--){b[i].y-=10;ellipse(b[i].x,b[i].y,10);if(b[i].y<0)b.splice(i,1);}if(frameCount%40==0)e.push({x:random(width),y:-20,s:random(20,50)});for(let i=e.length-1;i>=0;i--){e[i].y+=3;fill(200,50,50);rect(e[i].x,e[i].y,e[i].s,e[i].s);}fill(255);text("${generatedName} Wars",width/2,40);}` };
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
