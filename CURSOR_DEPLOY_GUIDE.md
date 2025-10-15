# Quick Deployment Guide for Cursor IDE Users

This guide helps you deploy PicZFlip to www.piczflip.com directly from Cursor IDE.

## Prerequisites Check

Open the integrated terminal in Cursor (`` Ctrl+` `` or `Cmd+``) and verify:

```bash
# Check Node.js version (should be 18+)
node --version

# Check if Firebase CLI is installed
firebase --version

# If not installed, install it:
npm install -g firebase-tools
```

## Step-by-Step Deployment

### 1. Build the Application

In Cursor's terminal, run:

```bash
npm run build
```

This builds both the web app and cloud functions.

### 2. Login to Firebase

```bash
firebase login
```

This will open a browser window for authentication.

### 3. Verify Project

```bash
firebase use piczflip-beta
```

### 4. Deploy

**Option A: Use the deployment script (Recommended)**
```bash
./deploy.sh
```

**Option B: Manual deployment**
```bash
# Deploy everything
npm run deploy

# Or deploy just the web app
npm run deploy:web

# Or deploy just the functions
npm run deploy:functions
```

## First-Time Custom Domain Setup

### In Firebase Console:

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: `piczflip-beta`
3. Go to **Hosting** in the left menu
4. Click **Add custom domain**
5. Enter: `piczflip.com`
6. Click **Continue** and follow the wizard
7. Repeat for `www.piczflip.com`

### Configure DNS:

Firebase will show you DNS records to add. Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add:

**For piczflip.com:**
- Type: `A`
- Name: `@`
- Value: (IPs provided by Firebase)

**For www.piczflip.com:**
- Type: `CNAME`
- Name: `www`
- Value: (domain provided by Firebase)

**Verification TXT record:**
- Type: `TXT`
- Name: `@`
- Value: (verification code from Firebase)

⏱️ DNS changes can take up to 48 hours to propagate.

## Continuous Deployment (Automated)

To enable automatic deployment when you push code to GitHub:

1. Generate a Firebase CI token:
   ```bash
   firebase login:ci
   ```

2. Copy the token that's generated

3. Add it to GitHub:
   - Go to your GitHub repo: https://github.com/shawstintshop/PicZFlip
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: (paste the token)
   - Save

Now every push to the `main` branch will automatically deploy!

## Verification

After deployment, check:

1. **Default Firebase URL**: https://piczflip-beta.web.app
2. **Custom domain** (after DNS setup): https://www.piczflip.com
3. **Firebase Console**: https://console.firebase.google.com/project/piczflip-beta/hosting

## Common Issues

### "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### "Not logged in"
```bash
firebase login
```

### "Build fails"
```bash
# Reinstall dependencies
npm run setup

# Clear and rebuild
rm -rf web/dist functions/lib
npm run build
```

### "Domain not working"
- Check DNS records are correct
- Wait 24-48 hours for DNS propagation
- Verify in Firebase Console → Hosting

## Quick Reference

| Command | Description |
|---------|-------------|
| `./deploy.sh` | Interactive deployment wizard |
| `npm run build` | Build everything |
| `npm run deploy` | Deploy everything |
| `npm run deploy:web` | Deploy web app only |
| `npm run deploy:functions` | Deploy backend only |
| `firebase login` | Authenticate with Firebase |
| `firebase use piczflip-beta` | Select project |
| `firebase hosting:channel:deploy preview` | Deploy to preview channel |

## Need More Help?

See the complete [DEPLOYMENT.md](./DEPLOYMENT.md) guide for detailed instructions.
