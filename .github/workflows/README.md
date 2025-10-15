# GitHub Actions Workflows

This directory contains automated workflows for the PicZFlip project.

## deploy-firebase.yml

Automatically deploys the PicZFlip application to Firebase Hosting when changes are pushed to the `main` branch.

### What it does:

1. Checks out the code
2. Sets up Node.js 18
3. Installs dependencies for root, functions, and web
4. Builds the Cloud Functions
5. Builds the React web application
6. Deploys to Firebase Hosting

### Setup Requirements:

To enable this workflow, you need to add a Firebase service account to GitHub Secrets:

1. Generate a Firebase CI token:
   ```bash
   firebase login:ci
   ```

2. Add the token to GitHub:
   - Go to repository Settings
   - Navigate to Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: (paste the token from step 1)
   - Click "Add secret"

### Manual Trigger:

You can also manually trigger this workflow:
1. Go to the Actions tab in GitHub
2. Select "Deploy to Firebase"
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

### Monitoring:

View deployment status and logs in the [Actions tab](https://github.com/shawstintshop/PicZFlip/actions).
