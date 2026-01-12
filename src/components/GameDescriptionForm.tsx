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
    const [showSidebar, setShowSidebar] = useState(false);
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
            toast.success('Deployed to Mantle Network!', { icon: '🚀' });
        }
    }, [isConfirmed]);

    // Initialize mod values from schema
    useEffect(() => {
        if (gameData?.modSchema) {
            const initialValues: Record<string, any> = {};
            gameData.modSchema.forEach(item => {
                initialValues[item.key] = modValues[item.key] !== undefined
                    ? modValues[item.key]
                    : item.defaultValue;
            });
            setModValues(initialValues);
            setShowSidebar(true); // Auto-show sidebar when game loads
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

            if (!response.ok || !data.success) {
                const errorMsg = data.error || `API Error: ${response.status}`;
                const errorDetails = data.errorDetails || data.message || 'Unknown error occurred';
                throw new Error(`${errorMsg} - ${errorDetails}`);
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
                toast("⚠️ Simulation Mode", { style: { background: '#333', color: '#fbbf24' } });
                if (data.error) setError(data.error);
            } else {
                toast.success('System Updated', { icon: '✨' });
            }

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMsg);
            toast.error('Evolution Failed');

            const errorMessage: ChatMessage = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: `Error: ${errorMsg.slice(0, 50)}...`,
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
            toast.error('Connect Wallet first');
            return;
        }

        const mintData = { ...gameData, currentModValues: modValues };
        toast.loading('Minting...', { id: 'mint' });
        writeContract({
            address: GAME_FACTORY_ADDRESS,
            abi: GAME_FACTORY_ABI,
            functionName: 'mintGame',
            args: [gameData.gameName, JSON.stringify(mintData)],
        }, {
            onSuccess: () => { toast.dismiss('mint'); toast.success('Mint Sent'); },
            onError: () => toast.dismiss('mint')
        });
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">

            {/* ===== GAME PREVIEW (Background Layer) ===== */}
            {gameData && (
                <div className="absolute inset-0 z-0">
                    <GamePlayer
                        key={gameData.gameCode.slice(0, 50)}
                        gameData={gameData}
                        isInline={true}
                    />
                </div>
            )}

            {/* ===== EMPTY STATE (Only when no game) ===== */}
            {!gameData && (
                <div className="flex-1 flex items-center justify-center z-10">
                    <div className="text-center select-none">
                        <h1 className="text-7xl md:text-9xl font-black text-white/10 tracking-tighter">
                            OHARA
                        </h1>
                        <p className="text-white/20 text-sm tracking-[0.5em] uppercase mt-2">
                            Game Studio
                        </p>
                    </div>
                </div>
            )}

            {/* ===== TOP BAR: Chat Messages ===== */}
            <div className="absolute top-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <AnimatePresence>
                    {chatHistory.slice(-1).map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`px-6 py-2 rounded-full text-sm backdrop-blur-md ${msg.role === 'user'
                                    ? 'bg-purple-500/30 text-purple-100 border border-purple-500/30'
                                    : msg.content.includes('Error')
                                        ? 'bg-red-500/30 text-red-100 border border-red-500/30'
                                        : 'bg-green-500/30 text-green-100 border border-green-500/30'
                                }`}
                        >
                            {msg.content}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* ===== ERROR BANNER ===== */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-16 left-4 right-4 z-50 bg-red-900/90 backdrop-blur border border-red-500/50 text-white p-4 rounded-xl flex items-center gap-3"
                    >
                        <span>⚠️</span>
                        <p className="flex-1 text-sm font-mono truncate">{error}</p>
                        <button onClick={() => setError(null)} className="opacity-60 hover:opacity-100">✕</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== LEFT SIDEBAR: Controls ===== */}
            <AnimatePresence>
                {gameData && showSidebar && (
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        className="absolute left-4 top-16 bottom-24 w-64 z-40 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Controls</span>
                            <button onClick={() => setShowSidebar(false)} className="text-white/30 hover:text-white text-xs">✕</button>
                        </div>

                        <div className="space-y-5">
                            {gameData.modSchema?.map((item) => (
                                <div key={item.key} className="space-y-2">
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>{item.label}</span>
                                        <span className="font-mono text-white/50">
                                            {typeof modValues[item.key] === 'number'
                                                ? modValues[item.key]?.toFixed(1)
                                                : String(modValues[item.key] ?? item.defaultValue)
                                            }
                                        </span>
                                    </div>

                                    {item.type === 'range' && (
                                        <input
                                            type="range"
                                            min={item.min}
                                            max={item.max}
                                            step={item.step}
                                            value={modValues[item.key] ?? item.defaultValue}
                                            onChange={(e) => handleModChange(item.key, parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-white/10 rounded appearance-none cursor-pointer accent-purple-500"
                                        />
                                    )}

                                    {item.type === 'color' && (
                                        <input
                                            type="color"
                                            value={modValues[item.key] ?? item.defaultValue}
                                            onChange={(e) => handleModChange(item.key, e.target.value)}
                                            className="w-full h-8 bg-transparent border border-white/10 rounded cursor-pointer"
                                        />
                                    )}

                                    {item.type === 'boolean' && (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={modValues[item.key] ?? false}
                                                onChange={(e) => handleModChange(item.key, e.target.checked)}
                                                className="w-4 h-4 rounded bg-transparent border-white/20 text-purple-500"
                                            />
                                            <span className="text-xs text-gray-500">Enabled</span>
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleMint}
                            disabled={!isConnected || isMinting || isConfirming}
                            className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
                        >
                            {isMinting ? 'Minting...' : '🚀 Deploy'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ===== SIDEBAR TOGGLE (When closed) ===== */}
            {gameData && !showSidebar && (
                <button
                    onClick={() => setShowSidebar(true)}
                    className="absolute left-4 top-16 z-40 bg-black/80 backdrop-blur border border-white/10 p-3 rounded-xl text-white/50 hover:text-white transition-all"
                >
                    ⚙️
                </button>
            )}

            {/* ===== BOTTOM INPUT BAR ===== */}
            <div className="relative z-50 p-4 bg-gradient-to-t from-black via-black/95 to-transparent mt-auto">
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2">

                        {/* Loading / Icon */}
                        <div className="pl-3 text-white/30">
                            {isGenerating ? (
                                <div className="w-5 h-5 border-2 border-t-white border-white/20 rounded-full animate-spin"></div>
                            ) : (
                                <span>✨</span>
                            )}
                        </div>

                        {/* Input */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={gameData ? "Describe changes..." : "Describe your game..."}
                            className="flex-1 bg-transparent text-white placeholder-white/30 px-2 py-3 outline-none"
                            disabled={isGenerating}
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={!input.trim() || isGenerating}
                            className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            {gameData ? 'Evolve' : 'Build'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
