'use client';

import { ProfileButton } from '@/components/ProfileButton';
import Link from 'next/link';

export default function ExplorePage() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-white">
            {/* Header */}
            <header className="relative z-20 bg-white border-b border-gray-100">
                <nav className="flex items-center justify-between px-6 py-4 md:px-12 max-w-7xl mx-auto">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative w-10 h-10 bg-gradient-to-br from-[#1CB0F6] to-[#1899D6] rounded-xl flex items-center justify-center shadow-md">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-800">Game Factory</span>
                    </Link>

                    {/* Profile/Connect Button */}
                    <ProfileButton />
                </nav>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-4 md:px-8 pb-20">
                <section className="max-w-7xl mx-auto pt-8 md:pt-12">
                    {/* Back Button */}
                    <Link
                        href="/"
                        className="mb-8 inline-flex items-center gap-2 text-gray-600 hover:text-[#1CB0F6] transition-colors group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                        </svg>
                        <span className="font-semibold">Ana Sayfaya Dön</span>
                    </Link>

                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
                            Topluluk <span className="text-[#1CB0F6]">Oyunları</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Kullanıcılarımız tarafından oluşturulan en popüler oyunları keşfedin
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Cosmic Raiders",
                                creator: "0x7a3c...89f2",
                                players: "2.4K",
                                reward: "45 mETH",
                                gradient: "from-purple-400 to-purple-600",
                                color: "purple"
                            },
                            {
                                title: "Dragon Quest X",
                                creator: "0x1b5f...c4a1",
                                players: "1.8K",
                                reward: "32 mETH",
                                gradient: "from-orange-400 to-red-500",
                                color: "red"
                            },
                            {
                                title: "Neon Streets",
                                creator: "0x9e2d...7b3c",
                                players: "3.1K",
                                reward: "67 mETH",
                                gradient: "from-cyan-400 to-blue-500",
                                color: "blue"
                            },
                            {
                                title: "Space Adventure",
                                creator: "0x4f8a...2e9d",
                                players: "2.7K",
                                reward: "51 mETH",
                                gradient: "from-green-400 to-emerald-600",
                                color: "green"
                            },
                            {
                                title: "Pixel Warriors",
                                creator: "0x8c1b...7f3a",
                                players: "3.5K",
                                reward: "78 mETH",
                                gradient: "from-pink-400 to-rose-600",
                                color: "pink"
                            },
                            {
                                title: "Mystic Realm",
                                creator: "0x2d9e...4b8c",
                                players: "1.9K",
                                reward: "39 mETH",
                                gradient: "from-indigo-400 to-purple-600",
                                color: "indigo"
                            },
                        ].map((game, index) => (
                            <div
                                key={index}
                                className="group relative bg-white rounded-3xl border-2 border-gray-100 overflow-hidden hover:border-[#1CB0F6] hover:shadow-xl transition-all duration-300 cursor-pointer"
                            >
                                {/* Game preview area */}
                                <div className={`h-48 bg-gradient-to-br ${game.gradient} relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-black/5" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    {/* Hover play button */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                        <button className="px-8 py-3 bg-[#1CB0F6] text-white font-bold rounded-2xl hover:bg-[#1899D6] transition-colors shadow-lg border-b-4 border-[#1899D6] active:border-b-2 active:translate-y-[2px]">
                                            Oyna
                                        </button>
                                    </div>
                                </div>

                                {/* Game info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-extrabold text-gray-800 mb-1">{game.title}</h3>
                                    <p className="text-sm text-gray-500 mb-4 font-mono">by {game.creator}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[#E0F7FF] flex items-center justify-center">
                                                <svg className="w-4 h-4 text-[#1CB0F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">{game.players}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Kazanıldı</p>
                                            <p className="text-sm font-extrabold text-[#1CB0F6]">{game.reward}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Load More Button */}
                    <div className="text-center mt-12">
                        <button className="px-8 py-4 bg-[#1CB0F6] text-white font-bold text-lg rounded-2xl transition-all hover:brightness-110 shadow-md border-b-4 border-[#1899D6] active:border-b-2 active:translate-y-[2px]">
                            Daha Fazla Yükle
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-gray-200 mt-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#1CB0F6] to-[#1899D6] rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="font-bold text-gray-800">Game Factory</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Hakkında</Link>
                            <Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Belgeler</Link>
                            <Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Discord</Link>
                        </div>

                        <p className="text-sm text-gray-500">
                            © 2024 Game Factory • Built on Mantle Network
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
