'use client';

import { ProfileButton } from '@/components/ProfileButton';
import { GameDescriptionForm } from '@/components/GameDescriptionForm';
import Link from 'next/link';

export default function CreatePage() {
    return (
        <div className="min-h-screen bg-[#0F0F12] text-white selection:bg-purple-500/30 font-sans">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Header - Minimalist */}
            <header className="relative z-20 border-b border-white/5 backdrop-blur-xl">
                <nav className="flex items-center justify-between px-6 py-4 md:px-8 max-w-[1600px] mx-auto">
                    {/* Logo - Tech Style */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <div className="absolute inset-0 bg-purple-600 rounded-lg opacity-20 group-hover:opacity-40 transition-opacity blur-sm"></div>
                            <span className="relative text-xl font-bold bg-gradient-to-tr from-purple-400 to-white bg-clip-text text-transparent">GF</span>
                        </div>
                        <span className="text-lg font-bold text-gray-200 tracking-tight group-hover:text-white transition-colors">Game Factory</span>
                    </Link>

                    {/* Navigation Actions */}
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden md:block">
                            Dashboard
                        </Link>
                        <div className="h-4 w-px bg-white/10 hidden md:block"></div>
                        <ProfileButton />
                    </div>
                </nav>
            </header>

            {/* Main Workspace */}
            <main className="relative z-10 p-6 md:p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
                <GameDescriptionForm />
            </main>
        </div>
    );
}
