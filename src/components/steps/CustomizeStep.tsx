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
    modSchema?: ModSchemaItem[];
    gameCode: string;
}

interface CustomizeStepProps {
    gameData: GameData;
    onBack: () => void;
    onNext: (modValues: Record<string, any>) => void;
    onEvolve: (instruction: string) => void;
    isEvolving: boolean;
}

export function CustomizeStep({ gameData, onBack, onNext, onEvolve, isEvolving }: CustomizeStepProps) {
    const [modValues, setModValues] = useState<Record<string, any>>({});
    const [evolveInput, setEvolveInput] = useState('');

    // Initialize mod values from schema
    useEffect(() => {
        if (gameData?.modSchema) {
            const initial: Record<string, any> = {};
            gameData.modSchema.forEach(item => {
                initial[item.key] = modValues[item.key] ?? item.defaultValue;
            });
            setModValues(initial);
        }
    }, [gameData]);

    // Send mod updates to iframe
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
            className="flex-1 flex gap-6 p-6 overflow-hidden"
        >
            {/* LEFT: Game Preview */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{gameData.gameName}</h2>
                        <p className="text-white/40 text-sm">{gameData.genre}</p>
                    </div>
                </div>

                <div className="flex-1 bg-black rounded-2xl overflow-hidden border border-white/10">
                    <GamePlayer
                        key={gameData.gameCode.slice(0, 50)}
                        gameData={gameData}
                        isInline={true}
                    />
                </div>

                {/* Evolve Input */}
                <form onSubmit={handleEvolve} className="mt-4 flex gap-2">
                    <input
                        type="text"
                        value={evolveInput}
                        onChange={(e) => setEvolveInput(e.target.value)}
                        placeholder="Describe changes... (e.g., 'Add enemies')"
                        disabled={isEvolving}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-purple-500/50 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!evolveInput.trim() || isEvolving}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        {isEvolving ? '...' : 'Evolve'}
                    </button>
                </form>
            </div>

            {/* RIGHT: Controls Panel */}
            <div className="w-80 flex flex-col bg-white/5 border border-white/10 rounded-2xl p-6 overflow-y-auto">
                <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-6">
                    Customize
                </h3>

                {/* Mod Sliders */}
                <div className="flex-1 space-y-6">
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
                <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                    <button
                        onClick={onBack}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-xl transition-all"
                    >
                        ← Back
                    </button>
                    <button
                        onClick={() => onNext(modValues)}
                        className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all"
                    >
                        Continue →
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
