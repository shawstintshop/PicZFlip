import { config } from 'dotenv';
// Load environment variables
config();
export const ENV = {
    // Google Cloud APIs
    GOOGLE_VISION_API_KEY: process.env.GOOGLE_VISION_API_KEY || '',
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    // Gemini AI
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    // Firebase Configuration
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ||
        process.env.GOOGLE_CLOUD_PROJECT ||
        process.env.GCLOUD_PROJECT ||
        '',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
    // Application Settings
    NODE_ENV: process.env.NODE_ENV || 'development',
    REGION: process.env.REGION || 'us-central1',
    PORT: parseInt(process.env.PORT || '5001'),
    // Rate Limiting
    MAX_REQUESTS_PER_MINUTE: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '1000'),
    MAX_CONCURRENT_SEARCHES: parseInt(process.env.MAX_CONCURRENT_SEARCHES || '50'),
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    ENABLE_DEBUG_LOGGING: process.env.ENABLE_DEBUG_LOGGING === 'true',
    // External Services
    ENABLE_SCRAPING: process.env.ENABLE_SCRAPING !== 'false',
    ENABLE_API_SEARCHES: process.env.ENABLE_API_SEARCHES !== 'false',
    ENABLE_IMAGE_PROCESSING: process.env.ENABLE_IMAGE_PROCESSING !== 'false',
    // Security
    JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-in-production',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    // Database
    FIRESTORE_COLLECTION_PREFIX: process.env.FIRESTORE_COLLECTION_PREFIX || 'piczflip',
    MAX_ANALYSIS_HISTORY: parseInt(process.env.MAX_ANALYSIS_HISTORY || '1000'),
    // Performance
    SEARCH_TIMEOUT_MS: parseInt(process.env.SEARCH_TIMEOUT_MS || '30000'),
    IMAGE_PROCESSING_TIMEOUT_MS: parseInt(process.env.IMAGE_PROCESSING_TIMEOUT_MS || '15000'),
    MAX_IMAGE_SIZE_MB: parseInt(process.env.MAX_IMAGE_SIZE_MB || '10')
};
// Validation
export function validateEnvironment() {
    const required = [
        'GEMINI_API_KEY',
        'FIREBASE_PROJECT_ID'
    ];
    const missing = required.filter(key => !ENV[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}. Set FIREBASE_PROJECT_ID locally or run \`gcloud config set project <project-id>\` before deploying.`);
    }
    const hasVisionCredentials = Boolean(ENV.GOOGLE_VISION_API_KEY || ENV.GOOGLE_APPLICATION_CREDENTIALS);
    const runningOnGoogleCloud = Boolean(process.env.FUNCTION_TARGET ||
        process.env.K_SERVICE ||
        process.env.GOOGLE_CLOUD_PROJECT ||
        process.env.GCLOUD_PROJECT);
    if (!hasVisionCredentials && !runningOnGoogleCloud) {
        throw new Error('Vision API credentials missing. Provide GOOGLE_VISION_API_KEY or GOOGLE_APPLICATION_CREDENTIALS when running locally.');
    }
    if (ENV.NODE_ENV === 'production') {
        if (ENV.JWT_SECRET === 'default-secret-change-in-production') {
            throw new Error('JWT_SECRET must be set in production');
        }
    }
}
// Helper functions
export function isDevelopment() {
    return ENV.NODE_ENV === 'development';
}
export function isProduction() {
    return ENV.NODE_ENV === 'production';
}
export function getLogLevel() {
    return ENV.LOG_LEVEL;
}
export function shouldEnableDebugLogging() {
    return ENV.ENABLE_DEBUG_LOGGING || isDevelopment();
}
//# sourceMappingURL=env.js.map