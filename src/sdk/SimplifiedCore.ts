/**
 * Game Factory SDK - Simplified Core
 * Minimal API for game development with Remix support
 */

type RemixVariables = Record<string, any>;

class GameFactorySDK {
    private static instance: GameFactorySDK;
    private vars: RemixVariables = {};
    private updateCallback: (newVars: RemixVariables) => void = () => { };
    private score: number = 0;
    private isReady: boolean = false;

    private constructor() {
        this.initMessageListener();
    }

    public static getInstance(): GameFactorySDK {
        if (!GameFactorySDK.instance) {
            GameFactorySDK.instance = new GameFactorySDK();
        }
        return GameFactorySDK.instance;
    }

    /**
     * 1. REGISTER REMIX VARIABLES
     * Define what can be modded in your game
     */
    public registerRemix(defaultVars: RemixVariables): void {
        this.vars = defaultVars;
        this.sendMessage("REGISTER_SCHEMA", defaultVars);
        console.log('[SDK] Remix variables registered:', defaultVars);
    }

    /**
     * 2. LISTEN FOR REAL-TIME UPDATES
     * Called when platform changes a variable
     */
    public onRemixUpdate(callback: (newVars: RemixVariables) => void): void {
        this.updateCallback = callback;
    }

    /**
     * 3. GET CURRENT VARIABLE VALUE
     */
    public getVar(key: string): any {
        return this.vars[key];
    }

    /**
     * 4. GET ALL VARIABLES
     */
    public getAllVars(): RemixVariables {
        return { ...this.vars };
    }

    /**
     * 5. SUBMIT SCORE (Farcade Replacement)
     */
    public submitScore(score: number): void {
        this.score = score;
        this.sendMessage("SUBMIT_SCORE", { score });
        console.log('[SDK] Score submitted:', score);
    }

    /**
     * 6. GAME LIFECYCLE - Ready
     */
    public gameReady(): void {
        this.isReady = true;
        this.sendMessage("GAME_READY", true);
        console.log('[SDK] Game ready');
    }

    /**
     * 7. GAME LIFECYCLE - Start
     */
    public gameStart(): void {
        this.sendMessage("GAME_START", true);
        console.log('[SDK] Game started');
    }

    /**
     * 8. GAME LIFECYCLE - End
     */
    public gameEnd(finalScore?: number): void {
        const scoreToSubmit = finalScore ?? this.score;
        this.sendMessage("GAME_END", { score: scoreToSubmit });
        console.log('[SDK] Game ended with score:', scoreToSubmit);
    }

    /**
     * INTERNAL: Send message to parent window
     */
    private sendMessage(type: string, payload: any): void {
        try {
            window.parent.postMessage({ type, payload }, "*");
        } catch (error) {
            console.error('[SDK] Failed to send message:', error);
        }
    }

    /**
     * INTERNAL: Listen for messages from parent
     */
    private initMessageListener(): void {
        window.addEventListener("message", (event) => {
            const { type, payload } = event.data || {};

            switch (type) {
                case "UPDATE_REMIX":
                    // Platform changed a variable
                    this.vars = { ...this.vars, ...payload };
                    this.updateCallback(this.vars);
                    console.log('[SDK] Remix updated:', payload);
                    break;

                case "REQUEST_STATE":
                    // Platform wants current state
                    this.sendMessage("STATE_RESPONSE", {
                        vars: this.vars,
                        score: this.score,
                        isReady: this.isReady
                    });
                    break;

                case "RESET_GAME":
                    // Platform wants to reset
                    this.score = 0;
                    console.log('[SDK] Game reset');
                    break;

                default:
                    // Unknown message type
                    break;
            }
        });

        console.log('[SDK] Message listener initialized');
    }
}

// Export singleton instance
export const sdk = GameFactorySDK.getInstance();

// Also export class for type checking
export { GameFactorySDK };
export type { RemixVariables };
