'use client';

import { useState, useEffect } from 'react';
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
    const [health, setHealth] = useState(100);
    const [energy, setEnergy] = useState(100);
    const [mETH, setmETH] = useState(0);

    useEffect(() => {
        setLogs([`INITIALIZING: ${gameData.gameName}`, `CLASS: ${gameData.genre}`, `VISUALS: ${gameData.visualStyle}`]);

        // Validate gameCode
        if (!gameData.gameCode || gameData.gameCode.trim() === '') {
            setHasError(true);
            setIsLoading(false);
            return;
        }

        // Simulate loading time for iframe initialization
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [gameData]);

    const handleAction = (action: string) => {
        const newLog = `> ${action} executed`;
        setLogs(prev => [newLog, ...prev].slice(0, 6));

        const outcome = Math.random();
        if (outcome > 0.7) {
            setmETH(prev => prev + 0.1);
            setLogs(prev => [`> REWARD: 0.1 mETH acquired`, ...prev]);
        } else if (outcome < 0.2) {
            setHealth(prev => Math.max(0, prev - 10));
            setLogs(prev => [`> WARNING: Hull integrity -10%`, ...prev]);
        }

        setEnergy(prev => Math.max(0, prev - 5));
    };

    const generateIframeSrcDoc = () => {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            overflow: hidden; 
            background: #000; 
        }
        canvas { 
            display: block; 
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
</head>
<body>
    <script type="module">
        // Import GameFactorySDK (inline for now, can be external later)
        ${getSDKBundle()}
        
        // Expose SDK globally for game code
        window.SDK = SDK;
        
        // Load Farcade compatibility shim for legacy code
        ${getFarcadeShim()}
    </script>
    <script>
        ${gameData.gameCode}
    </script>
</body>
</html>`;
    };

    // Bundle SDK for iframe injection
    const getSDKBundle = () => {
        return `
            // Simplified Game Factory SDK
            class GameFactorySDK {
                constructor() {
                    this.vars = {};
                    this.updateCallback = () => {};
                    this.score = 0;
                    this.isReady = false;
                    this.initMessageListener();
                }

                // 1. REGISTER REMIX VARIABLES
                registerRemix(defaultVars) {
                    this.vars = defaultVars;
                    this.sendMessage("REGISTER_SCHEMA", defaultVars);
                    console.log('[SDK] Remix registered:', defaultVars);
                }

                // 2. LISTEN FOR UPDATES
                onRemixUpdate(callback) {
                    this.updateCallback = callback;
                }

                // 3. GET VARIABLE
                getVar(key) {
                    return this.vars[key];
                }

                // 4. GET ALL VARIABLES
                getAllVars() {
                    return { ...this.vars };
                }

                // 5. SUBMIT SCORE
                submitScore(score) {
                    this.score = score;
                    this.sendMessage("SUBMIT_SCORE", { score });
                    console.log('[SDK] Score:', score);
                }

                // 5b. ADD TO SCORE
                addScore(value) {
                    this.score += value;
                    console.log('[SDK] Score added:', value, '-> Total:', this.score);
                    return this.score;
                }

                // 5c. SET SCORE
                setScore(value) {
                    this.score = value;
                    console.log('[SDK] Score set:', value);
                }

                // 5d. GET SCORE
                getScore() {
                    return this.score;
                }


                // 6. LIFECYCLE - Ready
                gameReady() {
                    this.isReady = true;
                    this.sendMessage("GAME_READY", true);
                    console.log('[SDK] Ready');
                }

                // 7. LIFECYCLE - Start
                gameStart() {
                    this.sendMessage("GAME_START", true);
                    console.log('[SDK] Started');
                }

                // 8. LIFECYCLE - End
                gameEnd(finalScore) {
                    const scoreToSubmit = finalScore ?? this.score;
                    this.sendMessage("GAME_END", { score: scoreToSubmit });
                    console.log('[SDK] Ended:', scoreToSubmit);
                }

                // INTERNAL: Send message
                sendMessage(type, payload) {
                    try {
                        window.parent.postMessage({ type, payload }, "*");
                    } catch (e) {
                        console.error('[SDK] Message failed:', e);
                    }
                }

                // INTERNAL: Listen for messages
                initMessageListener() {
                    window.addEventListener("message", (event) => {
                        const { type, payload } = event.data || {};

                        if (type === "UPDATE_REMIX") {
                            this.vars = { ...this.vars, ...payload };
                            this.updateCallback(this.vars);
                            console.log('[SDK] Updated:', payload);
                        } else if (type === "REQUEST_STATE") {
                            this.sendMessage("STATE_RESPONSE", {
                                vars: this.vars,
                                score: this.score,
                                isReady: this.isReady
                            });
                        } else if (type === "RESET_GAME") {
                            this.score = 0;
                            console.log('[SDK] Reset');
                        }
                    });
                }
            }

            // Create singleton
            const SDK = new GameFactorySDK();
            window.SDK = SDK;
        `;
    };

    const getFarcadeShim = () => {
        return `
            // Farcade compatibility shim (uses simplified SDK)
            window.farcade = {
                init: () => {
                    SDK.gameReady();
                    return Promise.resolve();
                },
                gameStart: () => {
                    SDK.gameStart();
                    return Promise.resolve();
                },
                gameEnd: (score) => {
                    SDK.gameEnd(score);
                    return Promise.resolve();
                },
                submitScore: (score) => {
                    SDK.submitScore(score);
                    return Promise.resolve(true);
                },
                getAssets: () => Promise.resolve([])
            };
        `;
    };

    return (
        <div className={`flex flex-col h-full w-full bg-[#050505] ${!isInline ? 'relative' : ''}`}>
            {/* GAME CANVAS - 16:9 Aspect Ratio with Mantle Neon Glow */}
            <div className={`relative flex-1 flex flex-col justify-center items-center p-4 ${isInline ? '' : 'p-8'}`}>

                {/* 16:9 Container with Neon Glow */}
                <div className="relative w-full max-w-6xl aspect-video">
                    {/* Mantle Neon Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 rounded-2xl blur-md opacity-50"></div>

                    {/* Game Container */}
                    <div className="relative bg-black rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl h-full">

                        {/* Loading State */}
                        {isLoading && (
                            <div className="absolute inset-0 z-30 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
                                <div className="relative">
                                    {/* Animated Rings */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="w-24 h-24 border-4 border-transparent border-t-purple-500 border-r-cyan-500 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-2 w-20 h-20 border-4 border-transparent border-b-purple-400 border-l-cyan-400 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-4 w-16 h-16 border-4 border-transparent border-t-purple-300 border-r-cyan-300 rounded-full"
                                    />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-white tracking-tight">Loading Game Engine</h3>
                                    <p className="text-sm text-purple-400 font-mono animate-pulse">Initializing Farcade SDK...</p>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {hasError && !isLoading && (
                            <div className="absolute inset-0 z-30 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center gap-6 p-8">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
                                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="text-center space-y-2 max-w-md">
                                    <h3 className="text-xl font-bold text-red-400">Game Code Missing</h3>
                                    <p className="text-sm text-gray-400 font-mono">
                                        The AI-generated game code is empty or invalid. Please try generating a new game.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Game Iframe */}
                        {!hasError && gameData.gameCode && (
                            <iframe
                                srcDoc={generateIframeSrcDoc()}
                                className="absolute inset-0 w-full h-full border-0"
                                title={`${gameData.gameName}`}
                                sandbox="allow-scripts"
                                onLoad={() => setIsLoading(false)}
                            />
                        )}

                        {/* Overlays (HP/Energy) - Only show when game is loaded */}
                        {!isLoading && !hasError && (
                            <div className="absolute top-4 left-6 right-6 flex justify-between items-start pointer-events-none z-10">
                                {/* Status Bars */}
                                <div className="flex flex-col gap-2 w-48">
                                    {/* HP */}
                                    <div className="relative h-2 bg-gray-900/50 backdrop-blur rounded overflow-hidden border border-white/10">
                                        <motion.div
                                            animate={{ width: `${health}%` }}
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-red-400"
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest pl-1">Hull Integrity {health}%</span>

                                    {/* Energy */}
                                    <div className="relative h-2 bg-gray-900/50 backdrop-blur rounded overflow-hidden border border-white/10">
                                        <motion.div
                                            animate={{ width: `${energy}%` }}
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-cyan-400"
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-cyan-500 uppercase tracking-widest pl-1">Energy Cells {energy}%</span>
                                </div>

                                {/* Currency / Score */}
                                <div className="flex items-center gap-3 bg-black/40 backdrop-blur border border-white/10 px-4 py-2 rounded-lg">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]"></div>
                                    <span className="font-mono text-lg font-bold text-gray-200">{mETH.toFixed(2)}</span>
                                    <span className="font-mono text-xs text-gray-500">mETH</span>
                                </div>
                            </div>
                        )}

                        {/* Close Button (If Modal) */}
                        {!isInline && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* CONTROLLER AREA (Below Canvas) */}
            <div className="bg-[#0f0f11] border-t border-white/5 p-6 z-20">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    {/* Logs Terminal */}
                    <div className="w-full md:w-64 h-24 bg-black/40 border border-white/5 rounded-lg p-3 font-mono text-[10px] text-green-400 overflow-hidden flex flex-col justify-end">
                        <AnimatePresence>
                            {logs.map((log, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="truncate">
                                    {log}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div className="animate-pulse">_</div>
                    </div>

                    {/* Controller Buttons */}
                    <div className="flex-1 flex justify-center gap-4">
                        {gameData.playerActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => handleAction(action)}
                                disabled={energy < 5 || health <= 0 || isLoading || hasError}
                                className="group relative w-32 h-16 bg-[#1a1a1d] hover:bg-[#252529] border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 active:border-purple-500/50 disabled:opacity-30 disabled:pointer-events-none"
                            >
                                <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="font-bold text-gray-200 text-sm">{action}</span>
                                <span className="text-[9px] font-mono text-gray-500 group-hover:text-purple-400 transition-colors uppercase tracking-wider">Button {['A', 'B', 'X'][i]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
