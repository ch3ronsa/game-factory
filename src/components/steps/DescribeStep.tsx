'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface DescribeStepProps {
    onNext: (description: string) => void;
    isLoading: boolean;
    initialValue?: string;
}

const suggestions = [
    "Space shooter with power-ups",
    "Retro platformer game",
    "Snake game with multiplayer",
    "Pong with AI opponent",
    "Endless runner in cyberpunk city",
];

export function DescribeStep({ onNext, isLoading, initialValue = '' }: DescribeStepProps) {
    const [description, setDescription] = useState(initialValue);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim()) {
            onNext(description.trim());
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                    Describe Your Game
                </h1>
                <p className="text-white/50 max-w-md">
                    Type what you're envisioning to get started. Be as detailed or simple as you'd like!
                </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="w-full max-w-2xl">
                <div className="relative">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your game idea..."
                        disabled={isLoading}
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder-white/30 resize-none outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50"
                    />

                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!description.trim() || isLoading}
                    className="w-full mt-4 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? 'Creating...' : 'Build Game →'}
                </button>
            </form>

            {/* Suggestions */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
                <span className="text-white/30 text-xs mr-2">Try:</span>
                {suggestions.map((suggestion) => (
                    <button
                        key={suggestion}
                        onClick={() => setDescription(suggestion)}
                        disabled={isLoading}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-white/50 hover:text-white transition-all disabled:opacity-50"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}
