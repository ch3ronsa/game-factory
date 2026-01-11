'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@/components/ConnectButton';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Home() {
    const { isConnected } = useAccount();

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-pink-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000"></div>
            </div>

            <header className="w-full py-6 px-8 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                        <span className="text-2xl">☺</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">Game Factory</span>
                </div>
                <ConnectButton />
            </header>

            <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 lg:px-20 z-10 gap-12 lg:gap-24">

                {/* Left Content */}
                <div className="flex-1 max-w-2xl text-center lg:text-left space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                            Oyun yapmanın <br />
                            <span className="text-blue-500">ücretsiz</span>, <br />
                            <span className="text-blue-500">eğlenceli</span> ve <span className="text-blue-500">etkili</span> <br />
                            yolu!
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0"
                    >
                        AI destekli oyun üretici ile hayal ettiğiniz oyunu saniyeler içinde yaratın. Mantle Network üzerinde toplulukla paylaşın!
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                    >
                        <Link href="/create" className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 transform hover:scale-105 transition-all duration-200 text-center">
                            BAŞLA
                        </Link>
                        <Link href="/profil">
                            <button className="px-8 py-4 bg-white hover:bg-slate-50 text-blue-500 border-2 border-slate-200 font-bold rounded-2xl shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200 uppercase tracking-wide">
                                ZATEN HESABIM VAR
                            </button>
                        </Link>
                    </motion.div>
                </div>

                {/* Right Content - Mascot/Hero Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex-1 relative w-full max-w-[500px] aspect-square"
                >
                    {/* Main Card Background */}
                    <div className="absolute inset-0 bg-blue-100/50 rounded-[3rem] transform rotate-3"></div>
                    <div className="absolute inset-0 bg-blue-200/50 rounded-[3rem] transform -rotate-2 scale-95"></div>

                    {/* Image Container */}
                    <div className="absolute inset-4 bg-gradient-to-b from-white to-blue-50 rounded-[2.5rem] shadow-2xl flex items-center justify-center p-8 border border-white/50 relative overflow-hidden">

                        {/* Decorative Elements inside card */}
                        <div className="absolute top-4 right-4 text-orange-400 text-4xl animate-bounce delay-1000">★</div>
                        <div className="absolute bottom-8 left-8 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="absolute top-1/2 right-2 w-2 h-8 bg-pink-400 rounded-full transform rotate-45"></div>

                        {/* Mascot Image - Assuming mascot.png exists in public/images/ */}
                        <div className="relative w-full h-full flex items-center justify-center z-10">
                            <Image
                                src="/images/mascot.png"
                                alt="Game Factory Mascot"
                                width={400}
                                height={400}
                                priority
                                className="object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
