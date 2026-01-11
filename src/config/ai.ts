// AI Configuration
// IMPORTANT: Never commit this file with real API keys!
// Use environment variables in production
export const AI_CONFIG = {
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
} as const;
