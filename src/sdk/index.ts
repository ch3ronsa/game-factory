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
 * // Define moddable schema (Remix.gg style)
 * SDK.schema.defineSchema([
 *   { key: 'speed', type: 'range', label: 'Player Speed', defaultValue: 5, min: 1, max: 10 },
 *   { key: 'gravity', type: 'number', label: 'Gravity', defaultValue: 0.5 }
 * ]);
 * 
 * // Map assets for remixing
 * SDK.assets.mapAssets([
 *   { originalUrl: '/player.png', remixUrl: '/custom-player.png', type: 'sprite' }
 * ]);
 * 
 * // Listen to variable updates
 * SDK.schema.onUpdate((key, value) => {
 *   console.log(`${key} changed to ${value}`);
 * });
 * 
 * // Start game
 * await SDK.lifecycle.start();
 * 
 * // Submit score
 * await SDK.score.send({ value: 1000 });
 * 
 * // End game
 * await SDK.lifecycle.finish(finalScore);
 * ```
 */

// Core
export { GameFactorySDK, getSDK } from './core/GameFactorySDK';
export type { SDKConfig, GameState, ScoreData } from './core/types';

// Core Modules
export { ScoreModule } from './modules/ScoreModule';
export { LifecycleModule } from './modules/LifecycleModule';

// Remix Modules
export { SchemaModule } from './modules/SchemaModule';
export { AssetsModule } from './modules/AssetsModule';
export type { SchemaProperty, GameSchema } from './modules/SchemaModule';
export type { AssetMapping, AssetManifest } from './modules/AssetsModule';

// Shims (for backward compatibility)
export { createFarcadeShim } from './shims/farcade-shim';

// Default export - SDK instance
import { getSDK } from './core/GameFactorySDK';
export default getSDK();
