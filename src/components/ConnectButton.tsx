'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { mantleMainnet } from '@/config/wagmi';
import { useState, useEffect } from 'react';

export function ConnectButton() {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();
    const [showDropdown, setShowDropdown] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="relative px-6 py-3 font-semibold text-white rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 opacity-50 cursor-not-allowed">
                <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                    Loading...
                </span>
            </button>
        );
    }

    // Check if connected to wrong network
    const isWrongNetwork = isConnected && chain?.id !== mantleMainnet.id;

    if (isWrongNetwork) {
        return (
            <button
                onClick={() => switchChain({ chainId: mantleMainnet.id })}
                className="relative px-6 py-3 font-semibold text-white rounded-xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105"
            >
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Switch to Mantle
                </span>
            </button>
        );
    }

    if (isConnected && address) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="relative px-6 py-3 font-semibold text-white rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105"
                >
                    <span className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-700/50">
                            <p className="text-xs text-gray-400">Connected to</p>
                            <p className="text-sm font-medium text-cyan-400">Mantle Mainnet</p>
                        </div>
                        <button
                            onClick={() => {
                                disconnect();
                                setShowDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Disconnect
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={isPending}
                className="relative px-6 py-3 font-semibold text-white rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                <span className="flex items-center gap-2">
                    {isPending ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Connecting...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Connect Wallet
                        </>
                    )}
                </span>
            </button>

            {showDropdown && !isPending && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-700/50">
                        <p className="text-sm font-medium text-white">Select Wallet</p>
                        <p className="text-xs text-gray-400">Connect to Mantle Network</p>
                    </div>
                    <div className="p-2">
                        {connectors.map((connector) => (
                            <button
                                key={connector.uid}
                                onClick={() => {
                                    connect({ connector });
                                    setShowDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left rounded-lg hover:bg-purple-500/10 transition-colors duration-200 flex items-center gap-3 group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-cyan-500/30 transition-colors">
                                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <span className="text-white font-medium">{connector.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
