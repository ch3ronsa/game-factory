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
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'event'>('intro');
    const [logs, setLogs] = useState<string[]>([]);
    const [currentScene, setCurrentScene] = useState(gameData.startingScene);
    const [health, setHealth] = useState(100);
    const [energy, setEnergy] = useState(100);
    const [mETH, setmETH] = useState(0);

    useEffect(() => {
        setLogs([`INITIALIZING: ${gameData.gameName}`, `CLASS: ${gameData.genre}`, `VISUALS: ${gameData.visualStyle}`]);
    }, [gameData]);

    const handleAction = (action: string) => {
        const newLog = `> ${action} executed`;
        setLogs(prev => [newLog, ...prev].slice(0, 6));

        // Random outcome simulations for visual feedback
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

    return (
        <div className={`flex flex-col h-full w-full bg-[#050505] ${!isInline ? 'relative' : ''}`}>
            {/* GAME CANVAS */}
            <div className={`relative flex-1 bg-black overflow-hidden flex flex-col justify-center items-center ${isInline ? 'rounded-b-2xl' : ''}`}>

                {/* 1. The Rendering Layer (Iframe) */}
                {gameData.gameCode ? (
                    <iframe
                        srcDoc={`
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
                                <style>
                                    body { margin: 0; padding: 0; overflow: hidden; background: #000; }
                                    canvas { display: block; }
                                </style>
                            </head>
                            <body>
                                <script>
                                    ${gameData.gameCode}
                                </script>
                            </body>
                            </html>
                        `}
                        className="absolute inset-0 w-full h-full border-0 opacity-80 mix-blend-screen"
                        title={`${gameData.gameName}`}
                        sandbox="allow-scripts"
                    />
                ) : (
                    <div className="text-center opacity-30">
                        <div className="w-16 h-16 border border-white/20 rounded mb-4 animate-spin mx-auto"></div>
                        <p className="font-mono text-xs tracking-widest text-white">RENDER ENGINE OFFLINE</p>
                    </div>
                )}

                {/* 2. Sleek Overlays (HP/Energy) */}
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

                {/* Close Button (If Modal) */}
                {!isInline && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
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
                                disabled={energy < 5 || health <= 0}
                                className="group relative w-32 h-16 bg-[#1a1a1d] hover:bg-[#252529] border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 active:border-purple-500/50 disabled:opacity-30 disabled:pointer-events-none"
                            >
                                {/* Button Top Glow */}
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
