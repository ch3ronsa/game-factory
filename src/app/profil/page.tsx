'use client';

import { ProfileButton } from '@/components/ProfileButton';
import Link from 'next/link';
import { useAccount } from 'wagmi';

export default function ProfilPage() {
    const { address, isConnected } = useAccount();

    return (
        <div className="min-h-screen relative overflow-hidden bg-white">
            {/* Header */}
            <header className="relative z-20 bg-white border-b-2 border-gray-100">
                <nav className="flex items-center justify-between px-6 py-4 md:px-12 max-w-7xl mx-auto">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 bg-[#58CC02] rounded-xl flex items-center justify-center shadow-[0_4px_0_0_#46a302] group-hover:translate-y-[2px] group-hover:shadow-[0_2px_0_0_#46a302] transition-all">
                            <span className="text-2xl text-white">☺</span>
                        </div>
                        <span className="text-2xl font-extrabold text-[#58CC02] tracking-wide">Game Factory</span>
                    </Link>

                    {/* Profile/Connect Button */}
                    <ProfileButton />
                </nav>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-4 md:px-8 pb-20">
                <section className="max-w-6xl mx-auto pt-8 md:pt-12">
                    {/* Back Button */}
                    <Link
                        href="/"
                        className="mb-8 inline-flex items-center gap-3 text-gray-400 hover:text-gray-600 transition-colors group font-bold uppercase tracking-wider text-sm"
                    >
                        <div className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center group-hover:border-gray-300 group-hover:bg-gray-50 transition-all">
                            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                            </svg>
                        </div>
                        Ana Sayfa
                    </Link>

                    {isConnected && address ? (
                        <div className="animate-in slide-in-from-bottom-4 duration-500">
                            {/* Profile Header */}
                            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 md:p-12 mb-8 shadow-sm flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full bg-[#1CB0F6] border-4 border-[#1CB0F6] flex items-center justify-center shadow-[0_6px_0_0_#1899d6]">
                                        <span className="text-5xl font-extrabold text-white">
                                            {address.slice(2, 4).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#58CC02] rounded-full border-4 border-white"></div>
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-4xl font-extrabold text-slate-700 mb-2">Hoşgeldin, Oyuncu!</h2>
                                    <p className="text-slate-400 font-mono text-lg bg-slate-50 px-4 py-2 rounded-xl inline-block border-2 border-slate-100">
                                        {address}
                                    </p>
                                </div>

                                <Link href="/create">
                                    <button className="px-8 py-4 bg-[#58CC02] hover:bg-[#46a302] text-white font-extrabold text-lg rounded-2xl transition-all shadow-[0_4px_0_0_#46a302] active:shadow-none active:translate-y-[4px] uppercase tracking-wide">
                                        Yeni Oyun Oluştur
                                    </button>
                                </Link>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 flex items-center gap-4 hover:border-yellow-400 transition-colors cursor-default">
                                    <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-[0_4px_0_0_#e5a500]">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-bold uppercase text-xs tracking-wider">Oyunlar</p>
                                        <p className="text-3xl font-extrabold text-slate-700">0</p>
                                    </div>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 flex items-center gap-4 hover:border-[#1CB0F6] transition-colors cursor-default">
                                    <div className="w-16 h-16 bg-[#1CB0F6] rounded-2xl flex items-center justify-center shadow-[0_4px_0_0_#1899d6]">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-bold uppercase text-xs tracking-wider">Oynanış</p>
                                        <p className="text-3xl font-extrabold text-slate-700">0</p>
                                    </div>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 flex items-center gap-4 hover:border-purple-400 transition-colors cursor-default">
                                    <div className="w-16 h-16 bg-purple-400 rounded-2xl flex items-center justify-center shadow-[0_4px_0_0_#9333ea]">
                                        <span className="text-2xl font-extrabold text-white">Ξ</span>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 font-bold uppercase text-xs tracking-wider">mETH Kazancı</p>
                                        <p className="text-3xl font-extrabold text-slate-700">0.00</p>
                                    </div>
                                </div>
                            </div>

                            {/* My Games Section */}
                            <div className="space-y-6">
                                <h3 className="text-2xl font-extrabold text-slate-700 ml-2">Oyunlarım</h3>
                                <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center">
                                    <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gray-50 flex items-center justify-center border-4 border-dashed border-gray-200">
                                        <span className="text-4xl grayscale opacity-50">🎮</span>
                                    </div>
                                    <p className="text-xl text-slate-500 font-bold mb-8">Henüz hiç oyun oluşturmadın.</p>

                                    <Link href="/create">
                                        <button className="px-12 py-4 bg-[#1CB0F6] hover:bg-[#1899d6] text-white font-extrabold text-lg rounded-2xl transition-all shadow-[0_4px_0_0_#1899d6] active:shadow-none active:translate-y-[4px] uppercase tracking-wide">
                                            İlk Oyununu Oluştur
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Not Connected State
                        <div className="max-w-2xl mx-auto text-center py-20 px-4 animate-in fade-in duration-500">
                            <div className="relative w-48 h-48 mx-auto mb-10">
                                <div className="absolute inset-0 bg-[#E5E5E5] rounded-full animate-ping opacity-20"></div>
                                <div className="relative w-full h-full bg-white border-4 border-gray-100 rounded-[3rem] flex items-center justify-center shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <span className="text-7xl">🔒</span>
                                </div>
                            </div>
                            <h2 className="text-4xl font-extrabold text-slate-700 mb-6">Profilini Görüntüle</h2>
                            <p className="text-xl text-slate-500 mb-12 font-medium leading-relaxed">
                                İlerlemeni takip etmek, oyunlarını yönetmek ve kazançlarını görmek için cüzdanını bağla.
                            </p>
                            <div className="inline-block transform hover:scale-105 transition-transform duration-200">
                                <ProfileButton />
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
