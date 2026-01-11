import { GameState, MessagePayload } from '../core/types';

/**
 * Lifecycle Module - Manages game lifecycle events
 */
export class LifecycleModule {
    private state: GameState = {
        status: 'idle',
        score: 0,
        level: 1,
        timestamp: Date.now(),
    };

    private startTime: number = 0;
    private endTime: number = 0;
    private callbacks: Set<(state: GameState) => void> = new Set();

    constructor(private debug: boolean = false) { }

    /**
     * Start the game
     */
    async start(): Promise<void> {
        if (this.state.status === 'playing') {
            this.log('Game already started');
            return;
        }

        this.startTime = Date.now();
        this.state = {
            ...this.state,
            status: 'playing',
            timestamp: this.startTime,
        };

        this.notifyStateChange();
        this.sendToParent('GAME_START');
        this.log('Game started');
    }

    /**
     * Pause the game
     */
    pause(): void {
        if (this.state.status !== 'playing') {
            this.log('Cannot pause: game not playing');
            return;
        }

        this.state = {
            ...this.state,
            status: 'paused',
            timestamp: Date.now(),
        };

        this.notifyStateChange();
        this.sendToParent('GAME_PAUSE');
        this.log('Game paused');
    }

    /**
     * Resume the game
     */
    resume(): void {
        if (this.state.status !== 'paused') {
            this.log('Cannot resume: game not paused');
            return;
        }

        this.state = {
            ...this.state,
            status: 'playing',
            timestamp: Date.now(),
        };

        this.notifyStateChange();
        this.sendToParent('GAME_RESUME');
        this.log('Game resumed');
    }

    /**
     * Finish the game
     */
    async finish(finalScore?: number): Promise<void> {
        if (this.state.status === 'finished') {
            this.log('Game already finished');
            return;
        }

        this.endTime = Date.now();
        const duration = this.endTime - this.startTime;

        this.state = {
            ...this.state,
            status: 'finished',
            score: finalScore ?? this.state.score,
            timestamp: this.endTime,
        };

        this.notifyStateChange();
        this.sendToParent('GAME_END', {
            finalScore: this.state.score,
            duration,
            level: this.state.level,
        });

        this.log('Game finished. Duration:', duration, 'ms');
    }

    /**
     * Reset the game
     */
    reset(): void {
        this.state = {
            status: 'idle',
            score: 0,
            level: 1,
            timestamp: Date.now(),
        };

        this.startTime = 0;
        this.endTime = 0;

        this.notifyStateChange();
        this.log('Game reset');
    }

    /**
     * Update game state
     */
    updateState(updates: Partial<GameState>): void {
        this.state = {
            ...this.state,
            ...updates,
            timestamp: Date.now(),
        };

        this.notifyStateChange();
    }

    /**
     * Get current state
     */
    getState(): GameState {
        return { ...this.state };
    }

    /**
     * Subscribe to state changes
     */
    onUpdate(callback: (state: GameState) => void): () => void {
        this.callbacks.add(callback);
        this.log('State update listener added');

        // Return unsubscribe function
        return () => {
            this.callbacks.delete(callback);
            this.log('State update listener removed');
        };
    }

    /**
     * Get game duration
     */
    getDuration(): number {
        if (this.startTime === 0) return 0;
        const end = this.endTime || Date.now();
        return end - this.startTime;
    }

    /**
     * Notify all subscribers of state change
     */
    private notifyStateChange(): void {
        this.callbacks.forEach((callback) => {
            try {
                callback(this.getState());
            } catch (error) {
                this.log('Error in state update callback:', error);
            }
        });
    }

    /**
     * Send lifecycle event to parent window
     */
    private sendToParent(type: string, data?: any): void {
        try {
            const message: MessagePayload = {
                type,
                data: {
                    state: this.state,
                    ...data,
                },
                timestamp: Date.now(),
            };

            window.parent.postMessage(message, '*');
        } catch (error) {
            this.log('Failed to send message to parent:', error);
        }
    }

    /**
     * Debug logging
     */
    private log(...args: any[]): void {
        if (this.debug) {
            console.log('[LifecycleModule]', ...args);
        }
    }
}
