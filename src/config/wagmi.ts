import { http, createConfig } from 'wagmi';
import { mantle } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Mantle Mainnet Chain Configuration
export const mantleMainnet = {
  ...mantle,
  rpcUrls: {
    default: {
      http: ['https://rpc.mantle.xyz'],
    },
    public: {
      http: ['https://rpc.mantle.xyz'],
    },
  },
} as const;

// Game Factory Contract Address (Placeholder)
export const GAME_FACTORY_ADDRESS = '0xb411267879e6D5409C8f6B66498AfcE746F46A14' as const;

// mETH Token Contract Address on Mantle
export const METH_TOKEN_ADDRESS = '0xcDA86A272531e8640cD7F1a92c01839911B90bb0' as const;

// Game Factory ABI for creating games
export const GAME_FACTORY_ABI = [
  {
    name: 'mintGame',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'metadata', type: 'string' }
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  }
] as const;

export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;

export const config = createConfig({
  chains: [mantleMainnet],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
    }),
  ],
  transports: {
    [mantleMainnet.id]: http('https://rpc.mantle.xyz'),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
