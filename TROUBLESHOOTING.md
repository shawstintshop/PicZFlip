# Deployment Troubleshooting Guide

Common issues and solutions when deploying PicZFlip to www.piczflip.com.

## Table of Contents
- [Firebase CLI Issues](#firebase-cli-issues)
- [Build Failures](#build-failures)
- [Deployment Failures](#deployment-failures)
- [Domain Issues](#domain-issues)
- [Function Errors](#function-errors)
- [GitHub Actions Issues](#github-actions-issues)

---

## Firebase CLI Issues

### Error: "firebase: command not found"

**Solution:**
```bash
npm install -g firebase-tools
```

If that doesn't work, try with sudo (on Mac/Linux):
```bash
sudo npm install -g firebase-tools
```

### Error: "Not logged in"

**Solution:**
```bash
firebase login
```

If browser doesn't open:
```bash
firebase login --no-localhost
```

### Error: "Insufficient permissions"

**Solution:**
1. Check you're logged in with the correct account
2. Verify you have Editor or Owner role in the Firebase project
3. Try logging out and back in:
```bash
firebase logout
firebase login
```

---

## Build Failures

### Error: "npm ERR! Missing script: build"

**Solution:**
Make sure you're in the project root directory:
```bash
cd /path/to/PicZFlip
npm run build
```

### Error: "Cannot find module"

**Solution:**
Reinstall dependencies:
```bash
npm run setup
```

Or manually:
```bash
npm install
cd functions && npm install
cd ../web && npm install
```

### Error: TypeScript compilation errors

**Solution:**
```bash
# Clean and rebuild
rm -rf web/dist functions/lib
npm run build
```

### Error: "Out of memory"

**Solution:**
Increase Node.js memory:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

---

## Deployment Failures

### Error: "Error: HTTP Error: 403, Caller does not have permission"

**Solution:**
1. Ensure you're using the correct Firebase project:
```bash
firebase use piczflip-beta
```

2. Check your permissions in Firebase Console
3. Try re-authenticating:
```bash
firebase logout
firebase login
```

### Error: "Failed to load function definition from source"

**Solution:**
Make sure functions are built:
```bash
npm run build:functions
```

Check that `functions/lib/` directory exists and contains JavaScript files.

### Error: "Hosting: HTTP Error: 404, Unable to find project"

**Solution:**
Verify `.firebaserc` contains correct project ID:
```bash
cat .firebaserc
```

Should show:
```json
{
  "projects": {
    "default": "piczflip-beta"
  }
}
```

### Error: "Build script failed"

**Solution:**
Check `firebase.json` predeploy scripts:
```bash
# Test the predeploy commands manually
npm --prefix functions run build
npm --prefix web run build
```

---

## Domain Issues

### Domain not connecting

**Checklist:**
1. Verify DNS records are correct in domain registrar
2. Wait 24-48 hours for DNS propagation
3. Check domain status in Firebase Console → Hosting
4. Use online DNS checker: https://dnschecker.org

### Error: "SSL certificate not issued"

**Solution:**
1. Ensure domain is verified in Firebase Console
2. Wait up to 24 hours for certificate issuance
3. Check that DNS records point to correct Firebase IPs
4. Verify domain status shows "Connected"

### Site shows "Site not found"

**Solution:**
1. Check that web app is built and deployed:
```bash
ls -la web/dist/
firebase deploy --only hosting
```

2. Verify hosting configuration in `firebase.json`:
```json
{
  "hosting": {
    "public": "web/dist",
    ...
  }
}
```

### Wrong content showing on custom domain

**Solution:**
Clear browser cache or try incognito mode. Firebase CDN may take a few minutes to update.

---

## Function Errors

### Functions not triggering

**Solution:**
1. Check functions are deployed:
```bash
firebase functions:list
```

2. View function logs:
```bash
firebase functions:log
```

3. Test function endpoints directly

### Error: "Function execution took too long"

**Solution:**
1. Check function timeout settings in Firebase Console
2. Optimize function code
3. Consider breaking into smaller functions

### Error: "Vision API not enabled"

**Solution:**
1. Enable Vision API in Google Cloud Console
2. Grant permissions to Firebase service account
3. Set API keys in environment variables

---

## GitHub Actions Issues

### Workflow not triggering

**Solution:**
1. Check `.github/workflows/deploy-firebase.yml` exists
2. Verify it's on the `main` branch
3. Check workflow is enabled in GitHub Actions tab

### Error: "FIREBASE_SERVICE_ACCOUNT secret not found"

**Solution:**
1. Generate Firebase CI token:
```bash
firebase login:ci
```

2. Add to GitHub:
   - Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: (token from step 1)

### Build fails in GitHub Actions but works locally

**Solution:**
1. Check Node.js version matches (should be 18)
2. Verify all dependencies are in package.json (not globally installed)
3. Check for environment-specific code
4. Review Actions logs for specific errors

### Deployment succeeds but site doesn't update

**Solution:**
1. Check that build artifacts are being created
2. Verify cache isn't causing issues (clear browser cache)
3. Check Firebase Console for deployment timestamp
4. Wait a few minutes for CDN to update

---

## General Debugging

### Check deployment status

```bash
# List recent deployments
firebase hosting:channel:list

# Check current site
firebase hosting:sites:list
```

### View logs

```bash
# Function logs
firebase functions:log

# Hosting logs (in Firebase Console)
# Console → Hosting → View logs
```

### Test locally before deploying

```bash
# Build and serve locally
npm run build
firebase serve
```

Then visit http://localhost:5000

### Compare with working deployment

```bash
# See what's currently deployed
firebase hosting:channel:list

# Clone to compare
git log --oneline
```

---

## Emergency Rollback

If you need to quickly rollback a broken deployment:

```bash
# Option 1: Redeploy previous commit
git log --oneline -10  # Find previous working commit
git checkout <commit-hash>
npm run build
npm run deploy

# Option 2: Use Firebase console
# Console → Hosting → Release history → Rollback
```

---

## Getting Help

If none of these solutions work:

1. **Check Firebase Status**: https://status.firebase.google.com/
2. **Firebase Documentation**: https://firebase.google.com/docs
3. **Stack Overflow**: Tag your question with `firebase` and `firebase-hosting`
4. **GitHub Issues**: Create an issue in the repository
5. **Firebase Support**: https://firebase.google.com/support

---

## Useful Commands

```bash
# Check versions
node --version
npm --version
firebase --version

# Project info
firebase projects:list
firebase use

# Deployment info
firebase hosting:channel:list
firebase functions:list

# Logs
firebase functions:log --limit 50

# Local testing
firebase emulators:start
firebase serve

# Force fresh deploy
rm -rf web/dist functions/lib .firebase
npm run build
npm run deploy
```

---

## Contact

For urgent issues, contact the project maintainer or check the Firebase Console for real-time status.
