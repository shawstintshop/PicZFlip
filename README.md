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

## 🔧 Configuration

### Environment Variables
- `GOOGLE_VISION_API_KEY` - Google Vision API key
- `GEMINI_API_KEY` - Gemini AI API key
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
