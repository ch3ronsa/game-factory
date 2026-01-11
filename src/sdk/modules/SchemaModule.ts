import { MessagePayload } from '../core/types';

/**
 * Schema Types for Remix functionality
 */
export interface SchemaProperty {
    key: string;
    type: 'number' | 'string' | 'boolean' | 'color' | 'range';
    label: string;
    defaultValue: any;
    min?: number;
    max?: number;
    step?: number;
    description?: string;
}

export interface GameSchema {
    version: string;
    properties: SchemaProperty[];
}

export type VariableUpdateCallback = (key: string, value: any) => void;

/**
 * Schema Module - Defines moddable game parameters
 */
export class SchemaModule {
    private schema: GameSchema = {
        version: '1.0.0',
        properties: [],
    };

    private updateCallbacks: Set<VariableUpdateCallback> = new Set();
    private currentValues: Map<string, any> = new Map();

    constructor(private debug: boolean = false) {
        this.setupMessageListener();
    }

    /**
     * Define game schema - what can be modded
     */
    defineSchema(properties: SchemaProperty[]): void {
        this.schema.properties = properties;

        // Initialize current values with defaults
        properties.forEach(prop => {
            this.currentValues.set(prop.key, prop.defaultValue);
        });

        // Send schema to parent window
        this.sendSchemaToParent();
        this.log('Schema defined with', properties.length, 'properties');
    }

    /**
     * Get current schema
     */
    getSchema(): GameSchema {
        return { ...this.schema };
    }

    /**
     * Get current value of a variable
     */
    getValue(key: string): any {
        return this.currentValues.get(key);
    }

    /**
     * Get all current values
     */
    getAllValues(): Record<string, any> {
        const values: Record<string, any> = {};
        this.currentValues.forEach((value, key) => {
            values[key] = value;
        });
        return values;
    }

    /**
     * Subscribe to variable updates
     */
    onUpdate(callback: VariableUpdateCallback): () => void {
        this.updateCallbacks.add(callback);
        this.log('Variable update listener added');

        // Return unsubscribe function
        return () => {
            this.updateCallbacks.delete(callback);
            this.log('Variable update listener removed');
        };
    }

    /**
     * Update a variable value (internal or from parent)
     */
    updateValue(key: string, value: any): void {
        const oldValue = this.currentValues.get(key);

        if (oldValue === value) {
            return; // No change
        }

        this.currentValues.set(key, value);
        this.log(`Variable updated: ${key} = ${value} (was ${oldValue})`);

        // Notify all subscribers
        this.notifyUpdate(key, value);
    }

    /**
     * Setup message listener for parent window updates
     */
    private setupMessageListener(): void {
        window.addEventListener('message', (event: MessageEvent) => {
            if (event.data?.type === 'UPDATE_VARIABLE') {
                const { key, value } = event.data.data || {};

                if (key && value !== undefined) {
                    this.updateValue(key, value);
                }
            } else if (event.data?.type === 'REQUEST_SCHEMA') {
                this.sendSchemaToParent();
            } else if (event.data?.type === 'BULK_UPDATE') {
                // Update multiple variables at once
                const updates = event.data.data || {};
                Object.entries(updates).forEach(([key, value]) => {
                    this.updateValue(key, value);
                });
            }
        });

        this.log('Schema message listener setup complete');
    }

    /**
     * Send schema to parent window
     */
    private sendSchemaToParent(): void {
        try {
            const message: MessagePayload = {
                type: 'SCHEMA_DEFINED',
                data: {
                    schema: this.schema,
                    currentValues: this.getAllValues(),
                },
                timestamp: Date.now(),
            };

            window.parent.postMessage(message, '*');
            this.log('Schema sent to parent');
        } catch (error) {
            this.log('Failed to send schema to parent:', error);
        }
    }

    /**
     * Notify all subscribers of variable update
     */
    private notifyUpdate(key: string, value: any): void {
        this.updateCallbacks.forEach((callback) => {
            try {
                callback(key, value);
            } catch (error) {
                this.log('Error in variable update callback:', error);
            }
        });
    }

    /**
     * Validate a value against schema
     */
    validateValue(key: string, value: any): boolean {
        const property = this.schema.properties.find(p => p.key === key);

        if (!property) {
            this.log(`Warning: No schema property found for key: ${key}`);
            return false;
        }

        // Type validation
        const valueType = typeof value;
        if (property.type === 'number' && valueType !== 'number') return false;
        if (property.type === 'string' && valueType !== 'string') return false;
        if (property.type === 'boolean' && valueType !== 'boolean') return false;

        // Range validation
        if (property.type === 'number' || property.type === 'range') {
            if (property.min !== undefined && value < property.min) return false;
            if (property.max !== undefined && value > property.max) return false;
        }

        return true;
    }

    /**
     * Debug logging
     */
    private log(...args: any[]): void {
        if (this.debug) {
            console.log('[SchemaModule]', ...args);
        }
    }
}
