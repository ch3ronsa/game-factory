'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { GAME_FACTORY_ADDRESS, GAME_FACTORY_ABI } from '@/config/wagmi';
import { GamePlayer } from './GamePlayer';

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

export function GameDescriptionForm() {
    const { isConnected } = useAccount();
    const [description, setDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

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

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!description.trim()) return;

        setIsGenerating(true);
        setError(null);
        setGameData(null);

        try {
            const response = await fetch('/api/generate-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Generation failed');

            setGameData(data.gameData);

            if (data.isMock) {
                toast("AI Servisi Meşgul: Simülasyon Modu Aktif", {
                    icon: '⚠️',
                    style: { background: '#333', color: '#fbbf24' }
                });
            } else {
                toast.success('System Online: AI Game Generated.');
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
            if (!isConnected) toast.error('Wallet link required.');
            return;
        }

        toast.loading('Deploying to Mantle...', { id: 'mint' });
        writeContract({
            address: GAME_FACTORY_ADDRESS,
            abi: GAME_FACTORY_ABI,
            functionName: 'mintGame',
            args: [gameData.gameName, JSON.stringify(gameData)],
        }, {
            onSuccess: () => {
                toast.dismiss('mint');
                toast.success('Transaction Signed');
            },
            onError: () => toast.dismiss('mint')
        });
    };

    const examplePrompts = [
        "Space Shooter with Token Rewards",
        "Cyberpunk RPG Adventure",
        "Physics Puzzle Platformer",
        "Survival Zombie Strategy",
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full font-sans text-slate-200">
            {/* LEFT COLUMN: DESIGN LAB (Bento Layout) */}
            <div className="lg:col-span-5 flex flex-col gap-6">

                {/* CARD 1: MAIN INPUT - Glassmorphism */}
                <div className="relative overflow-hidden rounded-3xl bg-neutral-900/60 border border-white/5 backdrop-blur-xl shadow-2xl group transition-all hover:border-white/10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-50"></div>

                    <div className="p-6 md:p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                </div>
                                Design Lab
                            </h2>
                            <span className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase text-purple-300 bg-purple-500/10 rounded-full border border-purple-500/20">v2.0.1 Beta</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Directive Input</label>
                            <div className="relative group/input">
                                <textarea
                                    id="userInput"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="// Initialize game parameters...\n// E.g. Pixel Art Platformer with double-jump mechanics..."
                                    className="w-full h-48 bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-mono text-gray-300 placeholder-gray-600 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all resize-none shadow-inner"
                                />
                                <div className="absolute bottom-4 right-4 text-[10px] text-gray-600 font-mono pointer-events-none">
                                    {description.length} chars
                                </div>
                            </div>
                        </div>

                        <button
                            id="submit-button"
                            onClick={(e) => handleSubmit(e)}
                            disabled={!description.trim() || isGenerating}
                            className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all shadow-lg flex items-center justify-center gap-3 relative overflow-hidden ${isGenerating
                                ? 'bg-neutral-800 text-gray-400 cursor-not-allowed border border-white/5'
                                : 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] hover:shadow-purple-500/20'
                                }`}
                        >
                            {isGenerating && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_2s_infinite]"></div>
                            )}
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                                    <span className="font-mono text-xs">PROCESSING...</span>
                                </>
                            ) : (
                                <>
                                    <span>INITIALIZE ENGINE</span>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* CARD 2: SUGGESTIONS GRID */}
                <div className="grid grid-cols-2 gap-4">
                    {examplePrompts.map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => setDescription(prompt)}
                            className="group relative p-4 bg-neutral-900/40 border border-white/5 hover:border-white/10 rounded-2xl text-left transition-all hover:bg-white/[0.03]"
                        >
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-3 text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors font-mono text-xs">
                                0{i + 1}
                            </div>
                            <p className="text-xs font-medium text-gray-400 group-hover:text-gray-200 line-clamp-2 leading-relaxed">
                                {prompt}
                            </p>
                        </button>
                    ))}
                </div>

                {/* CARD 3: SPECS (Conditional) */}
                {gameData && (
                    <div className="bg-neutral-900/60 border border-white/5 rounded-3xl p-6 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Technical Specs</h3>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase">Class</div>
                                <div className="text-sm font-bold text-white mt-0.5">{gameData.genre}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase">Style</div>
                                <div className="text-sm font-bold text-white mt-0.5">{gameData.visualStyle}</div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-[10px] text-gray-500 uppercase mb-1">Difficulty Matrix</div>
                                <div className="h-2 bg-black/50 rounded-full overflow-hidden flex">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className={`flex-1 border-r border-black/20 last:border-0 ${i < gameData.difficulty ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-transparent'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: LIVE ENGINE */}
            <div className={`lg:col-span-7 relative bg-[#050505] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col transition-all duration-700 ${isGenerating ? 'ring-2 ring-purple-500/50' : ''}`}>

                {/* Status Bar */}
                <div className="h-14 border-b border-white/5 bg-white/[0.02] flex items-center justify-center px-6">
                    <div className="flex items-center gap-3">
                        <div className={`relative w-2 h-2 rounded-full ${gameData ? 'bg-emerald-500' : (isGenerating ? 'bg-yellow-500 animate-pulse' : 'bg-red-500')}`}>
                            {gameData && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>}
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
                            {isGenerating ? 'PROCESSING STREAM...' : (gameData ? 'SYSTEM ONLINE' : 'STANDBY MODE')}
                        </span>
                    </div>

                    {gameData && (
                        <div className="absolute right-6 flex gap-2">
                            <button onClick={handleMint} disabled={isMinting} className="h-8 px-4 flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded text-[10px] font-bold text-purple-300 uppercase tracking-wide transition-colors">
                                {isMinting ? 'Deploying...' : 'Deploy to Chain'}
                            </button>
                            <button onClick={() => setIsPlaying(true)} className="h-8 w-8 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-300 hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Canvas Container */}
                <div id="responseArea" className="flex-1 relative bg-[url('/grid-dark.svg')] bg-[length:40px_40px] bg-center flex items-center justify-center">

                    {/* Visual Loading State */}
                    {isGenerating && (
                        <div id="loading-overlay" className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in duration-300">
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 border-t-2 border-purple-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-2 border-r-2 border-blue-500 rounded-full animate-spin [animation-duration:1.5s]"></div>
                                <div className="absolute inset-4 border-b-2 border-pink-500 rounded-full animate-spin [animation-duration:1s]"></div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white tracking-tight">Generating Neural Assets</h3>
                                <p className="text-sm text-purple-400 font-mono">Resolving physics engine...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div id="error-message" className="absolute inset-0 z-20 bg-red-950/20 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <p className="text-red-400 font-mono text-sm max-w-md">{error}</p>
                        </div>
                    )}

                    {gameData ? (
                        <GamePlayer gameData={gameData} isInline={true} />
                    ) : (
                        !isGenerating && (
                            <div className="text-center opacity-20 hover:opacity-100 transition-opacity duration-500 select-none">
                                <div className="text-6xl mb-4 font-thin tracking-tighter text-white">GAME<span className="font-bold text-purple-500">OS</span></div>
                                <p className="font-mono text-xs tracking-[0.3em] text-white">READY FOR INITIALIZATION</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* FULLSCREEN MODAL */}
            {isPlaying && gameData && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 lg:p-12 animate-in fade-in zoom-in-95 duration-200">
                    <div className="w-full h-full relative bg-[#050505] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5">
                        <GamePlayer gameData={gameData} isInline={false} onClose={() => setIsPlaying(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
