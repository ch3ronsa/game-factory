/**
 * Game Factory SDK - Main Entry Point
 * 
 * Usage:
 * ```typescript
 * import SDK from '@/sdk';
 * 
 * // Initialize SDK
 * await SDK.init({ gameId: 'my-game', debug: true });
 * 
 * // Start game
 * await SDK.lifecycle.start();
 * 
 * // Submit score
 * await SDK.score.send({ value: 100 });
 * 
 * // Listen to state changes
 * SDK.lifecycle.onUpdate((state) => {
 *   console.log('Game state:', state);
 * });
 * 
 * // End game
 * await SDK.lifecycle.finish(finalScore);
 * ```
 */

// Core
export { GameFactorySDK, getSDK } from './core/GameFactorySDK';
export type { SDKConfig, GameState, ScoreData } from './core/types';

// Modules
export { ScoreModule } from './modules/ScoreModule';
export { LifecycleModule } from './modules/LifecycleModule';

// Shims (for backward compatibility)
export { createFarcadeShim } from './shims/farcade-shim';

// Default export - SDK instance
import { getSDK } from './core/GameFactorySDK';
export default getSDK();
