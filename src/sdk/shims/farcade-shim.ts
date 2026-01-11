/**
 * Farcade SDK Compatibility Shim
 * Provides backward compatibility for games using old Farcade SDK
 */

import { getSDK } from '../core/GameFactorySDK';

// Create global Farcade-like interface
interface FarcadeShim {
    init: () => Promise<void>;
    gameStart: () => Promise<void>;
    gameEnd: (score?: number) => Promise<void>;
    submitScore: (score: number, metadata?: any) => Promise<boolean>;
    onGameStateUpdated: (callback: (state: any) => void) => () => void;
    getAssets: () => Promise<any[]>;
}

/**
 * Create Farcade compatibility layer
 */
function createFarcadeShim(): FarcadeShim {
    const sdk = getSDK({ debug: true });

    return {
        // Initialize SDK
        async init(): Promise<void> {
            console.warn('[Farcade Shim] Using compatibility layer. Consider migrating to GameFactorySDK.');
            await sdk.init();
        },

        // Start game
        async gameStart(): Promise<void> {
            await sdk.lifecycle.start();
        },

        // End game
        async gameEnd(score?: number): Promise<void> {
            await sdk.lifecycle.finish(score);
        },

        // Submit score
        async submitScore(score: number, metadata?: any): Promise<boolean> {
            return await sdk.score.send({ value: score, metadata });
        },

        // Subscribe to state updates
        onGameStateUpdated(callback: (state: any) => void): () => void {
            return sdk.lifecycle.onUpdate(callback);
        },

        // Get assets (placeholder - implement based on your needs)
        async getAssets(): Promise<any[]> {
            console.warn('[Farcade Shim] getAssets() is not implemented in shim');
            return [];
        },
    };
}

// Expose to window for legacy code
declare global {
    interface Window {
        farcade?: FarcadeShim;
        FarcadeSDK?: FarcadeShim;
    }
}

// Auto-initialize shim if Farcade is referenced
if (typeof window !== 'undefined') {
    window.farcade = createFarcadeShim();
    window.FarcadeSDK = window.farcade; // Alias for compatibility

    console.log('[Farcade Shim] Compatibility layer loaded. Old Farcade code will work.');
}

export { createFarcadeShim };
