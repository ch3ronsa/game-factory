import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
    title: 'Game Factory - AI ile Oyun Yarat',
    description: 'Mantle Network üzerinde AI destekli oyun üretici.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr">
            <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
