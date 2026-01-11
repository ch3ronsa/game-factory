'use client';

import { useAccount, useReadContracts } from 'wagmi';
import { METH_TOKEN_ADDRESS, ERC20_ABI, mantleMainnet } from '@/config/wagmi';
import { formatUnits } from 'viem';
import { useState, useEffect } from 'react';

export function MethBalance() {
    const { address, isConnected, chain } = useAccount();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setMounted(true);
    }, []);

    const { data, isLoading, isError } = useReadContracts({
        contracts: [
            {
                address: METH_TOKEN_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: address ? [address] : undefined,
                chainId: mantleMainnet.id,
            },
            {
                address: METH_TOKEN_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'decimals',
                chainId: mantleMainnet.id,
            },
        ],
        query: {
            enabled: !!address && isConnected && chain?.id === mantleMainnet.id,
        },
    });

    if (!mounted) {
        return null;
    }

    if (!isConnected || chain?.id !== mantleMainnet.id) {
        return null;
    }

    const balance = data?.[0]?.result as bigint | undefined;
    const decimals = data?.[1]?.result as number | undefined;

    const formattedBalance = balance && decimals
        ? parseFloat(formatUnits(balance, decimals)).toFixed(4)
        : '0.0000';

    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-75" />
            <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 hover:border-cyan-500/50 transition-all duration-300">
                <div className="flex items-center gap-4">
                    {/* mETH Icon */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-md opacity-50" />
                        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-bold text-white">m</span>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm text-gray-400 mb-1">mETH Balance</span>
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-8 bg-gray-700/50 rounded-lg animate-pulse" />
                            </div>
                        ) : isError ? (
                            <span className="text-red-400 text-sm">Error loading balance</span>
                        ) : (
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                    {formattedBalance}
                                </span>
                                <span className="text-lg text-gray-400 font-medium">mETH</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-2 right-2 flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-100" />
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse delay-200" />
                </div>
            </div>
        </div>
    );
}
