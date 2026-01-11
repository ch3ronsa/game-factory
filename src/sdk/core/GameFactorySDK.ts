import { SDKConfig } from './types';
import { ScoreModule } from '../modules/ScoreModule';
import { LifecycleModule } from '../modules/LifecycleModule';
import { SchemaModule } from '../modules/SchemaModule';
import { AssetsModule } from '../modules/AssetsModule';

/**
 * Game Factory SDK - Singleton Core Class
 * Provides modular game development utilities with Remix.gg support
 */
export class GameFactorySDK {
    private static instance: GameFactorySDK | null = null;
    private initialized: boolean = false;
    private config: SDKConfig;

    // Core Modules
    public readonly score: ScoreModule;
    public readonly lifecycle: LifecycleModule;

    // Remix Modules
    public readonly schema: SchemaModule;
    public readonly assets: AssetsModule;

    private constructor(config: SDKConfig = {}) {
        this.config = {
            debug: false,
            timeout: 5000,
            ...config,
        };

        // Initialize all modules
        this.score = new ScoreModule(this.config.debug);
        this.lifecycle = new LifecycleModule(this.config.debug);
        this.schema = new SchemaModule(this.config.debug);
        this.assets = new AssetsModule(this.config.debug);

        this.log('SDK instance created with Remix support');
    }

    /**
     * Get SDK instance (Singleton)
     */
    static getInstance(config?: SDKConfig): GameFactorySDK {
        if (!GameFactorySDK.instance) {
            GameFactorySDK.instance = new GameFactorySDK(config);
        }
        return GameFactorySDK.instance;
    }

    /**
     * Initialize SDK
     */
    async init(config?: Partial<SDKConfig>): Promise<void> {
        if (this.initialized) {
            this.log('SDK already initialized');
            return;
        }

        // Merge config
        if (config) {
            this.config = { ...this.config, ...config };
        }

        try {
            // Setup message listener for parent communication
            this.setupMessageListener();

            // Notify parent that SDK is ready
            this.notifyParent('SDK_READY', {
                version: '1.0.0',
                gameId: this.config.gameId,
            });

            this.initialized = true;
            this.log('SDK initialized successfully');
        } catch (error) {
            this.log('SDK initialization failed:', error);
            throw error;
        }
    }

    /**
     * Check if SDK is initialized
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Get SDK configuration
     */
    getConfig(): SDKConfig {
        return { ...this.config };
    }

    /**
     * Setup message listener for parent window communication
     */
    private setupMessageListener(): void {
        window.addEventListener('message', (event: MessageEvent) => {
            // Validate message origin in production
            if (this.config.debug) {
                this.log('Received message:', event.data);
            }

            // Handle different message types
            switch (event.data?.type) {
                case 'PARENT_READY':
                    this.log('Parent window ready');
                    break;
                case 'REQUEST_STATE':
                    this.sendState();
                    break;
                case 'RESET_GAME':
                    this.handleReset();
                    break;
                default:
                    // Unknown message type
                    break;
            }
        });

        this.log('Message listener setup complete');
    }

    /**
     * Send current state to parent
     */
    private sendState(): void {
        this.notifyParent('STATE_UPDATE', {
            lifecycle: this.lifecycle.getState(),
            score: {
                current: this.score.getCurrent(),
                high: this.score.getHigh(),
            },
        });
    }

    /**
     * Handle reset request from parent
     */
    private handleReset(): void {
        this.lifecycle.reset();
        this.score.reset();
        this.log('Game reset by parent');
    }

    /**
     * Send message to parent window
     */
    private notifyParent(type: string, data?: any): void {
        try {
            window.parent.postMessage(
                {
                    type,
                    data,
                    timestamp: Date.now(),
                },
                '*'
            );
        } catch (error) {
            this.log('Failed to notify parent:', error);
        }
    }

    /**
     * Debug logging
     */
    private log(...args: any[]): void {
        if (this.config.debug) {
            console.log('[GameFactorySDK]', ...args);
        }
    }

    /**
     * Destroy SDK instance (for testing)
     */
    static destroy(): void {
        GameFactorySDK.instance = null;
    }
}

// Export singleton getter
export const getSDK = (config?: SDKConfig) => GameFactorySDK.getInstance(config);
