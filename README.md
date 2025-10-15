# PicZFlip - Complete Marketplace Search Engine

> **The most comprehensive item identification and marketplace research platform. Searches 200+ websites with modular, bulletproof architecture.**

## 🚀 Core Features

- **AI-Powered Item Identification** - Take a photo, get instant item recognition
- **200+ Marketplace Sources** - Comprehensive coverage across all categories
- **Smart Category Routing** - Intelligent source selection by item type
- **Real-Time Price Analysis** - Market data from hundreds of sources
- **Ready-to-Use Copy** - Professional selling descriptions generated automatically
- **Inventory Management** - Track your complete flip inventory
- **Fault-Tolerant Design** - One broken source won't crash the system

## 🏗️ Architecture

### Core Flow
1. **Photo Upload** → AI identifies item + category
2. **Smart Routing** → System selects relevant sources from 200+ database
3. **Comprehensive Search** → Searches all relevant marketplaces simultaneously
4. **Results Aggregation** → Combines data from all sources
5. **Price Analysis** → Market trends, competitor analysis, valuation
6. **Copy Generation** → Ready-to-post selling descriptions
7. **Inventory Tracking** → Complete flip history and analytics

### Design Principles
- **Modular Agents** - Each agent is independent and replaceable
- **Category-Based Routing** - Smart source selection by item type
- **Fault Tolerance** - One broken adapter doesn't crash the system
- **Extensible Design** - Add new sources without touching core code

## 📁 Project Structure

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
├── firebase.json       # Firebase configuration
└── package.json        # Root package.json
```

## 🛠️ Technology Stack

- **Backend**: Firebase Cloud Functions (Node.js/TypeScript)
- **Frontend**: React + TypeScript + Tailwind CSS
- **AI**: Google Vision API + Gemini AI
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI
- Google Cloud account with Vision API enabled

### Configure Google Cloud Vision API
1. Enable the **Cloud Vision API** for your Google Cloud project in the [Google Cloud Console](https://console.cloud.google.com/apis/library/vision.googleapis.com).
2. Grant the Firebase project's runtime service account (e.g. `firebase-adminsdk-xxxx@<project-id>.iam.gserviceaccount.com`) the **Cloud Vision API User** role in the [IAM console](https://console.cloud.google.com/iam-admin/iam). This lets deployed Cloud Functions use Vision without additional keys.
3. For local development you can either download a service account key JSON and set `GOOGLE_APPLICATION_CREDENTIALS` to its path, or create an API key and set `GOOGLE_VISION_API_KEY`.
4. Deploying from CI? Store the local credentials in your secret manager and expose them as environment variables during the deploy step.

### Installation

1. **Clone and setup**
   ```bash
   git clone <repository>
   cd piczflip
   npm run setup
   ```

2. **Environment setup**
   ```bash
   cp .env.sample .env
   # Edit .env with your API keys
   ```

3. **Firebase setup**
   ```bash
   firebase login
   firebase init
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

### Development Commands

- `npm run dev` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Firebase
- `npm run dev:functions` - Backend only
- `npm run dev:web` - Frontend only

## 🌐 Deployment to www.piczflip.com

### Quick Deploy
```bash
# Simple deployment script
./deploy.sh
```

### Manual Deploy
```bash
# Build and deploy everything
npm run build
npm run deploy

# Or deploy specific components
npm run deploy:web      # Web app only
npm run deploy:functions # Backend only
```

### Automated Deployment
The repository includes GitHub Actions for automatic deployment on push to `main` branch.
Setup instructions in [DEPLOYMENT.md](./DEPLOYMENT.md).

### Custom Domain Setup
1. Go to [Firebase Console](https://console.firebase.google.com/) → Hosting
2. Click "Add custom domain" and enter `piczflip.com` and `www.piczflip.com`
3. Follow Firebase instructions to configure DNS records at your domain registrar
4. Wait for DNS propagation (up to 48 hours) and SSL certificate issuance

📖 **Detailed deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

> **Cloud deployment tip:** When deploying from Google Cloud Shell or CI, be sure the gcloud CLI is pointed at the correct
> Firebase project. Run `gcloud config set project <project-id>` (or `firebase use <project-id>`) before `npm run deploy`
> so the latest analyzer code is uploaded instead of the old cached build.

## 🔧 Configuration

### Environment Variables
- `GOOGLE_VISION_API_KEY` - Google Vision API key
- `GEMINI_API_KEY` - Gemini AI API key
- `GROK_API_KEY` - Grok AI API key (optional)
- `FIREBASE_PROJECT_ID` - Firebase project ID

### Marketplace Sources
The system includes 200+ pre-configured marketplace sources across:
- **General**: eBay, Amazon, Walmart, Mercari, Bonanza
- **Clothing**: Poshmark, Depop, Grailed, The RealReal
- **Antiques**: LiveAuctioneers, Invaluable, WorthPoint
- **Electronics**: Swappa, Gazelle, Decluttr
- **Books**: AbeBooks, Alibris, Biblio
- **Automotive**: Bring a Trailer, Cars & Bids
- **Local**: Craigslist, Facebook Marketplace, KSL
- **Specialty**: Discogs, Reverb, and many more

## 📊 API Endpoints

- `POST /api/analyze` - Start photo analysis
- `GET /api/analysis/{id}` - Get analysis results
- `GET /api/analyses` - User's analysis history
- `GET /api/sources` - Available marketplace sources

## 🔌 Adding New Sources

1. **Create adapter** in `functions/src/adapters/categories/{category}/{source}.ts`
2. **Extend base classes** for consistent behavior
3. **Add to registry** in `functions/src/lib/sourceRegistry.ts`
4. **Test thoroughly** with various item types

## 🧪 Testing

```bash
# Test functions
cd functions && npm test

# Test web app
cd web && npm test

# Integration tests
npm run test:integration
```

## 🤖 AI Integration

PicZFlip supports multiple AI providers for product analysis:

### Gemini AI (Default)
- Set `GEMINI_API_KEY` in your environment
- Integrated via `functions/src/lib/gemini.ts`

### Grok AI (Experimental)
- Set `GROK_API_KEY` in your environment
- Integrated via `functions/src/lib/grok.ts`
- For experimentation, use the Jupyter notebook at `notebooks/grok_integration.ipynb`

To install Grok dependencies:
```bash
pip install -r requirements.txt
pip install git+https://github.com/shawstintshop/grok-xai.git
```

To use the Grok notebook:
```bash
jupyter notebook notebooks/grok_integration.ipynb
```

## 📈 Performance

- **Concurrent Processing** - Multiple sources searched simultaneously
- **Rate Limiting** - Respects each source's limits
- **Caching** - Adapter and result caching for speed
- **Fault Tolerance** - Failed sources don't block others

## 🚨 Error Handling

- **Stage-level errors** - Each analysis stage is isolated
- **Adapter errors** - Failed sources are logged and skipped
- **Retry logic** - Automatic retry for transient failures
- **Comprehensive logging** - Full error tracking and monitoring

## 📱 Mobile Support

- **Responsive design** - Works on all device sizes
- **Progressive Web App** - Installable on mobile devices
- **Touch-optimized** - Camera and photo handling
- **Offline support** - Basic functionality without internet

## 🔒 Security

- **Firebase Auth** - Secure user authentication
- **API key protection** - Keys stored securely in environment
- **Rate limiting** - Prevents abuse and respects source limits
- **Input validation** - All user inputs are sanitized

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide with step-by-step instructions
- **[CURSOR_DEPLOY_GUIDE.md](./CURSOR_DEPLOY_GUIDE.md)** - Quick deployment guide for Cursor IDE users
- **[DEPLOYMENT_ARCHITECTURE.md](./DEPLOYMENT_ARCHITECTURE.md)** - System architecture and deployment flow diagrams
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre and post-deployment verification checklist
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[GROK_INTEGRATION.md](./GROK_INTEGRATION.md)** - Grok AI integration guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
- **Discord**: [Community Server](link-to-discord)

---

**PicZFlip** - Your complete marketplace research solution. From photo to profit in minutes.
