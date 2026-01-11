# 🔍 DEBUG MODE - Beklenen Log Sıralaması

## Başarılı Bir SDK İletişiminde Görmeniz Gereken Loglar:

### 1️⃣ İlk Yükleme (Iframe Oluşturulurken)

```
🎧 DEBUG: React Event Listener Kuruldu (window.addEventListener)
  ↓
🎬 Iframe Yüklendi!
```

### 2️⃣ SDK Enjeksiyonu (Iframe İçinde)

```
🚀 DEBUG 1: ENJEKSİYON ANI - SDK Class Tanımlanıyor...
  ↓
✅ DEBUG 1: SDK Instance Oluşturuldu!
  ↓
🎧 SDK: Message Listener Kuruldu (iframe içinde)
  ↓
🎉 DEBUG 1 FINAL: window.SDK Atandı!
  ✅ registerRemix fonksiyonu mevcut mu? true
```

### 3️⃣ Oyun Kodu Yükleniyor

```
🎮 Oyun Kodu Yükleniyor...
  ↓
✅ Oyun Kodu Yüklendi
```

### 4️⃣ Oyun setup() Fonksiyonu Çalışıyor

**EĞER OYUN `SDK.registerRemix()` ÇAĞIRIYORSA:**

```
🎯 DEBUG 2: TETİKLEME ANI - registerRemix() ÇAĞRILDI!
  Gelen Değişkenler: {playerSpeed: 5, gravity: 0.8, ...}
  ↓
📮 DEBUG 3: POSTACI ANI - postMessage() ÇALIŞIYOR!
  📨 Type: REGISTER_SCHEMA
  📦 Payload: {playerSpeed: 5, gravity: 0.8, ...}
  🎯 Target: window.parent
  ↓
✅ postMessage Başarılı! Mesaj Gönderildi.
  ↓
✅ registerRemix Tamamlandı - Değişkenler Kaydedildi
```

### 5️⃣ React Tarafında Mesaj Yakalanıyor

```
🎯 DEBUG 4: KARŞILAMA ANI - React Listener Mesaj Yakaladı!
  📨 Type: REGISTER_SCHEMA
  📦 Payload: {playerSpeed: 5, gravity: 0.8, ...}
  ↓
✅ REGISTER_SCHEMA Alındı! Remix UI Oluşturuluyor...
```

### 6️⃣ Oyun Lifecycle Çağrıları (Opsiyonel)

```
🎮 gameReady() çağrıldı
  ↓
📮 DEBUG 3: POSTACI ANI - postMessage() ÇALIŞIYOR!
  📨 Type: GAME_READY
  ↓
🎯 DEBUG 4: KARŞILAMA ANI - React Listener Mesaj Yakaladı!
  📨 Type: GAME_READY
```

```
▶️ gameStart() çağrıldı
  ↓
📮 DEBUG 3: POSTACI ANI - postMessage() ÇALIŞIYOR!
  📨 Type: GAME_START
  ↓
🎯 DEBUG 4: KARŞILAMA ANI - React Listener Mesaj Yakaladı!
  📨 Type: GAME_START
```

---

## ❌ Sorun Tespiti - Logların Nerede Kesildiğine Bakın:

### Senaryo A: SDK Hiç Yüklenmedi
**Görülen:** Sadece React listener kuruldu, iframe yüklendi ama SDK logları yok
**Sorun:** Iframe srcDoc hatalı veya script çalışmadı
**Çözüm:** Tarayıcı console'da iframe içindeki hataları kontrol edin

### Senaryo B: SDK Yüklendi Ama registerRemix Çağrılmadı
**Görülen:** 
```
✅ DEBUG 1: SDK Instance Oluşturuldu!
🎮 Oyun Kodu Yükleniyor...
✅ Oyun Kodu Yüklendi
```
**Görülmeyen:** DEBUG 2 (TETİKLEME ANI)
**Sorun:** Oyun kodu `SDK.registerRemix()` çağırmıyor
**Çözüm:** AI prompt'u güçlendirin veya oyun koduna manuel ekleyin

### Senaryo C: registerRemix Çağrıldı Ama postMessage Çalışmadı
**Görülen:** DEBUG 2 var ama DEBUG 3 yok
**Sorun:** `sendMessage` fonksiyonu çalışmadı
**Çözüm:** SDK kodunda syntax hatası olabilir

### Senaryo D: postMessage Çalıştı Ama React Yakalamadı
**Görülen:** DEBUG 3 var ama DEBUG 4 yok
**Sorun:** 
- React event listener kurulmadı
- Origin/security sorunu
- Message format hatalı
**Çözüm:** React component'in mount olduğundan emin olun

### Senaryo E: React Yakaladı Ama UI Görünmüyor
**Görülen:** DEBUG 4 var, REGISTER_SCHEMA alındı
**Görülmeyen:** Ekranda Remix UI (sliderlar)
**Sorun:** 
- `setRemixVars` çalışmadı
- CSS/z-index sorunu
- Payload formatı yanlış
**Çözüm:** React DevTools ile state'i kontrol edin

---

## 🧪 Manuel Test Komutu

Console'da şunu çalıştırarak manuel mesaj gönderebilirsiniz:

```javascript
// Parent window'dan iframe'e mesaj gönder
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage({
    type: 'UPDATE_REMIX',
    payload: { playerSpeed: 10 }
}, '*');
```

```javascript
// Iframe içinden parent'a mesaj gönder (iframe console'unda)
window.parent.postMessage({
    type: 'REGISTER_SCHEMA',
    payload: { testVar: 123 }
}, '*');
```

---

## 📊 Renk Kodları

- 🔴 **Kırmızı (DEBUG 1)**: SDK Enjeksiyonu
- 🟡 **Sarı (DEBUG 2)**: registerRemix Tetikleme
- 🟣 **Mor (DEBUG 3)**: postMessage Gönderme
- 🟢 **Yeşil (DEBUG 4)**: React Mesaj Yakalama
- 🔵 **Mavi**: Genel bilgi logları
- ⚫ **Siyah/Beyaz**: Oyun kodu logları

---

## ✅ Başarı Göstergesi

Eğer **tüm 4 DEBUG noktasını** görüyorsanız ve Remix UI ekranda çıkmıyorsa:
1. React DevTools'u açın
2. `GamePlayer` component'ini bulun
3. `remixVars` state'ine bakın
4. Değer varsa ama UI yoksa → CSS/render sorunu
5. Değer yoksa → `setRemixVars` çalışmamış

---

**Not:** Simülasyon modunda (mock oyunlarda) `registerRemix` çağrılmaz çünkü mock generator'da bu kod yok. Gerçek AI üretimi test edin!
