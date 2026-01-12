'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GamePlayer } from '../GamePlayer';

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

interface CustomizeStepProps {
    gameData: GameData;
    onBack: () => void;
    onNext: (modValues: Record<string, any>) => void;
    onEvolve: (instruction: string) => void;
    isEvolving: boolean;
    evolutionHistory?: Array<{
        id: string;
        timestamp: number;
        userCommand: string;
        aiResponse?: string;
        success: boolean;
    }>;
}

export function CustomizeStep({ gameData, onBack, onNext, onEvolve, isEvolving, evolutionHistory = [] }: CustomizeStepProps) {
    const [modValues, setModValues] = useState<Record<string, any>>({});
    const [evolveInput, setEvolveInput] = useState('');

    // Initialize mod values from schema
    useEffect(() => {
        if (gameData?.modSchema) {
            const initial: Record<string, any> = {};
            gameData.modSchema.forEach(item => {
                initial[item.key] = item.defaultValue; // Use default value from schema
            });
            setModValues(initial);
            console.log('✅ Mod Values Initialized:', initial);
        }
    }, [gameData?.gameCode]); // Only re-initialize when game changes

    // Send mod updates to iframe
    const handleModChange = (key: string, value: any) => {
        console.log('🔧 handleModChange called:', key, '=', value);

        setModValues(prev => {
            const updated = { ...prev, [key]: value };
            console.log('📊 Updated modValues:', updated);
            return updated;
        });

        const iframe = document.querySelector('iframe');
        console.log('🎯 Looking for iframe...', iframe ? 'Found!' : 'Not found');

        if (iframe?.contentWindow) {
            console.log('📤 Sending UPDATE_MODS to iframe:', { [key]: value });
            iframe.contentWindow.postMessage({
                type: 'UPDATE_MODS',
                payload: { [key]: value }
            }, '*');
        } else {
            console.warn('⚠️ Iframe or contentWindow not available');
        }
    };

    const handleEvolve = (e: React.FormEvent) => {
        e.preventDefault();
        if (evolveInput.trim()) {
            onEvolve(evolveInput.trim());
            setEvolveInput('');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex overflow-hidden relative"
        >
            {/* LEFT SIDEBAR: Mod Controls */}
            <div className="w-64 flex flex-col bg-black/80 backdrop-blur-xl border-r border-white/10 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-white">{gameData.gameName}</h2>
                        <p className="text-white/40 text-xs">{gameData.genre}</p>
                    </div>
                </div>

                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">
                    Customize
                </h3>

                {/* Mod Sliders */}
                <div className="flex-1 space-y-5 mb-6">
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
                                    className="w-full h-2 bg-white/10 rounded appearance-none cursor-pointer accent-purple-500"
                                />
                            )}

                            {item.type === 'color' && (
                                <input
                                    type="color"
                                    value={modValues[item.key] ?? item.defaultValue}
                                    onChange={(e) => handleModChange(item.key, e.target.value)}
                                    className="w-full h-10 bg-transparent border border-white/10 rounded cursor-pointer"
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

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-6 border-t border-white/10">
                    <button
                        onClick={onBack}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-xl transition-all text-sm"
                    >
                        ← Back
                    </button>
                    <button
                        onClick={() => onNext(modValues)}
                        className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all text-sm"
                    >
                        Continue →
                    </button>
                </div>
            </div>

            {/* CENTER: Game Preview (Smaller) */}
            <div className="flex-1 flex flex-col bg-black">
                <div className="flex-1 relative">
                    <GamePlayer
                        key={gameData.gameCode.slice(0, 50)}
                        gameData={gameData}
                        isInline={true}
                    />
                </div>
            </div>

            {/* RIGHT PANEL: Evolution History + Evolve Input */}
            <div className="w-80 flex flex-col bg-black/90 backdrop-blur-xl border-l border-white/10">
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white uppercase">Development History</h3>
                    <p className="text-xs text-white/40 mt-1">Track your evolution commands</p>
                </div>

                {/* History Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {evolutionHistory.length === 0 ? (
                        <div className="text-center text-white/30 text-sm py-8">
                            No evolution commands yet.<br />
                            Use the input below to evolve your game.
                        </div>
                    ) : (
                        evolutionHistory.map((step) => (
                            <div key={step.id} className="space-y-2">
                                {/* User Command */}
                                <div className="flex justify-end">
                                    <div className="bg-purple-600 rounded-lg px-3 py-2 max-w-[85%]">
                                        <div className="text-[10px] text-white/60 mb-1">You</div>
                                        <div className="text-sm text-white">{step.userCommand}</div>
                                    </div>
                                </div>

                                {/* AI Response */}
                                {step.aiResponse && (
                                    <div className="flex justify-start">
                                        <div className={`rounded-lg px-3 py-2 max-w-[85%] ${step.success ? 'bg-green-600/20 border border-green-500/30' : 'bg-red-600/20 border border-red-500/30'}`}>
                                            <div className="text-[10px] text-white/60 mb-1">AI</div>
                                            <div className="text-sm text-white/90">
                                                {step.success ? '✓ ' : '✗ '}{step.aiResponse}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Evolve Input */}
                <div className="p-4 border-t border-white/10">
                    <form onSubmit={handleEvolve} className="space-y-2">
                        <textarea
                            value={evolveInput}
                            onChange={(e) => setEvolveInput(e.target.value)}
                            placeholder="Describe changes... (e.g., 'Add enemies', 'Make it faster')"
                            disabled={isEvolving}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 outline-none focus:border-purple-500/50 disabled:opacity-50 text-sm resize-none"
                        />
                        <button
                            type="submit"
                            disabled={!evolveInput.trim() || isEvolving}
                            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                        >
                            {isEvolving ? 'Evolving...' : '✨ Evolve Game'}
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
