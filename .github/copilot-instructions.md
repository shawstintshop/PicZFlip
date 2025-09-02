# PicZFlip - Complete Marketplace Search Engine

PicZFlip is a Firebase-based marketplace search engine with Google Vision AI and Gemini AI integration. It analyzes product photos to identify items and provides comprehensive marketplace research across 200+ platforms.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Prerequisites and Installation
- Node.js 18+ is required
- Firebase CLI must be installed: `npm install -g firebase-tools` (takes 5-10 minutes, NEVER CANCEL)
- Google Cloud account with Vision API enabled
- Gemini AI API access

### Bootstrap and Build Process
1. **Initial setup**: 
   ```bash
   npm run setup
   ```
   - Takes approximately 2.5 minutes to complete. NEVER CANCEL. Set timeout to 5+ minutes.
   - Installs dependencies across root, functions, and web packages
   - May show deprecation warnings - these are normal

2. **Build the entire project**:
   ```bash
   npm run build
   ```
   - Takes approximately 15 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
   - Builds both functions (TypeScript compilation) and web (Vite build)
   - Functions build: ~4 seconds
   - Web build: ~11 seconds with Vite optimization

3. **Build individual components**:
   ```bash
   npm run build:functions  # Functions only - 4 seconds
   npm run build:web        # Web frontend only - 11 seconds
   ```

### Environment Configuration
1. **Copy environment template**:
   ```bash
   cp env.sample .env
   ```

2. **Required environment variables** (edit `.env` file):
   - `GOOGLE_VISION_API_KEY` - Google Vision API key
   - `GEMINI_API_KEY` - Gemini AI API key  
   - `FIREBASE_PROJECT_ID` - Firebase project ID
   - `FIREBASE_PRIVATE_KEY` - Firebase private key
   - `FIREBASE_CLIENT_EMAIL` - Firebase client email

3. **Firebase setup**:
   ```bash
   firebase login
   firebase init
   ```

### Development Commands
- **Start both frontend and backend**:
  ```bash
  npm run dev
  ```
  - Starts Firebase emulators (functions, firestore, storage) on ports 5001, 8080, 9199
  - Starts Vite dev server on port 5173
  - Firebase emulator UI available on port 4000
  - Web dev server starts in ~1 second
  - **NOTE**: Firebase CLI must be installed for backend to work

- **Start components individually**:
  ```bash
  npm run dev:functions  # Backend only - requires Firebase CLI
  npm run dev:web        # Frontend only - works without Firebase CLI
  ```

## Validation and Testing

### Manual Validation Scenarios
After making changes, ALWAYS validate by:

1. **Web Application Validation**:
   - Start the web server: `npm run dev:web`
   - Navigate to `http://localhost:5173/`
   - Verify login screen loads with PicZFlip branding
   - Check console for any critical errors (warnings about Google Fonts are normal)

2. **Build Validation**:
   - Run full build: `npm run build`
   - Ensure both functions and web build successfully
   - Check for TypeScript compilation errors

3. **Environment Validation**:
   - Verify `.env` file exists with required variables
   - Test environment loading: check functions compile without missing env errors

### Linting and Code Quality
- **Functions linting**: 
  ```bash
  cd functions && npm run lint
  ```
  - **WARNING**: ESLint configuration is missing - command will fail
  - No `.eslintrc` file exists in functions directory
  - Use `npm run lint:fix` for auto-fixes when config is available

- **Web linting**:
  ```bash
  cd web && npm run lint
  ```
  - **WARNING**: ESLint configuration is missing - command will fail
  - No `.eslintrc` file exists in web directory
  - Use `npm run lint:fix` for auto-fixes when config is available

### Testing
- **Functions testing**:
  ```bash
  cd functions && npm test
  ```
  - **WARNING**: No test files exist - Jest exits with code 1
  - Uses Jest configuration from package.json
  - Test files should be placed in `__tests__` directories or use `.test.ts/.spec.ts` naming

- **Web testing**:
  ```bash
  cd web && npm test
  ```
  - **WARNING**: No test script exists - command will fail
  - No testing framework is configured for the web app

## Project Structure and Navigation

### Key Directories
```
piczflip/
├── functions/           # Firebase Cloud Functions (Backend)
│   ├── src/
│   │   ├── agents/     # AI agents for different tasks
│   │   ├── adapters/   # Marketplace source adapters  
│   │   ├── lib/        # Core utilities and services
│   │   └── api/        # API endpoints
│   └── package.json
├── web/                # React frontend application
│   ├── src/           # React source code
│   ├── dist/          # Built web assets (created by build)
│   └── package.json
├── firebase.json       # Firebase configuration
├── env.sample         # Environment variable template
└── package.json       # Root package.json with scripts
```

### Important Files to Check After Changes
- **API endpoints**: `functions/src/index.ts` - Main Cloud Functions entry point
- **Environment config**: `functions/src/env.ts` - Environment variable handling
- **Firebase integration**: `functions/src/lib/firestore.ts` - Database operations
- **AI services**: `functions/src/lib/vision.ts`, `functions/src/lib/gemini.ts`
- **Web configuration**: `web/vite.config.ts` - Frontend build and dev server config
- **Frontend entry**: `web/src/main.tsx` - React application entry point

### Known Issues and Workarounds
1. **Missing Agent Implementations**: The orchestrator references agent files that don't exist yet:
   - `identifierAgent`, `categoryRouter`, `searchManager`, etc.
   - These are commented out in the current code to allow building

2. **Missing AdapterManager**: Search functionality references non-existent `AdapterManager`
   - Currently returns placeholder responses

3. **Missing ESLint Configurations**: Both functions and web packages lack ESLint configs
   - Linting commands will fail until configurations are added

4. **No Test Implementations**: Test commands exist but no actual test files
   - Functions: Jest configured but no test files
   - Web: No test script or framework configured

### Build Timing Expectations
- **Setup**: 2.5 minutes (NEVER CANCEL - set 5+ minute timeout)
- **Full build**: 15 seconds (NEVER CANCEL - set 2+ minute timeout)  
- **Functions build**: 4 seconds
- **Web build**: 11 seconds
- **Firebase CLI install**: 5-10 minutes (NEVER CANCEL - set 15+ minute timeout)

### Deployment
- **Deploy everything**: `npm run deploy`
- **Deploy functions only**: `npm run deploy:functions` 
- **Deploy web only**: `npm run deploy:web`

## Technology Stack
- **Backend**: Firebase Cloud Functions (Node.js 20/TypeScript)
- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **AI**: Google Vision API + Gemini AI
- **Database**: Firestore
- **Storage**: Firebase Storage  
- **Authentication**: Firebase Auth
- **Development**: Firebase Emulators

## Common Validation Steps
Before completing any changes:
1. Run `npm run build` to ensure no build errors
2. Start `npm run dev:web` and verify the web app loads
3. Check the login screen displays correctly at `http://localhost:5173/`
4. Verify environment variables are properly configured in `.env`
5. If modifying functions, ensure TypeScript compiles successfully
6. If modifying web frontend, verify Vite build completes without errors

**Always prioritize working functionality over perfect code style given the missing linting configurations.**