// Core SDK Types
export interface SDKConfig {
    gameId?: string;
    debug?: boolean;
    timeout?: number;
}

export interface GameState {
    status: 'idle' | 'playing' | 'paused' | 'finished';
    score: number;
    level: number;
    timestamp: number;
}

export interface ScoreData {
    value: number;
    metadata?: Record<string, any>;
}

export interface MessagePayload {
    type: string;
    data?: any;
    timestamp: number;
}

export type StateUpdateCallback = (state: GameState) => void;
export type ErrorCallback = (error: Error) => void;
