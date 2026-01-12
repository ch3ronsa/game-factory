'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { GAME_FACTORY_ADDRESS, GAME_FACTORY_ABI } from '@/config/wagmi';
import { GamePlayer } from './GamePlayer';

interface ModSchemaItem {
    key: string;
    type: 'range' | 'color' | 'boolean';
    label: string;
    defaultValue: number | string | boolean;
    min?: number;
    max?: number;
    step?: number;
}

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
    modSchema?: ModSchemaItem[];
    gameCode: string;
}

export function GameDescriptionForm() {
    const { isConnected } = useAccount();
    const [description, setDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [modValues, setModValues] = useState<Record<string, any>>({});

    const {
        data: hash,
        isPending: isMinting,
        writeContract,
        error: mintError
    } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (mintError) {
            toast.error(`Mint Error: ${mintError.message.slice(0, 50)}...`);
        }
    }, [mintError]);

    useEffect(() => {
        if (isConfirmed) {
            toast.success('Game deployed to Mantle Network!', { icon: '🚀' });
        }
    }, [isConfirmed]);

    // Initialize mod values from schema
    useEffect(() => {
        if (gameData?.modSchema) {
            const initialValues: Record<string, any> = {};
            gameData.modSchema.forEach(item => {
                initialValues[item.key] = item.defaultValue;
            });
            setModValues(initialValues);
        }
    }, [gameData]);

    // Handle mod value changes and send to GamePlayer
    const handleModChange = (key: string, value: any) => {
        setModValues(prev => ({ ...prev, [key]: value }));

        // Send UPDATE_MODS to GamePlayer iframe
        const iframe = document.querySelector('iframe');
        if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'UPDATE_MODS',
                payload: { [key]: value }
            }, '*');
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!description.trim()) return;

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    previousGameData: gameData || null
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Generation failed');

            setGameData(data.gameData);
            setDescription('');

            if (data.isMock) {
                toast("AI Service Busy: Simulation Mode Active", {
                    icon: '⚠️',
                    style: { background: '#333', color: '#fbbf24' }
                });
            } else {
                const isRevision = gameData !== null;
                toast.success(isRevision ? 'Game Evolved!' : 'Engine Initialized!');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'System Failure');
            toast.error('AI Processing Failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleMint = () => {
        if (!gameData || !isConnected) {
            toast.error('Please connect wallet first');
            return;
        }

        const mintData = {
            ...gameData,
            currentModValues: modValues
        };

        toast.loading('Preparing transaction...', { id: 'mint' });
        writeContract({
            address: GAME_FACTORY_ADDRESS,
            abi: GAME_FACTORY_ABI,
            functionName: 'mintGame',
            args: [gameData.gameName, JSON.stringify(mintData)],
        }, {
            onSuccess: () => {
                toast.dismiss('mint');
                toast.success('Transaction Signed');
            },
            onError: () => toast.dismiss('mint')
        });
    };

    return (
        <div className="h-full w-full relative bg-[#050505]">
            <AnimatePresence mode="wait">
                {!gameData ? (
                    // ========== CENTERED INITIAL STATE ==========
                    <motion.div
                        key="centered"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="h-full flex items-center justify-center p-8"
                    >
                        <div className="w-full max-w-2xl">
                            {/* Design Lab Card */}
                            <div className="relative overflow-hidden rounded-3xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-50"></div>

                                <div className="p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                                            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                            </div>
                                            Live Studio
                                        </h2>
                                        <span className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase text-purple-300 bg-purple-500/10 rounded-full border border-purple-500/20">v3.0 Beta</span>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Game Directive</label>
                                        <div className="relative">
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="// Describe your game vision...\n// E.g. Cyberpunk platformer with time-manipulation mechanics"
                                                className="w-full h-56 bg-black/40 border border-white/5 rounded-2xl p-6 text-sm font-mono text-gray-300 placeholder-gray-600 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all resize-none shadow-inner"
                                            />
                                            <div className="absolute bottom-4 right-4 text-[10px] text-gray-600 font-mono pointer-events-none">
                                                {description.length} chars
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={!description.trim() || isGenerating}
                                        className={`w-full py-5 rounded-xl font-bold tracking-wide transition-all shadow-lg flex items-center justify-center gap-3 relative overflow-hidden ${isGenerating
                                            ? 'bg-neutral-800 text-gray-400 cursor-not-allowed border border-white/5'
                                            : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] hover:shadow-purple-500/20'
                                            }`}
                                    >
                                        {isGenerating && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_2s_infinite]"></div>
                                        )}
                                        {isGenerating ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                                                <span className="font-mono text-sm">INITIALIZING...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-lg">🚀 INITIALIZE ENGINE</span>
                                            </>
                                        )}
                                    </button>

                                    {error && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <p className="text-red-400 font-mono text-sm">{error}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    // ========== STUDIO LAYOUT (30% / 70%) ==========
                    <motion.div
                        key="studio"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="h-full grid grid-cols-12 gap-4 p-4"
                    >
                        {/* LEFT SIDEBAR: Studio Controls (30%) */}
                        <motion.div
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                            className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full"
                        >
                            {/* Chat Input */}
                            <div className="bg-neutral-900/80 backdrop-blur-xl rounded-2xl p-4 border border-white/5 shadow-xl">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider font-bold">
                                        <span>💬</span>
                                        <span>Evolution Prompt</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                                            placeholder="How should we evolve the game?"
                                            className="flex-1 bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        />
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!description.trim() || isGenerating}
                                            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all hover:scale-105 active:scale-95"
                                        >
                                            {isGenerating ? '⏳' : '✨'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Mod Controls */}
                            {gameData?.modSchema && gameData.modSchema.length > 0 && (
                                <div className="flex-1 bg-neutral-900/80 backdrop-blur-xl rounded-2xl p-4 border border-white/5 shadow-xl overflow-y-auto">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                            <span>⚙️</span>
                                            <span>Live Parameters</span>
                                        </h3>
                                        <span className="px-2 py-1 text-[9px] font-mono tracking-widest uppercase text-green-300 bg-green-500/10 rounded-full border border-green-500/20">Active</span>
                                    </div>

                                    <div className="space-y-4">
                                        {gameData.modSchema.map((item) => (
                                            <div key={item.key} className="space-y-2 p-3 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-400 font-medium">{item.label}</span>
                                                    <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded text-[10px]">
                                                        {typeof modValues[item.key] === 'number'
                                                            ? modValues[item.key].toFixed(1)
                                                            : String(modValues[item.key])}
                                                    </span>
                                                </div>

                                                {item.type === 'range' && (
                                                    <input
                                                        type="range"
                                                        min={item.min}
                                                        max={item.max}
                                                        step={item.step}
                                                        value={modValues[item.key] || item.defaultValue}
                                                        onChange={(e) => handleModChange(item.key, parseFloat(e.target.value))}
                                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-colors"
                                                    />
                                                )}

                                                {item.type === 'color' && (
                                                    <input
                                                        type="color"
                                                        value={modValues[item.key] || item.defaultValue}
                                                        onChange={(e) => handleModChange(item.key, e.target.value)}
                                                        className="w-full h-10 rounded-lg cursor-pointer border border-white/10"
                                                    />
                                                )}

                                                {item.type === 'boolean' && (
                                                    <button
                                                        onClick={() => handleModChange(item.key, !modValues[item.key])}
                                                        className={`w-full py-2 rounded-lg border font-medium text-sm transition-all ${modValues[item.key]
                                                                ? 'bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30'
                                                                : 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30'
                                                            }`}
                                                    >
                                                        {modValues[item.key] ? '✓ ENABLED' : '✗ DISABLED'}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Deploy Button */}
                            <button
                                onClick={handleMint}
                                disabled={!isConnected || isMinting || isConfirming}
                                className="w-full py-4 bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-400 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                            >
                                {isMinting || isConfirming ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full animate-spin"></div>
                                        <span>Deploying...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🚀</span>
                                        <span>Deploy to Chain</span>
                                    </>
                                )}
                            </button>
                        </motion.div>

                        {/* RIGHT PANEL: Live Preview (70%) */}
                        <motion.div
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className="col-span-12 lg:col-span-8 h-full"
                        >
                            <div className="h-full bg-[#050505] rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
                                <GamePlayer
                                    key={gameData.gameCode.slice(0, 100)}
                                    gameData={gameData}
                                    isInline={true}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
