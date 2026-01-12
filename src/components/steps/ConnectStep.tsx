'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';

interface ConnectionOption {
    id: string;
    label: string;
    description: string;
    icon: string;
    enabled: boolean;
    required?: boolean;
}

interface ConnectStepProps {
    gameName: string;
    onBack: () => void;
    onDeploy: (connections: Record<string, boolean>) => void;
    isDeploying: boolean;
    isConnected: boolean;
}

export function ConnectStep({ gameName, onBack, onDeploy, isDeploying, isConnected }: ConnectStepProps) {
    const [connections, setConnections] = useState<ConnectionOption[]>([
        {
            id: 'wallet',
            label: 'Wallet Integration',
            description: 'Connect to Mantle Network for transactions',
            icon: '👛',
            enabled: true,
            required: true,
        },
        {
            id: 'nft',
            label: 'NFT Minting',
            description: 'Mint your game as an on-chain NFT',
            icon: '🎨',
            enabled: true,
        },
        {
            id: 'leaderboard',
            label: 'Leaderboard',
            description: 'Track high scores on-chain',
            icon: '🏆',
            enabled: false,
        },
        {
            id: 'social',
            label: 'Social Sharing',
            description: 'Share to Twitter and Farcaster',
            icon: '📢',
            enabled: false,
        },
    ]);

    const toggleConnection = (id: string) => {
        setConnections(prev =>
            prev.map(c => c.id === id && !c.required ? { ...c, enabled: !c.enabled } : c)
        );
    };

    const handleDeploy = () => {
        const enabledConnections: Record<string, boolean> = {};
        connections.forEach(c => {
            enabledConnections[c.id] = c.enabled;
        });
        onDeploy(enabledConnections);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-black text-white mb-2">
                    Connect & Deploy
                </h1>
                <p className="text-white/50">
                    Choose integrations for <span className="text-purple-400">{gameName}</span>
                </p>
            </div>

            {/* Connection Options */}
            <div className="w-full max-w-lg space-y-3">
                {connections.map((option) => (
                    <motion.button
                        key={option.id}
                        onClick={() => toggleConnection(option.id)}
                        disabled={option.required}
                        className={`
                            w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left
                            ${option.enabled
                                ? 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                            }
                            ${option.required ? 'cursor-default' : 'cursor-pointer'}
                        `}
                        whileHover={{ scale: option.required ? 1 : 1.01 }}
                        whileTap={{ scale: option.required ? 1 : 0.99 }}
                    >
                        <div className="text-2xl">{option.icon}</div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{option.label}</span>
                                {option.required && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-white/50">Required</span>
                                )}
                            </div>
                            <p className="text-xs text-white/40">{option.description}</p>
                        </div>

                        <div className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                            ${option.enabled
                                ? 'border-purple-500 bg-purple-500'
                                : 'border-white/20'
                            }
                        `}>
                            {option.enabled && (
                                <span className="text-white text-xs">✓</span>
                            )}
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Wallet Status */}
            {!isConnected && (
                <div className="mt-6 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm">
                    ⚠️ Connect your wallet to deploy
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 w-full max-w-lg">
                <button
                    onClick={onBack}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-xl transition-all"
                >
                    ← Back
                </button>
                <button
                    onClick={handleDeploy}
                    disabled={!isConnected || isDeploying}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isDeploying ? 'Deploying...' : '🚀 Deploy to Mantle'}
                </button>
            </div>
        </motion.div>
    );
}
