'use client';

import { useEffect, useState } from 'react';

export default function SDKTest() {
    const [status, setStatus] = useState('🔄 Loading SDK...');
    const [remixVars, setRemixVars] = useState<Record<string, any>>({});
    const [score, setScore] = useState(0);
    const [messages, setMessages] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    useEffect(() => {
        const testSDK = () => {
            try {
                // Create a mock SDK for testing (since real SDK is in iframe)
                const mockSDK = {
                    vars: {} as Record<string, any>,
                    updateCallback: (vars: Record<string, any>) => { },
                    score: 0,

                    registerRemix(defaultVars: Record<string, any>) {
                        this.vars = defaultVars;
                        addLog(`✅ registerRemix called with: ${JSON.stringify(defaultVars)}`);
                        setRemixVars(defaultVars);
                    },

                    onRemixUpdate(callback: (vars: Record<string, any>) => void) {
                        this.updateCallback = callback;
                        addLog('✅ onRemixUpdate listener registered');
                    },

                    getVar(key: string) {
                        addLog(`📖 getVar('${key}') = ${this.vars[key]}`);
                        return this.vars[key];
                    },

                    getAllVars() {
                        addLog(`📖 getAllVars() = ${JSON.stringify(this.vars)}`);
                        return this.vars;
                    },

                    submitScore(score: number) {
                        this.score = score;
                        addLog(`🎯 submitScore(${score})`);
                        setScore(score);
                    },

                    gameReady() {
                        addLog('🎮 gameReady() called');
                    },

                    gameStart() {
                        addLog('▶️ gameStart() called');
                    },

                    gameEnd(finalScore?: number) {
                        addLog(`⏹️ gameEnd(${finalScore ?? this.score})`);
                    }
                };

                // Test sequence
                addLog('🚀 Starting SDK test...');

                // 1. Register remix variables
                mockSDK.registerRemix({
                    playerSpeed: 5,
                    gravity: 0.5,
                    backgroundColor: '#000000',
                    enableParticles: true
                });

                // 2. Setup update listener
                mockSDK.onRemixUpdate((vars) => {
                    addLog(`🔄 Remix updated: ${JSON.stringify(vars)}`);
                    setRemixVars(vars);
                });

                // 3. Game lifecycle
                mockSDK.gameReady();
                mockSDK.gameStart();

                // 4. Submit some scores
                setTimeout(() => {
                    mockSDK.submitScore(100);
                }, 1000);

                setTimeout(() => {
                    mockSDK.submitScore(250);
                }, 2000);

                setTimeout(() => {
                    mockSDK.submitScore(500);
                }, 3000);

                setTimeout(() => {
                    mockSDK.gameEnd(500);
                }, 4000);

                // 5. Test variable access
                setTimeout(() => {
                    mockSDK.getVar('playerSpeed');
                    mockSDK.getAllVars();
                }, 5000);

                setStatus('✅ SDK Test Running');

                // Simulate platform sending updates
                setTimeout(() => {
                    addLog('🌐 Simulating platform update...');
                    const newVars = {
                        playerSpeed: 8,
                        gravity: 1.2,
                        backgroundColor: '#ff0000',
                        enableParticles: false
                    };
                    mockSDK.vars = { ...mockSDK.vars, ...newVars };
                    mockSDK.updateCallback(mockSDK.vars);
                }, 6000);

            } catch (err) {
                setStatus('❌ Error: ' + String(err));
                addLog('❌ Error: ' + String(err));
            }
        };

        testSDK();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="border border-purple-500/30 rounded-lg p-6 bg-purple-500/5">
                    <h1 className="text-3xl font-bold text-purple-400 mb-2">SDK Test Suite</h1>
                    <p className="text-gray-400">Testing simplified Game Factory SDK</p>
                </div>

                {/* Status */}
                <div className="border border-white/10 rounded-lg p-6 bg-white/5">
                    <h2 className="text-xl font-bold mb-4 text-cyan-400">Status</h2>
                    <p className="text-2xl">{status}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="border border-white/10 rounded-lg p-6 bg-white/5">
                        <h3 className="text-sm text-gray-400 mb-2">Current Score</h3>
                        <p className="text-3xl font-bold text-yellow-400">{score}</p>
                    </div>
                    <div className="border border-white/10 rounded-lg p-6 bg-white/5">
                        <h3 className="text-sm text-gray-400 mb-2">Remix Variables</h3>
                        <p className="text-xl font-bold text-green-400">{Object.keys(remixVars).length}</p>
                    </div>
                </div>

                {/* Remix Variables */}
                <div className="border border-white/10 rounded-lg p-6 bg-white/5">
                    <h2 className="text-xl font-bold mb-4 text-green-400">Remix Variables</h2>
                    <div className="space-y-2">
                        {Object.entries(remixVars).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center p-3 bg-black/30 rounded">
                                <span className="text-gray-300">{key}</span>
                                <span className="text-purple-400 font-bold">
                                    {typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Event Log */}
                <div className="border border-white/10 rounded-lg p-6 bg-white/5">
                    <h2 className="text-xl font-bold mb-4 text-blue-400">Event Log</h2>
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                        {messages.map((msg, i) => (
                            <div key={i} className="text-sm text-gray-300 font-mono p-2 bg-black/30 rounded">
                                {msg}
                            </div>
                        ))}
                    </div>
                </div>

                {/* API Reference */}
                <div className="border border-white/10 rounded-lg p-6 bg-white/5">
                    <h2 className="text-xl font-bold mb-4 text-orange-400">API Methods Tested</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            'registerRemix()',
                            'onRemixUpdate()',
                            'getVar()',
                            'getAllVars()',
                            'submitScore()',
                            'gameReady()',
                            'gameStart()',
                            'gameEnd()'
                        ].map(method => (
                            <div key={method} className="p-3 bg-black/30 rounded text-sm">
                                <code className="text-green-400">{method}</code>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Instructions */}
                <div className="border border-yellow-500/30 rounded-lg p-6 bg-yellow-500/5">
                    <h2 className="text-xl font-bold mb-4 text-yellow-400">ℹ️ Instructions</h2>
                    <ul className="space-y-2 text-gray-300">
                        <li>• Watch the event log for SDK method calls</li>
                        <li>• Score will increment automatically (100 → 250 → 500)</li>
                        <li>• Remix variables will update after 6 seconds (simulating platform update)</li>
                        <li>• Open browser console for detailed logs</li>
                        <li>• Real SDK runs in game iframe, this is a mock test</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
