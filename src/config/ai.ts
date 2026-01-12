// AI Configuration
// IMPORTANT: Never commit this file with real API keys!
// Use environment variables in production

// Server-side API routes should use OPENROUTER_API_KEY (without NEXT_PUBLIC_)
// Client-side code would use NEXT_PUBLIC_OPENROUTER_API_KEY
export const AI_CONFIG = {
    // Try both server-side and client-side env vars for compatibility
    apiKey: process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
} as const;
