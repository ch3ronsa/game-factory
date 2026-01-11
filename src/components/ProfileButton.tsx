'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { mantleMainnet } from '@/config/wagmi';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function ProfileButton() {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();
    const [showDropdown, setShowDropdown] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showDropdown && !target.closest('.profile-dropdown-container')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    if (!mounted) {
        return (
            <div className="relative px-6 py-3 font-semibold text-white rounded-xl bg-gray-200 opacity-50 cursor-not-allowed">
                <span className="flex items-center gap-2">
                    Loading...
                </span>
            </div>
        );
    }

    // Check if connected to wrong network
    const isWrongNetwork = isConnected && chain?.id !== mantleMainnet.id;

    if (isWrongNetwork) {
        return (
            <button
                onClick={() => switchChain({ chainId: mantleMainnet.id })}
                className="relative px-6 py-3 font-bold text-white rounded-2xl bg-red-500 hover:bg-red-400 transition-all shadow-[0_4px_0_0_#b91c1c] active:shadow-none active:translate-y-[4px]"
            >
                <span className="flex items-center gap-2 uppercase tracking-wide">
                    WRONG NETWORK
                </span>
            </button>
        );
    }

    if (isConnected && address) {
        // Generate a simple avatar based on address
        const getAvatarColor = (addr: string) => {
            const colors = [
                'from-purple-500 to-pink-500',
                'from-cyan-500 to-blue-500',
                'from-green-500 to-emerald-500',
                'from-orange-500 to-red-500',
                'from-indigo-500 to-purple-500',
            ];
            const index = parseInt(addr.slice(2, 4), 16) % colors.length;
            return colors[index];
        };

        return (
            <div className="relative profile-dropdown-container">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 px-2 py-1 hover:bg-gray-100 rounded-2xl transition-all duration-300 group ring-2 ring-transparent hover:ring-gray-200"
                >
                    {/* Avatar */}
                    <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(address)} flex items-center justify-center shadow-sm`}>
                        <span className="text-white font-bold text-sm">
                            {address.slice(2, 4).toUpperCase()}
                        </span>
                    </div>

                    {/* Address and status */}
                    <div className="hidden sm:block text-left mr-2">
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                            {address.slice(0, 6)}...
                        </span>
                    </div>
                </button>

                {showDropdown && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border-2 border-gray-200 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Profile Header */}
                        <div className="p-6 bg-blue-50 border-b-2 border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarColor(address)} flex items-center justify-center shadow-lg border-4 border-white`}>
                                    <span className="text-white font-bold text-2xl">
                                        {address.slice(2, 4).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-800">Oyuncu</p>
                                    <p className="text-sm font-mono font-medium text-slate-500">
                                        {address.slice(0, 8)}...{address.slice(-6)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2 space-y-1">
                            <Link href="/profil" onClick={() => setShowDropdown(false)}>
                                <button className="w-full px-4 py-3 text-left rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-3 font-bold text-slate-600 hover:text-blue-500 group border-2 border-transparent hover:border-blue-200">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center">
                                        👤
                                    </div>
                                    Profilim
                                </button>
                            </Link>

                            <Link href="/profil" onClick={() => setShowDropdown(false)}>
                                <button className="w-full px-4 py-3 text-left rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-3 font-bold text-slate-600 hover:text-green-500 group border-2 border-transparent hover:border-green-200">
                                    <div className="w-10 h-10 rounded-xl bg-green-100 text-green-500 flex items-center justify-center">
                                        🎮
                                    </div>
                                    Oyunlarım
                                </button>
                            </Link>
                        </div>

                        {/* Disconnect Button */}
                        <div className="p-2 border-t-2 border-gray-100">
                            <button
                                onClick={() => {
                                    disconnect();
                                    setShowDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left rounded-xl hover:bg-red-50 text-red-500 hover:text-red-600 font-bold transition-colors flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                    🚪
                                </div>
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Not Connected State - Duolingo Style Button
    return (
        <div className="relative profile-dropdown-container">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={isPending}
                className="relative px-8 py-3 font-bold text-white tracking-wider uppercase rounded-2xl bg-[#1CB0F6] hover:bg-[#1899d6] transition-all shadow-[0_4px_0_0_#1899d6] active:shadow-none active:translate-y-[4px] disabled:opacity-50"
            >
                {isPending ? 'BAĞLANIYOR...' : 'CÜZDAN BAĞLA'}
            </button>

            {showDropdown && !isPending && (
                <div className="absolute right-0 mt-4 w-72 bg-white rounded-2xl border-2 border-gray-200 shadow-xl z-50 overflow-hidden">
                    <div className="px-6 py-4 border-b-2 border-gray-100 bg-gray-50">
                        <p className="text-base font-extrabold text-slate-700 uppercase tracking-wide">Cüzdan Seç</p>
                    </div>
                    <div className="p-2 space-y-1">
                        {connectors.map((connector) => (
                            <button
                                key={connector.uid}
                                onClick={() => {
                                    connect({ connector });
                                    setShowDropdown(false);
                                }}
                                className="w-full px-4 py-4 text-left rounded-xl hover:bg-gray-100 transition-all border-2 border-gray-100 hover:border-blue-200 flex items-center gap-4 group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    🔌
                                </div>
                                <span className="font-bold text-slate-700 group-hover:text-blue-500">{connector.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
