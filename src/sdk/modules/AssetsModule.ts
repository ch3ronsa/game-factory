import { MessagePayload } from '../core/types';

/**
 * Asset Types for Remix functionality
 */
export interface AssetMapping {
    originalUrl: string;
    remixUrl: string;
    type: 'image' | 'audio' | 'video' | 'sprite';
}

export interface AssetManifest {
    assets: AssetMapping[];
    timestamp: number;
}

export type AssetLoadCallback = (url: string, success: boolean) => void;

/**
 * Assets Module - Manages dynamic asset replacement for remixing
 */
export class AssetsModule {
    private assetMap: Map<string, string> = new Map();
    private loadedAssets: Set<string> = new Set();
    private loadCallbacks: Set<AssetLoadCallback> = new Set();
    private preloadedImages: Map<string, HTMLImageElement> = new Map();

    constructor(private debug: boolean = false) {
        this.setupMessageListener();
    }

    /**
     * Map assets - replace original URLs with remix URLs
     */
    mapAssets(mappings: AssetMapping[]): void {
        mappings.forEach(mapping => {
            this.assetMap.set(mapping.originalUrl, mapping.remixUrl);
            this.log(`Mapped: ${mapping.originalUrl} -> ${mapping.remixUrl}`);
        });

        // Preload new assets
        this.preloadAssets(mappings);

        // Notify parent
        this.sendManifestToParent();
    }

    /**
     * Get remixed URL for an asset
     */
    getAssetUrl(originalUrl: string): string {
        const remixUrl = this.assetMap.get(originalUrl);
        return remixUrl || originalUrl;
    }

    /**
     * Load an image asset with automatic remix mapping
     */
    async loadImage(originalUrl: string): Promise<HTMLImageElement> {
        const url = this.getAssetUrl(originalUrl);

        // Check if already preloaded
        if (this.preloadedImages.has(url)) {
            this.log(`Using preloaded image: ${url}`);
            return this.preloadedImages.get(url)!;
        }

        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                this.loadedAssets.add(url);
                this.preloadedImages.set(url, img);
                this.notifyLoad(url, true);
                this.log(`Image loaded: ${url}`);
                resolve(img);
            };

            img.onerror = () => {
                this.notifyLoad(url, false);
                this.log(`Image load failed: ${url}`);
                reject(new Error(`Failed to load image: ${url}`));
            };

            img.src = url;
        });
    }

    /**
     * Load multiple images in parallel
     */
    async loadImages(urls: string[]): Promise<HTMLImageElement[]> {
        return Promise.all(urls.map(url => this.loadImage(url)));
    }

    /**
     * Check if an asset is loaded
     */
    isLoaded(url: string): boolean {
        const remixUrl = this.getAssetUrl(url);
        return this.loadedAssets.has(remixUrl);
    }

    /**
     * Get all asset mappings
     */
    getMappings(): AssetMapping[] {
        const mappings: AssetMapping[] = [];
        this.assetMap.forEach((remixUrl, originalUrl) => {
            mappings.push({
                originalUrl,
                remixUrl,
                type: this.detectAssetType(remixUrl),
            });
        });
        return mappings;
    }

    /**
     * Clear all asset mappings
     */
    clearMappings(): void {
        this.assetMap.clear();
        this.loadedAssets.clear();
        this.preloadedImages.clear();
        this.log('All asset mappings cleared');
    }

    /**
     * Subscribe to asset load events
     */
    onAssetLoad(callback: AssetLoadCallback): () => void {
        this.loadCallbacks.add(callback);
        this.log('Asset load listener added');

        return () => {
            this.loadCallbacks.delete(callback);
            this.log('Asset load listener removed');
        };
    }

    /**
     * Preload assets in background
     */
    private async preloadAssets(mappings: AssetMapping[]): Promise<void> {
        const imageUrls = mappings
            .filter(m => m.type === 'image' || m.type === 'sprite')
            .map(m => m.remixUrl);

        if (imageUrls.length === 0) return;

        this.log(`Preloading ${imageUrls.length} images...`);

        try {
            await this.loadImages(imageUrls);
            this.log('All images preloaded successfully');
        } catch (error) {
            this.log('Some images failed to preload:', error);
        }
    }

    /**
     * Detect asset type from URL
     */
    private detectAssetType(url: string): 'image' | 'audio' | 'video' | 'sprite' {
        const ext = url.split('.').pop()?.toLowerCase() || '';

        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
            return 'image';
        } else if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) {
            return 'audio';
        } else if (['mp4', 'webm', 'ogv'].includes(ext)) {
            return 'video';
        }

        return 'sprite';
    }

    /**
     * Setup message listener for parent window asset updates
     */
    private setupMessageListener(): void {
        window.addEventListener('message', (event: MessageEvent) => {
            if (event.data?.type === 'UPDATE_ASSETS') {
                const mappings = event.data.data?.mappings || [];
                this.mapAssets(mappings);
            } else if (event.data?.type === 'REQUEST_ASSETS') {
                this.sendManifestToParent();
            } else if (event.data?.type === 'CLEAR_ASSETS') {
                this.clearMappings();
            }
        });

        this.log('Assets message listener setup complete');
    }

    /**
     * Send asset manifest to parent window
     */
    private sendManifestToParent(): void {
        try {
            const manifest: AssetManifest = {
                assets: this.getMappings(),
                timestamp: Date.now(),
            };

            const message: MessagePayload = {
                type: 'ASSETS_MANIFEST',
                data: manifest,
                timestamp: Date.now(),
            };

            window.parent.postMessage(message, '*');
            this.log('Asset manifest sent to parent');
        } catch (error) {
            this.log('Failed to send asset manifest:', error);
        }
    }

    /**
     * Notify subscribers of asset load
     */
    private notifyLoad(url: string, success: boolean): void {
        this.loadCallbacks.forEach((callback) => {
            try {
                callback(url, success);
            } catch (error) {
                this.log('Error in asset load callback:', error);
            }
        });
    }

    /**
     * Helper: Create p5.js compatible image loader
     */
    createP5Loader() {
        const self = this;
        return function (originalUrl: string, callback?: (img: any) => void) {
            const url = self.getAssetUrl(originalUrl);

            // Use p5's loadImage if available
            if (typeof (window as any).loadImage === 'function') {
                return (window as any).loadImage(url, callback);
            }

            // Fallback to manual loading
            self.loadImage(url).then(img => {
                if (callback) callback(img);
            });
        };
    }

    /**
     * Debug logging
     */
    private log(...args: any[]): void {
        if (this.debug) {
            console.log('[AssetsModule]', ...args);
        }
    }
}
