# Deployment Guide for PicZFlip

This guide will help you deploy PicZFlip to www.piczflip.com using Firebase Hosting.

## Prerequisites

1. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project Access**: Ensure you have owner/editor access to the `piczflip-beta` Firebase project

3. **Domain Access**: Access to configure DNS records for piczflip.com

## Manual Deployment

### Step 1: Build the Application

```bash
# From the project root
npm run build
```

This will:
- Build the Cloud Functions (backend)
- Build the React web app (frontend)
- Output the web build to `web/dist/`

### Step 2: Login to Firebase

```bash
firebase login
```

Follow the prompts to authenticate with your Google account.

### Step 3: Verify Project Configuration

```bash
firebase projects:list
firebase use piczflip-beta
```

### Step 4: Deploy

Deploy everything (hosting + functions):
```bash
npm run deploy
```

Or deploy specific components:
```bash
# Deploy only hosting (web app)
npm run deploy:web

# Deploy only functions (backend)
npm run deploy:functions
```

## Automated Deployment with GitHub Actions

The repository includes a GitHub Actions workflow that automatically deploys to Firebase when you push to the `main` branch.

### Setup GitHub Actions Deployment

1. **Create a Firebase Service Account**:
   ```bash
   firebase login:ci
   ```
   This will generate a CI token or service account credentials.

2. **Add GitHub Secret**:
   - Go to your GitHub repository settings
   - Navigate to Secrets and Variables > Actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste the service account JSON or CI token
   - Click "Add secret"

3. **Trigger Deployment**:
   - Push to the `main` branch, or
   - Go to Actions tab > Deploy to Firebase > Run workflow

## Custom Domain Configuration (www.piczflip.com)

### Step 1: Add Custom Domain in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `piczflip-beta`
3. Navigate to **Hosting** in the left sidebar
4. Click on **Add custom domain**
5. Enter: `piczflip.com`
6. Follow the wizard to also add: `www.piczflip.com`

### Step 2: Configure DNS Records

Firebase will provide you with DNS records to configure. You'll need to add these records in your domain registrar's DNS settings:

**For the root domain (piczflip.com)**:
- Type: `A`
- Name: `@` (or leave blank)
- Value: (provided by Firebase, typically multiple IP addresses)

**For www subdomain (www.piczflip.com)**:
- Type: `CNAME`
- Name: `www`
- Value: (provided by Firebase, typically ends with `.web.app`)

### Step 3: Verify Domain

1. Add the TXT verification record provided by Firebase
2. Wait for DNS propagation (can take 24-48 hours)
3. Firebase will automatically verify and issue SSL certificates

### Step 4: Set Redirect (Optional)

You can configure Firebase to redirect from `piczflip.com` to `www.piczflip.com` or vice versa in the Firebase Hosting settings.

## Deployment Checklist

- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] Firebase project selected: `piczflip-beta`
- [ ] Code pushed to main branch
- [ ] Build successful (`npm run build`)
- [ ] Functions deployed and working
- [ ] Web app deployed and accessible
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] DNS records verified

## Troubleshooting

### Build Fails

```bash
# Clean install all dependencies
npm run setup

# Try building each component separately
npm run build:functions
npm run build:web
```

### Deployment Fails

```bash
# Check you're logged in
firebase login

# Verify project
firebase use piczflip-beta

# Check Firebase status
firebase projects:list
```

### Domain Not Working

- Verify DNS records are correctly configured
- Wait 24-48 hours for DNS propagation
- Check Firebase Console > Hosting for domain status
- Ensure SSL certificate is active

### Functions Not Working

```bash
# Check function logs
firebase functions:log

# Verify function deployment
firebase functions:list
```

## Quick Deployment from Cursor IDE

If you're working in Cursor IDE and want to deploy:

1. Open the integrated terminal in Cursor
2. Make sure you're in the project root
3. Run the deployment commands:

```bash
# Build and deploy everything
npm run build && npm run deploy

# Or use the shortcut
firebase deploy
```

## Environment-Specific Configuration

### Development
```bash
npm run dev
```

### Staging (if needed)
```bash
# Create a staging channel
firebase hosting:channel:deploy staging
```

### Production
```bash
npm run deploy
```

## Monitoring Deployment

After deployment, monitor your application:

1. **Firebase Console**: Check hosting and function metrics
2. **Cloud Functions Logs**: `firebase functions:log`
3. **Hosting Metrics**: Firebase Console > Hosting
4. **Error Reporting**: Firebase Console > Crashlytics

## Support

For issues or questions:
- Check [Firebase Documentation](https://firebase.google.com/docs)
- Review the [README.md](./README.md) for project-specific details
- Check Firebase Console for status and logs

## Notes

- The default Firebase project is `piczflip-beta` (configured in `.firebaserc`)
- Web app builds to `web/dist/` directory
- Functions build to `functions/lib/` directory
- Hosting configuration is in `firebase.json`
