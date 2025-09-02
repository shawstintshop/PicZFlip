# PicZFlip - Complete Marketplace Search Engine

PicZFlip is a Firebase-based marketplace search engine with AI-powered item identification. It consists of Firebase Cloud Functions (Node.js/TypeScript backend) and a React frontend that analyzes photos to identify items and search 200+ marketplace sources.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites and Setup
- Node.js 18+ is required (tested with 20.19.4)
- Firebase CLI is required for development server and deployment (see installation notes below)
- Google Cloud account with Vision API enabled for full functionality

### Bootstrap and Build Process
Run these commands in sequence to set up the development environment:

1. **Install all dependencies**:
   ```bash
   npm run setup
   ```
   - Takes approximately 90 seconds to complete. NEVER CANCEL.
   - Installs root dependencies, then functions dependencies, then web dependencies
   - May show deprecation warnings - these are expected and safe to ignore
   - Set timeout to 5+ minutes to be safe

2. **Build the entire project**:
   ```bash
   npm run build
   ```
   - Takes approximately 15 seconds total. NEVER CANCEL.
   - Set timeout to 2+ minutes to be safe
   - Builds both functions and web components sequentially

3. **Build functions only**:
   ```bash
   npm run build:functions
   ```
   - Takes approximately 4 seconds. TypeScript compilation.
   - Set timeout to 1+ minute to be safe

4. **Build web only**:
   ```bash
   npm run build:web
   ```
   - Takes approximately 11 seconds. Vite build process.
   - Set timeout to 2+ minutes to be safe

### Development Servers

#### Web Development Server (Always Works)
```bash
cd web && npm run dev
```
- Starts Vite development server on http://localhost:5173/
- Ready in under 1 second
- ALWAYS run this for frontend development
- Does not require Firebase CLI or backend functions

#### Full Development with Firebase Emulator (Requires Firebase CLI)
```bash
npm run dev
```
- Starts both frontend (web) and backend (functions) with Firebase emulator
- Frontend runs on http://localhost:5173/
- Functions run on http://localhost:5001/
- Firebase UI on http://localhost:4000/
- **REQUIRES Firebase CLI to be installed first**

### Firebase CLI Installation
**CRITICAL**: Firebase CLI installation can be problematic due to network timeouts:

```bash
# Method 1: Try npm global install (may timeout)
npm install -g firebase-tools

# Method 2: If global install fails, try standalone installer
curl -sL https://firebase.tools | bash

# Method 3: If both fail, install locally in project
npm install firebase-tools --no-save
```

**Installation Issues**:
- Firebase CLI installation frequently times out due to large package size
- If installation fails, document the limitation and proceed with web-only development
- Always set timeout to 15+ minutes for Firebase CLI installation. NEVER CANCEL.

### Testing

#### Functions Tests
```bash
cd functions && npm test
```
- **Currently no tests exist** - Jest finds 0 test matches
- The test runner is configured but no test files are present
- This is expected - do not add test infrastructure unless specifically required

#### Web Tests
```bash
cd web && npm test
```
- **Test script does not exist** in web package.json
- No testing framework is configured for the frontend
- This is expected - do not add test infrastructure unless specifically required

#### Integration Tests
```bash
npm run test:integration
```
- **Script does not exist** - this is mentioned in README but not implemented
- Do not attempt to run this command

### Linting

#### Functions Linting
```bash
cd functions && npm run lint
```
- **ESLint configuration missing** - will fail with "couldn't find a configuration file"
- Do not run this command - linting is not properly configured
- Do not add ESLint configuration unless specifically required

#### Web Linting
```bash
cd web && npm run lint
```
- **ESLint configuration missing** - will fail with "couldn't find a configuration file"
- Do not run this command - linting is not properly configured
- Do not add ESLint configuration unless specifically required

### Environment Configuration

1. **Copy environment template**:
   ```bash
   cp env.sample .env
   ```

2. **Required environment variables** (functions will fail without these):
   - `GOOGLE_VISION_API_KEY` - Google Vision API key
   - `GEMINI_API_KEY` - Gemini AI API key  
   - `FIREBASE_PROJECT_ID` - Firebase project ID

3. **Environment file location**: Root directory (not in functions/ or web/)

## Validation

### Manual Testing Requirements
After making changes, ALWAYS test the application functionality:

1. **Start the web development server**:
   ```bash
   cd web && npm run dev
   ```

2. **Access the application** at http://localhost:5173/

3. **Test core functionality**:
   - Navigation loads without errors
   - UI components render correctly
   - Firebase connection works (if backend is running)
   - Photo upload interface is accessible
   - No console errors in browser

4. **For backend changes**, if Firebase CLI is available:
   - Start full development environment: `npm run dev`
   - Test API endpoints work
   - Verify Firebase emulator connectivity

### Build Validation
ALWAYS run build validation before committing:
```bash
npm run build
```
- Must complete without errors
- Both functions and web builds must succeed
- Takes ~15 seconds total

## Repository Navigation

### Key Directories
```
piczflip/
├── functions/           # Firebase Cloud Functions (Backend)
│   ├── src/
│   │   ├── agents/     # AI agents for different tasks
│   │   ├── adapters/   # Marketplace source adapters
│   │   ├── lib/        # Core utilities and services
│   │   ├── api/        # API endpoints (handled in index.ts)
│   │   └── index.ts    # Main functions entry point
│   └── package.json
├── web/                # React frontend application
│   ├── src/            # React source code
│   └── package.json
├── firebase.json       # Firebase configuration
├── env.sample          # Environment template
└── package.json        # Root package.json with scripts
```

### Important Files to Check After Changes
- **functions/src/index.ts** - Main API endpoints and function exports
- **functions/src/env.ts** - Environment configuration and validation
- **functions/src/lib/sourceRegistry.ts** - When adding new marketplace sources
- **web/src/** - Frontend React components
- **firebase.json** - Firebase deployment and emulator configuration

### Common Development Patterns
- **Adding marketplace sources**: Create adapter in `functions/src/adapters/categories/{category}/{source}.ts`
- **API changes**: Modify `functions/src/index.ts`
- **Environment changes**: Update `functions/src/env.ts` and `env.sample`
- **Frontend changes**: Work in `web/src/` directory

## Time Expectations and Timeouts

**CRITICAL TIMEOUT SETTINGS**:
- `npm run setup`: Set timeout to 5+ minutes (takes ~90 seconds)
- `npm run build`: Set timeout to 2+ minutes (takes ~15 seconds)
- `npm run build:functions`: Set timeout to 1+ minute (takes ~4 seconds)  
- `npm run build:web`: Set timeout to 2+ minutes (takes ~11 seconds)
- Firebase CLI installation: Set timeout to 15+ minutes (frequently times out)
- `npm run dev`: Set timeout to 2+ minutes to start both servers

**NEVER CANCEL** any build or setup commands. Always wait for completion.

## Known Limitations

1. **Firebase CLI Installation**: Frequently fails due to network timeouts
2. **Linting**: ESLint configuration missing - commands will fail
3. **Testing**: No test files exist - test commands will fail or report 0 tests
4. **Integration Tests**: Script referenced in README but not implemented
5. **Environment Requirements**: Full functionality requires Google Cloud API keys

## Troubleshooting

- **"firebase: command not found"**: Firebase CLI not installed - use web-only development
- **ESLint configuration errors**: Linting not configured - skip linting commands
- **No tests found**: Expected - no test files exist in the project
- **API connection errors**: Check environment variables in .env file
- **Build timeouts**: Increase timeout settings - builds may take longer than expected

## Quick Reference Commands

| Task | Command | Time | Notes |
|------|---------|------|-------|
| Setup | `npm run setup` | ~90s | NEVER CANCEL, 5min timeout |
| Build All | `npm run build` | ~15s | NEVER CANCEL, 2min timeout |
| Dev Web Only | `cd web && npm run dev` | <1s | Always works |
| Dev Full Stack | `npm run dev` | ~10s | Requires Firebase CLI |
| Build Functions | `npm run build:functions` | ~4s | TypeScript compilation |
| Build Web | `npm run build:web` | ~11s | Vite build |

Always start with `npm run setup` then `npm run build` to verify the environment works correctly.