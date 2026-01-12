'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameData {
    gameName: string;
    genre: string;
    mechanics: string[];
    levelStructure: string;
    mantleAssets: string[];
    difficulty: number;
    visualStyle: string;
    startingScene: string;
    playerActions: string[];
    gameCode: string;
}

interface GamePlayerProps {
    gameData: GameData;
    onClose?: () => void;
    isInline?: boolean;
}

export function GamePlayer({ gameData, onClose, isInline = false }: GamePlayerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    // OYUN DURUMLARI (STATE)
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(100);
    const [energy, setEnergy] = useState(100);
    const [mETH, setmETH] = useState(0);

    // MOD VARIABLES
    const [modVars, setModVars] = useState<Record<string, any>>({});

    const iframeRef = useRef<HTMLIFrameElement>(null);

    // 🔍 DEBUG NOKTA 4: KARŞILAMA ANI - React tarafındaki listener
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const { type, payload } = event.data || {};

            if (!type) return;

            // 🟢 DEBUG LOG 4: Mesaj yakalandı!
            console.log(
                '%c🎯 DEBUG 4: KARŞILAMA ANI - React Listener Mesaj Yakaladı!',
                'background: #00ff00; color: #000; font-size: 14px; font-weight: bold; padding: 4px 8px;',
                '\n📨 Type:', type,
                '\n📦 Payload:', payload
            );

            // LOG SİSTEMİ
            if (type.startsWith('SDK_') || type.startsWith('GAME_') || type.startsWith('REGISTER_')) {
                const logMsg = `> ${type}: ${JSON.stringify(payload).slice(0, 30)}`;
                setLogs(prev => [logMsg, ...prev].slice(0, 6));
            }

            // A. Oyun "Benim ayarlarım bunlar" dediğinde:
            if (type === 'REGISTER_SCHEMA') {
                console.log('✅ UI: Mod Settings Received:', payload);
                setModVars(payload); // Slider'ları oluşturmak için state'i güncelle
            }

            // B. Oyun "Skor değişti" dediğinde:
            if (type === 'SUBMIT_SCORE' || type === 'GAME_END') {
                const newScore = payload.score !== undefined ? payload.score : payload;
                setScore(newScore);
            }
        };

        console.log(
            '%c🎧 DEBUG: React Event Listener Kuruldu (window.addEventListener)',
            'background: #0088ff; color: #fff; font-size: 12px; padding: 4px;'
        );

        window.addEventListener('message', handleMessage);
        return () => {
            console.log('%c🔌 DEBUG: Event Listener Kaldırıldı', 'color: #888;');
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    // 2. SENDER - SLIDER CHANGED, NOTIFY GAME
    const handleModChange = (key: string, value: any) => {
        // 1. Update UI
        setModVars(prev => ({ ...prev, [key]: value }));

        // 2. Send postMessage to game (Iframe)
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'UPDATE_MODS',
                payload: { [key]: value }
            }, '*');
        }
    };

    // --- IFRAME İÇERİĞİ VE SDK ENJEKSİYONU (DEBUG MODLU) ---
    const generateIframeSrcDoc = () => {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; overflow: hidden; background: #000; }
        canvas { display: block; }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/bmoren/p5.collide2D/p5.collide2d.min.js"></script>
</head>
<body>
    <script>
        // 🔍 DEBUG NOKTA 1: ENJEKSİYON ANI
        console.log(
            '%c🚀 DEBUG 1: ENJEKSİYON ANI - SDK Class Tanımlanıyor...',
            'background: #ff0000; color: #fff; font-size: 14px; font-weight: bold; padding: 4px 8px;'
        );

        class GameFactorySDK {
            constructor() {
                this.vars = {};
                this.updateCallback = () => {};
                this.score = 0;
                this.initMessageListener();
                
                // 🟢 DEBUG LOG 1: SDK başarıyla oluşturuldu
                console.log(
                    '%c✅ DEBUG 1: SDK Instance Oluşturuldu!',
                    'background: #00ff00; color: #000; font-size: 14px; font-weight: bold; padding: 4px 8px;',
                    'this:', this
                );
            }

            // 🔍 DEBUG NOKTA 2: TETİKLEME ANI
            // GAME CALLS THIS TO NOTIFY PARENT
            registerMods(defaultVars) {
                this.vars = defaultVars;
                // IMPORTANT: Parent (React) expects this as 'REGISTER_SCHEMA'
                this.sendMessage("REGISTER_SCHEMA", defaultVars); 
            }

            onModUpdate(callback) {
                this.updateCallback = callback;
            }

            getVar(key) { return this.vars[key]; }
            
            submitScore(score) {
                this.score = score;
                this.sendMessage("SUBMIT_SCORE", { score });
            }

            addScore(value) {
                this.score += value;
                this.sendMessage("SUBMIT_SCORE", { score: this.score });
                return this.score;
            }
            
            setScore(value) {
                this.score = value;
                this.sendMessage("SUBMIT_SCORE", { score: this.score });
            }
            
            getScore() { return this.score; }

            gameReady() { 
                console.log('%c🎮 gameReady() çağrıldı', 'color: #0f0;');
                this.sendMessage("GAME_READY", true); 
            }
            
            gameStart() { 
                console.log('%c▶️ gameStart() çağrıldı', 'color: #0f0;');
                this.sendMessage("GAME_START", true); 
            }
            
            gameEnd(score) { 
                console.log('%c⏹️ gameEnd() çağrıldı, score:', score, 'color: #f00;');
                this.sendMessage("GAME_END", { score: score || this.score }); 
            }

            // 🔍 DEBUG NOKTA 3: POSTACI ANI
            sendMessage(type, payload) {
                console.log(
                    '%c📮 DEBUG 3: POSTACI ANI - postMessage() ÇALIŞIYOR!',
                    'background: #ff00ff; color: #fff; font-size: 14px; font-weight: bold; padding: 4px 8px;',
                    '\\n📨 Type:', type,
                    '\\n📦 Payload:', payload,
                    '\\n🎯 Target: window.parent'
                );
                
                try {
                    window.parent.postMessage({ type, payload }, "*");
                    console.log(
                        '%c✅ postMessage Başarılı! Mesaj Gönderildi.',
                        'background: #00ff00; color: #000; font-weight: bold; padding: 4px;'
                    );
                } catch (error) {
                    console.error(
                        '%c❌ postMessage HATASI!',
                        'background: #ff0000; color: #fff; font-weight: bold; padding: 4px;',
                        error
                    );
                }
            }

            initMessageListener() {
                console.log('%c🎧 SDK: Message Listener Kuruldu (iframe içinde)', 'color: #0ff;');
                window.addEventListener("message", (event) => {
                    const { type, payload } = event.data || {};
                    // REACT SENDS UPDATE_MODS
                    if (type === "UPDATE_MODS") {
                        this.vars = { ...this.vars, ...payload };
                        this.updateCallback(this.vars);
                    }
                });
            }
        }
        
        window.SDK = new GameFactorySDK();
        
        // 🟢 FINAL CHECK: SDK window'a atandı mı?
        console.log(
            '%c🎉 DEBUG 1 FINAL: window.SDK Atandı!',
            'background: #00ff00; color: #000; font-size: 16px; font-weight: bold; padding: 8px;',
            'window.SDK:', window.SDK,
            '\\n✅ registerRemix fonksiyonu mevcut mu?', typeof window.SDK.registerMods === 'function'
        );
    </script>
    <script>
        // Hata yakalama
        window.onerror = function(msg, url, line) {
            console.error('%c💥 OYUN HATASI!', 'background: #f00; color: #fff; padding: 4px;', msg, 'Line:', line);
            window.parent.postMessage({ type: 'SDK_ERROR', payload: msg }, '*');
        };
        
        console.log('%c🎮 Oyun Kodu Yükleniyor...', 'background: #333; color: #fff; padding: 4px;');
        ${gameData.gameCode}
        console.log('%c✅ Oyun Kodu Yüklendi', 'background: #0f0; color: #000; padding: 4px;');
    </script>
</body>
</html>`;
    };

    return (
        <div className={`flex flex-col h-full w-full bg-[#050505] ${!isInline ? 'relative' : ''}`}>

            {/* DEBUG PANEL */}
            <div className="absolute top-4 right-4 z-50 bg-red-900/90 border-2 border-red-500 rounded-lg p-3 text-white text-xs font-mono max-w-xs">
                <div className="font-bold text-yellow-300 mb-2">🔍 DEBUG MODE ACTIVE</div>
                <div className="text-[10px] space-y-1">
                    <div>✅ Mod Vars: {Object.keys(modVars).length}</div>
                    <div>📊 Score: {score}</div>
                    <div className="text-yellow-200 mt-2">Console'u açın! (F12)</div>
                </div>
            </div>


            {/* OYUN ALANI */}
            <div className={`relative flex-1 flex flex-col justify-center items-center p-4 ${isInline ? '' : 'p-8'}`}>
                <div className="relative w-full max-w-6xl aspect-video">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 rounded-2xl blur-xl opacity-75 animate-pulse"></div>

                    <div className="relative bg-black rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl h-full">
                        {isLoading && (
                            <div className="absolute inset-0 z-30 bg-black/95 flex items-center justify-center">
                                <div className="text-purple-500 animate-pulse font-mono">INITIALIZING SDK BRIDGE...</div>
                            </div>
                        )}

                        {!hasError && gameData.gameCode && (
                            <iframe
                                ref={iframeRef}
                                srcDoc={generateIframeSrcDoc()}
                                className="absolute inset-0 w-full h-full border-0"
                                title={gameData.gameName}
                                sandbox="allow-scripts allow-same-origin"
                                onLoad={() => {
                                    setIsLoading(false);
                                    console.log('%c🎬 Iframe Yüklendi!', 'background: #0f0; color: #000; font-size: 14px; padding: 4px;');
                                }}
                            />
                        )}

                        <div className="absolute top-4 right-6 bg-black/60 backdrop-blur border border-white/10 px-4 py-2 rounded-lg z-10">
                            <div className="text-xs text-gray-400 font-mono uppercase">Score</div>
                            <div className="text-2xl font-bold text-white font-mono">{score}</div>
                        </div>

                        {!isInline && (
                            <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-lg">
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* LOG PANELİ */}
            <div className="bg-[#0f0f11] border-t border-white/5 p-4 z-20">
                <div className="flex gap-4 items-center">
                    <div className="w-full h-24 bg-black/40 border border-white/5 rounded-lg p-3 font-mono text-[10px] text-green-400 overflow-hidden">
                        <AnimatePresence>
                            {logs.map((log, i) => (
                                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{log}</motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
