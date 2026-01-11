# Game Factory SDK - Kullanım Kılavuzu

## 📦 Kurulum

SDK otomatik olarak oyun iframe'ine yüklenir. Oyun kodunuzda `window.SDK` üzerinden erişebilirsiniz.

## 🚀 Hızlı Başlangıç

### Temel Kullanım

```javascript
// 1. SDK'yı başlat
async function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // SDK'yı initialize et
    await SDK.init();
    
    // Oyunu başlat
    await SDK.lifecycle.start();
}

// 2. Oyun döngüsü
function draw() {
    background(0);
    // Oyun mantığınız...
}

// 3. Oyun bittiğinde
async function gameOver() {
    const finalScore = 1000;
    await SDK.lifecycle.finish(finalScore);
    await SDK.score.send({ value: finalScore });
}
```

## 📚 API Referansı

### SDK.init()

SDK'yı başlatır. Oyunun başında bir kez çağrılmalıdır.

```javascript
await SDK.init({ 
    gameId: 'my-game',  // Opsiyonel
    debug: true         // Opsiyonel: Debug logları için
});
```

### SDK.lifecycle

Oyun yaşam döngüsünü yönetir.

#### start()
Oyunu başlatır.
```javascript
await SDK.lifecycle.start();
```

#### finish(score)
Oyunu bitirir ve final skorunu gönderir.
```javascript
await SDK.lifecycle.finish(1500);
```

#### pause()
Oyunu duraklatır.
```javascript
SDK.lifecycle.pause();
```

#### resume()
Oyunu devam ettirir.
```javascript
SDK.lifecycle.resume();
```

#### onUpdate(callback)
Oyun durumu değiştiğinde çağrılır.
```javascript
const unsubscribe = SDK.lifecycle.onUpdate((state) => {
    console.log('Game state:', state);
    // state.status: 'idle' | 'playing' | 'paused' | 'finished'
    // state.score: number
    // state.level: number
});

// Dinlemeyi durdurmak için:
unsubscribe();
```

### SDK.score

Skor yönetimi.

#### send(scoreData)
Skor gönderir.
```javascript
await SDK.score.send({ 
    value: 1000,
    metadata: { level: 5, combo: 10 }  // Opsiyonel
});
```

#### getCurrent()
Mevcut skoru döndürür.
```javascript
const currentScore = SDK.score.getCurrent();
```

#### getHigh()
En yüksek skoru döndürür (localStorage'dan).
```javascript
const highScore = SDK.score.getHigh();
```

#### reset()
Mevcut skoru sıfırlar.
```javascript
SDK.score.reset();
```

## 🔄 Farcade'den Geçiş

Eski Farcade SDK kodlarınız otomatik olarak çalışacaktır. Ancak yeni API'ye geçmenizi öneririz:

### Eski Kod (Farcade)
```javascript
await farcade.init();
await farcade.gameStart();
await farcade.submitScore(1000);
await farcade.gameEnd();
```

### Yeni Kod (Game Factory SDK)
```javascript
await SDK.init();
await SDK.lifecycle.start();
await SDK.score.send({ value: 1000 });
await SDK.lifecycle.finish(1000);
```

## 💡 Örnek Oyun

```javascript
let score = 0;
let gameActive = false;

async function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // SDK başlat
    await SDK.init({ debug: true });
    
    // State değişikliklerini dinle
    SDK.lifecycle.onUpdate((state) => {
        console.log('Game status:', state.status);
    });
}

async function mousePressed() {
    if (!gameActive) {
        // Oyunu başlat
        await SDK.lifecycle.start();
        gameActive = true;
        score = 0;
    } else {
        // Skor artır
        score += 10;
        await SDK.score.send({ value: score });
    }
}

async function keyPressed() {
    if (key === 'q' && gameActive) {
        // Oyunu bitir
        gameActive = false;
        await SDK.lifecycle.finish(score);
    }
}

function draw() {
    background(0);
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    
    if (gameActive) {
        text(`Score: ${score}`, width/2, height/2);
        text('Click to score, Q to quit', width/2, height/2 + 50);
    } else {
        text('Click to Start', width/2, height/2);
    }
}
```

## 🛡️ Hata Yönetimi

SDK otomatik olarak hataları yönetir ve parent window yanıt vermese bile oyun donmaz:

```javascript
try {
    await SDK.score.send({ value: score });
} catch (error) {
    console.log('Score submission failed, but game continues');
}
```

## 🔍 Debug Modu

Debug modunu aktif etmek için:

```javascript
await SDK.init({ debug: true });
```

Console'da şu logları göreceksiniz:
- `[GameFactorySDK]` - Ana SDK mesajları
- `[ScoreModule]` - Skor işlemleri
- `[LifecycleModule]` - Yaşam döngüsü olayları

## 📞 Parent Window İletişimi

SDK otomatik olarak parent window ile `postMessage` üzerinden iletişim kurar:

**Gönderilen Mesajlar:**
- `SDK_READY` - SDK hazır
- `GAME_START` - Oyun başladı
- `GAME_END` - Oyun bitti
- `SCORE_SUBMIT` - Skor gönderildi

**Alınan Mesajlar:**
- `REQUEST_STATE` - Durum bilgisi istendi
- `RESET_GAME` - Oyunu sıfırla

## 🎯 Best Practices

1. **Her zaman async/await kullanın**
   ```javascript
   await SDK.init();  // ✅ Doğru
   SDK.init();        // ❌ Yanlış
   ```

2. **Oyun başında init() çağırın**
   ```javascript
   async function setup() {
       await SDK.init();
       // Diğer setup kodu...
   }
   ```

3. **State değişikliklerini dinleyin**
   ```javascript
   SDK.lifecycle.onUpdate((state) => {
       if (state.status === 'finished') {
           // Oyun bitti, cleanup yap
       }
   });
   ```

4. **Hata durumlarını handle edin**
   ```javascript
   try {
       await SDK.score.send({ value: score });
   } catch (error) {
       // Fallback logic
   }
   ```
