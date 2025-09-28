# Firebase AI Logic Setup Guide

## Overview

PicZFlip has been updated to use Firebase AI Logic with Gemini API as the primary AI service, with automatic fallback to direct Gemini API integration for backward compatibility.

## Prerequisites

1. **Firebase Project Setup**
   - Sign into the [Firebase Console](https://console.firebase.google.com/)
   - Select or create your Firebase project (`piczflip-beta`)

2. **Firebase AI Logic Configuration**
   - Go to the Firebase AI Logic page in the console
   - Click "Get started" to launch the guided setup
   - Select "Gemini Developer API" provider (recommended for development)
   - Follow the on-screen instructions to enable required APIs

## Implementation

### 1. Web App (Frontend)

The web application has been updated to include Firebase AI Logic SDK:

```typescript
// web/src/config/firebase.ts
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';

// Initialize Firebase AI Logic with Gemini Developer API
export const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create Gemini model instance
export const geminiModel = getGenerativeModel(ai, { model: "gemini-2.0-flash-exp" });
```

### 2. Cloud Functions (Backend)

The functions have been updated with a new Firebase AI service that provides:

- **Primary**: Firebase AI Logic integration (`FirebaseAIService`)
- **Fallback**: Direct Gemini API integration (`GeminiService`)
- **Automatic**: Smart fallback if Firebase AI Logic is not available

```typescript
// functions/src/lib/firebaseAI.ts
export class FirebaseAIService {
  // Full Firebase AI Logic implementation
  async analyzeProduct(imageBuffer: Buffer, visionResult: VisionAnalysisResult): Promise<FirebaseAIAnalysisResult>
  async generateListingContent(analysis: FirebaseAIAnalysisResult, platform: string): Promise<ListingContent>
}
```

### 3. Identifier Agent Updates

The core identifier agent now uses intelligent AI service selection:

```typescript
// functions/src/agents/core/identifierAgent.ts
async function getAIService() {
  // Try Firebase AI Logic first
  if (useFirebaseAI && !firebaseAIService) {
    try {
      const { getFirebaseAIService } = await import('../../lib/firebaseAI.js');
      firebaseAIService = getFirebaseAIService();
      return firebaseAIService;
    } catch (error) {
      // Fallback to direct Gemini
      useFirebaseAI = false;
    }
  }
  
  // Use direct Gemini as fallback
  const { getGeminiService } = await import('../../lib/gemini.js');
  geminiService = getGeminiService();
  return geminiService;
}
```

## Environment Variables

Ensure these environment variables are set:

```bash
# Gemini API Key (required)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud Vision API
GOOGLE_VISION_API_KEY=your_vision_api_key_here
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json

# Firebase Project Configuration
FIREBASE_PROJECT_ID=piczflip-beta
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

## Key Features

### 1. **Seamless Migration**
- No breaking changes to existing API endpoints
- Automatic fallback ensures continuous operation
- Maintains backward compatibility

### 2. **Enhanced Analysis**
- Utilizes Firebase AI Logic for better integration
- Improved error handling and logging
- Real-time model switching based on availability

### 3. **Community Integration**
- Works with existing community marketplace features
- Supports platform-specific listing generation
- Integrates with FLIP button and community services

## Deployment Steps

1. **Update Dependencies**
   ```bash
   cd web && npm install firebase@latest
   cd functions && npm install firebase@latest
   ```

2. **Build Applications**
   ```bash
   cd web && npm run build
   cd functions && npm run build
   ```

3. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

## Testing

### Manual Testing
1. Upload an image to PicZFlip
2. Check console logs for "Using Firebase AI Logic" or "Using direct Gemini AI"
3. Verify analysis results include comprehensive product information
4. Test community features and listing generation

### Monitoring
- Firebase Functions logs will show which AI service is being used
- Error logs will indicate any fallback scenarios
- Performance metrics available in Firebase Console

## Benefits of Firebase AI Logic

1. **Better Integration**: Native Firebase service integration
2. **Improved Reliability**: Built-in retry logic and error handling
3. **Cost Optimization**: Firebase's request optimization
4. **Security**: API keys managed through Firebase project settings
5. **Monitoring**: Built-in analytics and logging

## Troubleshooting

### Common Issues

1. **Firebase AI Logic Not Available**
   - The system automatically falls back to direct Gemini API
   - Check Firebase Console for AI Logic availability in your region
   - Verify Gemini API key is properly configured

2. **API Rate Limits**
   - Firebase AI Logic provides better rate limit management
   - Monitor usage in Firebase Console
   - Consider upgrading to Blaze plan for production use

3. **Model Errors**
   - Check that `gemini-2.0-flash-exp` model is available
   - System falls back to previous working models automatically
   - Error details logged for debugging

### Debug Mode
Enable detailed logging by setting:
```bash
NODE_ENV=development
```

This provides comprehensive logs for AI service selection and execution.

## Migration Complete ✅

The PicZFlip application now successfully uses Firebase AI Logic as the primary AI service while maintaining full backward compatibility with the existing Gemini integration. The system will automatically choose the best available service and provide detailed logging for monitoring and debugging.