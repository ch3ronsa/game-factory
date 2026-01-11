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

    // REMIX DEĞİŞKENLERİ (İşte eksik olan parça buydu!)
    const [remixVars, setRemixVars] = useState<Record<string, any>>({});

    const iframeRef = useRef<HTMLIFrameElement>(null);

    // 1. DİNLEYİCİ (LISTENER) - KABLOYU TAKIYORUZ
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Güvenlik kontrolü yapılabilir (origin check)

            const { type, payload } = event.data || {};

            if (!type) return;

            // LOG SİSTEMİ
            if (type.startsWith('SDK_') || type.startsWith('GAME_')) {
                const logMsg = `> ${type}: ${JSON.stringify(payload).slice(0, 30)}`;
                setLogs(prev => [logMsg, ...prev].slice(0, 6));
            }

            // --- KRİTİK BÖLGE: SDK'DAN GELEN VERİYİ YAKALA ---

            // A. Oyun "Benim ayarlarım bunlar" dediğinde:
            if (type === 'REGISTER_SCHEMA') {
                console.log('✅ UI: Remix Ayarları Alındı:', payload);
                setRemixVars(payload); // Slider'ları oluşturmak için state'i güncelle
            }

            // B. Oyun "Skor değişti" dediğinde:
            if (type === 'SUBMIT_SCORE' || type === 'GAME_END') {
                const newScore = payload.score !== undefined ? payload.score : payload;
                setScore(newScore);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // 2. GÖNDERİCİ (SENDER) - SLIDER OYNAYINCA OYUNA HABER VER
    const handleRemixChange = (key: string, value: any) => {
        // 1. UI'ı güncelle
        setRemixVars(prev => ({ ...prev, [key]: value }));

        // 2. Oyuna (Iframe'e) postMessage at
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'UPDATE_REMIX',
                payload: { [key]: value }
            }, '*');
        }
    };

    // Buton aksiyonları (Eski kodundan korundu)
    const handleAction = (action: string) => {
        const newLog = `> ${action} executed`;
        setLogs(prev => [newLog, ...prev].slice(0, 6));
        setEnergy(prev => Math.max(0, prev - 5));

        // Simüle edilmiş bir mETH kazancı
        if (Math.random() > 0.7) setmETH(prev => prev + 0.1);
    };

    // --- IFRAME İÇERİĞİ VE SDK ENJEKSİYONU ---
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
</head>
<body>
    <script>
        // --- INJECTED SIMPLE SDK ---
        class GameFactorySDK {
            constructor() {
                this.vars = {};
                this.updateCallback = () => {};
                this.score = 0;
                this.initMessageListener();
            }

            // OYUN BU FONKSİYONU ÇAĞIRINCA PARENT'A HABER VERİR
            registerRemix(defaultVars) {
                this.vars = defaultVars;
                // ÖNEMLİ: Parent (React) bunu 'REGISTER_SCHEMA' olarak bekliyor
                this.sendMessage("REGISTER_SCHEMA", defaultVars); 
            }

            onRemixUpdate(callback) {
                this.updateCallback = callback;
            }

            getVar(key) { return this.vars[key]; }
            
            submitScore(score) {
                this.score = score;
                this.sendMessage("SUBMIT_SCORE", { score });
            }

            // Convenience methods for Score
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

            gameReady() { this.sendMessage("GAME_READY", true); }
            gameStart() { this.sendMessage("GAME_START", true); }
            gameEnd(score) { this.sendMessage("GAME_END", { score: score || this.score }); }

            sendMessage(type, payload) {
                window.parent.postMessage({ type, payload }, "*");
            }

            initMessageListener() {
                window.addEventListener("message", (event) => {
                    const { type, payload } = event.data || {};
                    // REACT TARAFINDAN GELEN GÜNCELLEMEYİ YAKALA
                    if (type === "UPDATE_REMIX") {
                        this.vars = { ...this.vars, ...payload };
                        this.updateCallback(this.vars);
                    }
                });
            }
        }
        window.SDK = new GameFactorySDK();
    </script>
    <script>
        // Hata yakalama
        window.onerror = function(msg, url, line) {
            window.parent.postMessage({ type: 'SDK_ERROR', payload: msg }, '*');
        };
        
        ${gameData.gameCode}
    </script>
</body>
</html>`;
    };

    return (
        <div className={`flex flex-col h-full w-full bg-[#050505] ${!isInline ? 'relative' : ''}`}>

            {/* ÜST PANEL: REMIX KONTROLLERİ (YENİ EKLENDİ) */}
            {Object.keys(remixVars).length > 0 && (
                <div className="absolute top-4 left-4 z-40 bg-black/80 backdrop-blur border border-purple-500/30 rounded-xl p-4 w-64 shadow-2xl">
                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>⚛️</span> Remix Console
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(remixVars).map(([key, value]) => (
                            <div key={key} className="space-y-1">
                                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                                    <span>{key}</span>
                                    <span className="text-white">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                                </div>
                                {typeof value === 'number' ? (
                                    <input
                                        type="range"
                                        min={0}
                                        max={value > 10 ? 100 : 20} // Basit bir mantık, gerekirse iyileştirilebilir
                                        step={0.1}
                                        value={value}
                                        onChange={(e) => handleRemixChange(key, parseFloat(e.target.value))}
                                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                ) : typeof value === 'boolean' ? (
                                    <button
                                        onClick={() => handleRemixChange(key, !value)}
                                        className={`w-full py-1 text-xs rounded border ${value ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'}`}
                                    >
                                        {value ? 'ENABLED' : 'DISABLED'}
                                    </button>
                                ) : (
                                    <input
                                        type="color"
                                        value={value}
                                        onChange={(e) => handleRemixChange(key, e.target.value)}
                                        className="w-full h-6 rounded cursor-pointer"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* OYUN ALANI */}
            <div className={`relative flex-1 flex flex-col justify-center items-center p-4 ${isInline ? '' : 'p-8'}`}>
                <div className="relative w-full max-w-6xl aspect-video">
                    {/* Neon Glow & Container */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 rounded-2xl blur-xl opacity-75 animate-pulse"></div>

                    <div className="relative bg-black rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl h-full">
                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 z-30 bg-black/95 flex items-center justify-center">
                                <div className="text-purple-500 animate-pulse font-mono">INITIALIZING SDK BRIDGE...</div>
                            </div>
                        )}

                        {/* Iframe */}
                        {!hasError && gameData.gameCode && (
                            <iframe
                                ref={iframeRef}
                                srcDoc={generateIframeSrcDoc()}
                                className="absolute inset-0 w-full h-full border-0"
                                title={gameData.gameName}
                                sandbox="allow-scripts allow-same-origin"
                                onLoad={() => setIsLoading(false)}
                            />
                        )}

                        {/* SKOR TABELASI (SAĞ ÜST) */}
                        <div className="absolute top-4 right-6 bg-black/60 backdrop-blur border border-white/10 px-4 py-2 rounded-lg z-10">
                            <div className="text-xs text-gray-400 font-mono uppercase">Score</div>
                            <div className="text-2xl font-bold text-white font-mono">{score}</div>
                        </div>

                        {/* Kapat Butonu (Modal ise) */}
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
