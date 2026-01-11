import { ScoreData, MessagePayload } from '../core/types';

/**
 * Score Module - Handles score submission and tracking
 */
export class ScoreModule {
    private currentScore: number = 0;
    private highScore: number = 0;
    private isSubmitting: boolean = false;

    constructor(private debug: boolean = false) {
        this.loadHighScore();
    }

    /**
     * Send score to parent window
     */
    async send(scoreData: ScoreData): Promise<boolean> {
        if (this.isSubmitting) {
            this.log('Score submission already in progress');
            return false;
        }

        this.isSubmitting = true;
        this.currentScore = scoreData.value;

        try {
            // Update high score
            if (scoreData.value > this.highScore) {
                this.highScore = scoreData.value;
                this.saveHighScore();
            }

            // Send to parent window via postMessage
            const message: MessagePayload = {
                type: 'SCORE_SUBMIT',
                data: {
                    score: scoreData.value,
                    highScore: this.highScore,
                    metadata: scoreData.metadata,
                },
                timestamp: Date.now(),
            };

            window.parent.postMessage(message, '*');
            this.log('Score submitted:', scoreData.value);

            // Wait for acknowledgment with timeout
            const ack = await this.waitForAcknowledgment(3000);
            return ack;
        } catch (error) {
            this.log('Score submission failed:', error);
            return false;
        } finally {
            this.isSubmitting = false;
        }
    }

    /**
     * Get current score
     */
    getCurrent(): number {
        return this.currentScore;
    }

    /**
     * Get high score
     */
    getHigh(): number {
        return this.highScore;
    }

    /**
     * Reset current score
     */
    reset(): void {
        this.currentScore = 0;
        this.log('Score reset');
    }

    /**
     * Add to current score
     */
    add(value: number): number {
        this.currentScore += value;
        this.log('Score added:', value, '-> Total:', this.currentScore);

        // Auto-update high score
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
        }

        return this.currentScore;
    }

    /**
     * Set score directly
     */
    set(value: number): void {
        this.currentScore = value;
        this.log('Score set:', value);

        if (value > this.highScore) {
            this.highScore = value;
            this.saveHighScore();
        }
    }


    /**
     * Wait for parent window acknowledgment
     */
    private waitForAcknowledgment(timeout: number): Promise<boolean> {
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
                window.removeEventListener('message', handler);
                this.log('Score acknowledgment timeout');
                resolve(false); // Fallback: assume success even without ack
            }, timeout);

            const handler = (event: MessageEvent) => {
                if (event.data?.type === 'SCORE_ACK') {
                    clearTimeout(timeoutId);
                    window.removeEventListener('message', handler);
                    this.log('Score acknowledged by parent');
                    resolve(true);
                }
            };

            window.addEventListener('message', handler);
        });
    }

    /**
     * Load high score from localStorage
     */
    private loadHighScore(): void {
        try {
            const stored = localStorage.getItem('gf_high_score');
            if (stored) {
                this.highScore = parseInt(stored, 10);
                this.log('High score loaded:', this.highScore);
            }
        } catch (error) {
            this.log('Failed to load high score:', error);
        }
    }

    /**
     * Save high score to localStorage
     */
    private saveHighScore(): void {
        try {
            localStorage.setItem('gf_high_score', this.highScore.toString());
            this.log('High score saved:', this.highScore);
        } catch (error) {
            this.log('Failed to save high score:', error);
        }
    }

    /**
     * Debug logging
     */
    private log(...args: any[]): void {
        if (this.debug) {
            console.log('[ScoreModule]', ...args);
        }
    }
}
