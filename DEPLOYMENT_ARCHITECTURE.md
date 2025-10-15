# PicZFlip Deployment Architecture

## Current Setup

```
┌─────────────────────────────────────────────────────────────┐
│                      GitHub Repository                       │
│                  shawstintshop/PicZFlip                     │
│                                                              │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐    │
│  │   web/     │  │  functions/  │  │  firebase.json  │    │
│  │  (React)   │  │   (Node.js)  │  │   .firebaserc   │    │
│  └────────────┘  └──────────────┘  └─────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Push to main branch
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions                            │
│                (Auto Deploy Workflow)                        │
│                                                              │
│  1. npm run build:functions                                 │
│  2. npm run build:web                                       │
│  3. firebase deploy                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Firebase Project                            │
│                  (piczflip-beta)                            │
│                                                              │
│  ┌────────────────┐         ┌──────────────────┐           │
│  │  Cloud         │         │  Firebase        │           │
│  │  Functions     │◄────────┤  Hosting         │           │
│  │  (Backend API) │         │  (Static Assets) │           │
│  └────────────────┘         └──────────────────┘           │
│                                      │                       │
└──────────────────────────────────────┼───────────────────────┘
                                       │
                                       │
            ┌──────────────────────────┴─────────────────────┐
            │                                                 │
            ▼                                                 ▼
┌───────────────────────┐                    ┌──────────────────────┐
│  Default Firebase URLs│                    │   Custom Domain      │
│                       │                    │                      │
│  piczflip-beta        │                    │  www.piczflip.com   │
│  .web.app             │                    │  piczflip.com       │
│                       │                    │                      │
│  piczflip-beta        │                    │  (Requires DNS      │
│  .firebaseapp.com     │                    │   Configuration)    │
└───────────────────────┘                    └──────────────────────┘
```

## Deployment Flow

### Manual Deployment (from Cursor IDE or Terminal)

```
Developer               Cursor IDE              Firebase
    │                       │                       │
    │  1. Edit code         │                       │
    │──────────────────────>│                       │
    │                       │                       │
    │  2. Run ./deploy.sh   │                       │
    │──────────────────────>│                       │
    │                       │                       │
    │                       │  3. Build app         │
    │                       │  npm run build        │
    │                       │                       │
    │                       │  4. Deploy            │
    │                       │  firebase deploy      │
    │                       │──────────────────────>│
    │                       │                       │
    │                       │  5. Confirm           │
    │                       │<──────────────────────│
    │                       │                       │
    │  ✅ Live!             │                       │
    │<──────────────────────│                       │
```

### Automated Deployment (via GitHub Actions)

```
Developer           GitHub              GitHub Actions         Firebase
    │                  │                      │                    │
    │  1. git push     │                      │                    │
    │─────────────────>│                      │                    │
    │                  │                      │                    │
    │                  │  2. Trigger workflow │                    │
    │                  │─────────────────────>│                    │
    │                  │                      │                    │
    │                  │                      │  3. Checkout code  │
    │                  │                      │  4. Install deps   │
    │                  │                      │  5. Build          │
    │                  │                      │  6. Deploy         │
    │                  │                      │───────────────────>│
    │                  │                      │                    │
    │                  │                      │  7. Success ✅     │
    │                  │                      │<───────────────────│
    │                  │                      │                    │
    │  ✅ Notification │<─────────────────────│                    │
    │<─────────────────│                      │                    │
```

## Custom Domain Setup

### DNS Configuration Required

To point www.piczflip.com to Firebase Hosting:

```
Your Domain Registrar              Firebase Hosting
(GoDaddy, Namecheap, etc.)         (piczflip-beta)
        │                                 │
        │  1. Get DNS instructions        │
        │<────────────────────────────────│
        │                                 │
        │  2. Configure:                  │
        │     A records for root          │
        │     CNAME for www               │
        │     TXT for verification        │
        │                                 │
        │  3. Verify ownership            │
        │────────────────────────────────>│
        │                                 │
        │                                 │  4. Issue SSL cert
        │                                 │
        │  5. DNS propagation             │
        │     (24-48 hours)               │
        │                                 │
        │  6. Site live at custom domain  │
        │<────────────────────────────────│
```

### Required DNS Records

| Type  | Name | Value                              | Purpose           |
|-------|------|------------------------------------|-------------------|
| A     | @    | (IP from Firebase)                | Root domain       |
| CNAME | www  | (domain from Firebase)            | www subdomain     |
| TXT   | @    | (verification from Firebase)      | Domain ownership  |

## Files and Directories

```
PicZFlip/
├── .github/
│   └── workflows/
│       └── deploy-firebase.yml      # Auto-deployment workflow
│
├── web/                             # Frontend React app
│   ├── src/                         # Source code
│   ├── dist/                        # Built files (deployed)
│   └── package.json
│
├── functions/                       # Backend Cloud Functions
│   ├── src/                         # Source code
│   ├── lib/                         # Built files (deployed)
│   └── package.json
│
├── firebase.json                    # Firebase configuration
├── .firebaserc                      # Firebase project settings
├── deploy.sh                        # Deployment helper script
├── DEPLOYMENT.md                    # Detailed deployment guide
├── CURSOR_DEPLOY_GUIDE.md          # Quick guide for Cursor
└── package.json                     # Root package scripts
```

## Deployment Commands Quick Reference

| Command                    | Description                          |
|---------------------------|--------------------------------------|
| `./deploy.sh`             | Interactive deployment wizard        |
| `npm run build`           | Build both web and functions         |
| `npm run deploy`          | Deploy everything to Firebase        |
| `npm run deploy:web`      | Deploy only hosting (web app)        |
| `npm run deploy:functions`| Deploy only Cloud Functions          |
| `firebase login`          | Authenticate with Firebase           |
| `firebase use piczflip-beta` | Select Firebase project           |
| `firebase hosting:channel:deploy preview` | Deploy to preview channel |

## Monitoring and Verification

After deployment, verify at:

1. **Firebase Console**: https://console.firebase.google.com/project/piczflip-beta
   - Hosting dashboard
   - Functions logs
   - Performance metrics

2. **Live URLs**:
   - Default: https://piczflip-beta.web.app
   - Default: https://piczflip-beta.firebaseapp.com
   - Custom: https://www.piczflip.com (after DNS setup)

3. **GitHub Actions**: https://github.com/shawstintshop/PicZFlip/actions
   - Deployment history
   - Build logs
   - Success/failure status

## Security Notes

- Never commit Firebase service account keys to the repository
- Store secrets in GitHub Secrets for automated deployment
- Use environment variables for API keys
- Firebase automatically issues SSL certificates for custom domains
- HTTPS is enforced by default
