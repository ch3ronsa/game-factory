'use client';

import { useState, useEffect, useRef } from 'react';
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

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function GameDescriptionForm() {
    const { isConnected } = useAccount();
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [modValues, setModValues] = useState<Record<string, any>>({});
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [showConfigPanel, setShowConfigPanel] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

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
        if (!input.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };
        setChatHistory(prev => [...prev, userMessage]);

        setIsGenerating(true);
        setError(null);
        const currentInput = input;
        setInput('');

        try {
            const response = await fetch('/api/generate-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: currentInput,
                    previousGameData: gameData || null
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `API Error: ${response.status}`);
            }

            setGameData(data.gameData);

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: gameData
                    ? `Updated: ${data.gameData.gameName}`
                    : `Created: ${data.gameData.gameName}`,
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, assistantMessage]);

            if (data.isMock) {
                toast("⚠️ Simulation Mode Active", {
                    style: { background: '#333', color: '#fbbf24' }
                });
            } else {
                toast.success(gameData ? '✨ Game Evolved!' : '🎮 Game Created!');
            }

            // Show error details if present
            if (data.error) {
                setError(`API Issue: ${data.error}`);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMsg);
            toast.error('Failed to generate game');

            const errorMessage: ChatMessage = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: `Error: ${errorMsg}`,
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsGenerating(false);
            inputRef.current?.focus();
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
        <div className="h-full w-full relative bg-[#050505] overflow-hidden">
            {/* CHAT HISTORY OVERLAY */}
            <AnimatePresence>
                {chatHistory.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full px-4"
                    >
                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 max-h-32 overflow-y-auto space-y-2">
                            {chatHistory.slice(-3).map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`px-4 py-2 rounded-xl text-sm max-w-[80%] ${msg.role === 'user'
                                            ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                                            : 'bg-blue-500/20 text-blue-200 border border-blue-500/30'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ERROR BANNER */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-4"
                    >
                        <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                            <span className="text-red-400 text-xl">⚠️</span>
                            <div className="flex-1">
                                <p className="text-red-200 text-sm font-mono">{error}</p>
                                <p className="text-red-300/60 text-xs mt-1">Check server console for details</p>
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-400 hover:text-red-300"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT AREA */}
            <div className="h-full w-full flex items-center justify-center">
                {!gameData ? (
                    // EMPTY STATE
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6 px-4"
                    >
                        <div className="text-8xl font-thin tracking-tighter text-white/20">
                            GAME<span className="font-bold text-purple-500/40">OS</span>
                        </div>
                        <p className="text-gray-500 font-mono text-sm tracking-wider">
                            Describe your game below
                        </p>
                    </motion.div>
                ) : (
                    // GAME PREVIEW
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full"
                    >
                        <GamePlayer
                            key={gameData.gameCode.slice(0, 100)}
                            gameData={gameData}
                            isInline={true}
                        />
                    </motion.div>
                )}
            </div>

            {/* CONFIGURE PANEL (Sliding from right) */}
            <AnimatePresence>
                {showConfigPanel && gameData?.modSchema && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute right-0 top-0 h-full w-80 bg-black/90 backdrop-blur-xl border-l border-white/10 shadow-2xl z-40 overflow-y-auto"
                    >
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Configure</h3>
                                <button
                                    onClick={() => setShowConfigPanel(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                {gameData.modSchema.map((item) => (
                                    <div key={item.key} className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400 font-medium">{item.label}</span>
                                            <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">
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
                                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                            />
                                        )}

                                        {item.type === 'color' && (
                                            <input
                                                type="color"
                                                value={modValues[item.key] || item.defaultValue}
                                                onChange={(e) => handleModChange(item.key, e.target.value)}
                                                className="w-full h-10 rounded-lg cursor-pointer"
                                            />
                                        )}

                                        {item.type === 'boolean' && (
                                            <button
                                                onClick={() => handleModChange(item.key, !modValues[item.key])}
                                                className={`w-full py-2 rounded-lg border font-medium text-sm transition-all ${modValues[item.key]
                                                        ? 'bg-green-500/20 border-green-500 text-green-400'
                                                        : 'bg-red-500/20 border-red-500 text-red-400'
                                                    }`}
                                            >
                                                {modValues[item.key] ? '✓ ON' : '✗ OFF'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleMint}
                                disabled={!isConnected || isMinting || isConfirming}
                                className="w-full py-3 bg-white hover:bg-gray-100 disabled:bg-gray-700 text-black disabled:text-gray-400 rounded-lg font-bold transition-all"
                            >
                                {isMinting || isConfirming ? 'Deploying...' : '🚀 Deploy to Chain'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BOTTOM INPUT BAR (Ohara Style) */}
            <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        {/* Configure Button (only show when game exists) */}
                        {gameData?.modSchema && gameData.modSchema.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setShowConfigPanel(!showConfigPanel)}
                                className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
                                title="Configure parameters"
                            >
                                ⚙️
                            </button>
                        )}

                        {/* Input Field */}
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={gameData ? "Evolve your game..." : "Describe your dream game..."}
                                disabled={isGenerating}
                                className="w-full px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50"
                            />
                            {isGenerating && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        {/* Build Button */}
                        <button
                            type="submit"
                            disabled={!input.trim() || isGenerating}
                            className="px-8 py-4 bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-400 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
                        >
                            {isGenerating ? '...' : gameData ? '✨ Evolve' : '🚀 Build'}
                        </button>
                    </form>

                    {/* Hint Text */}
                    <p className="text-center text-gray-600 text-xs mt-3 font-mono">
                        Press Enter to {gameData ? 'evolve' : 'build'} • {gameData?.modSchema?.length || 0} parameters available
                    </p>
                </div>
            </div>
        </div>
    );
}
