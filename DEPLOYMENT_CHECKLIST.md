# Pre-Deployment Checklist

Use this checklist before deploying PicZFlip to production at www.piczflip.com.

## Pre-Flight Checks

### Code Quality
- [ ] All changes committed to Git
- [ ] Code reviewed and tested locally
- [ ] No console errors in browser developer tools
- [ ] All tests passing (if applicable)
- [ ] Linting passes without errors

### Environment Setup
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged into Firebase (`firebase login`)
- [ ] Correct project selected (`firebase use piczflip-beta`)
- [ ] All environment variables configured
- [ ] API keys are valid and have proper quotas

### Build Verification
- [ ] Functions build successfully (`npm run build:functions`)
- [ ] Web app builds successfully (`npm run build:web`)
- [ ] No build warnings or errors
- [ ] Built files exist in `web/dist/` and `functions/lib/`

### Configuration Files
- [ ] `firebase.json` is valid
- [ ] `.firebaserc` points to correct project (piczflip-beta)
- [ ] `web/dist/` directory exists and contains built files
- [ ] Security rules configured (firestore.rules, storage.rules)

## Deployment Steps

### Manual Deployment
- [ ] Run `./deploy.sh` or `npm run deploy`
- [ ] Verify deployment completes without errors
- [ ] Check Firebase Console for successful deployment

### Automated Deployment (GitHub Actions)
- [ ] GitHub secret `FIREBASE_SERVICE_ACCOUNT` is configured
- [ ] Workflow file `.github/workflows/deploy-firebase.yml` exists
- [ ] Push to `main` branch triggers deployment
- [ ] Check Actions tab for deployment status

## Post-Deployment Verification

### Functionality Tests
- [ ] Site loads at default Firebase URL (https://piczflip-beta.web.app)
- [ ] Home page displays correctly
- [ ] User authentication works (login/signup)
- [ ] Photo upload functionality works
- [ ] Analysis process completes successfully
- [ ] Results display properly
- [ ] History page shows past analyses
- [ ] Profile page loads

### Performance
- [ ] Page load time is acceptable (<3 seconds)
- [ ] Images load properly
- [ ] No broken links or 404 errors
- [ ] Mobile responsive design works
- [ ] Browser console shows no errors

### Backend/Functions
- [ ] Cloud Functions are deployed and responding
- [ ] API endpoints return expected responses
- [ ] Firebase Authentication is working
- [ ] Firestore database is accessible
- [ ] Storage bucket is accessible
- [ ] Vision API integration works

## Custom Domain Setup (www.piczflip.com)

### Firebase Configuration
- [ ] Custom domain added in Firebase Console
- [ ] DNS records obtained from Firebase
- [ ] Domain verification initiated

### DNS Configuration (at Domain Registrar)
- [ ] A record added for root domain (@)
  - Type: A
  - Name: @
  - Value: (IP addresses from Firebase)
- [ ] CNAME record added for www
  - Type: CNAME
  - Name: www
  - Value: (domain from Firebase)
- [ ] TXT record added for verification
  - Type: TXT
  - Name: @
  - Value: (verification code from Firebase)

### Domain Verification
- [ ] DNS records saved at registrar
- [ ] Waited 24-48 hours for propagation
- [ ] Domain status shows "Connected" in Firebase Console
- [ ] SSL certificate issued by Firebase
- [ ] Site accessible at https://www.piczflip.com
- [ ] HTTPS redirect working (http → https)
- [ ] Root domain redirects to www (or vice versa as configured)

## Monitoring Setup

### Firebase Console
- [ ] Hosting metrics dashboard reviewed
- [ ] Functions logs configured for errors
- [ ] Firestore usage within limits
- [ ] Storage usage within limits
- [ ] Authentication methods enabled

### Error Monitoring
- [ ] Error tracking configured (if using Sentry or similar)
- [ ] Email alerts set up for critical errors
- [ ] Function timeout alerts configured
- [ ] Database quota alerts configured

### Analytics (Optional)
- [ ] Google Analytics configured (if desired)
- [ ] Custom events tracked
- [ ] Conversion funnels set up

## Documentation

- [ ] README.md updated with deployment info
- [ ] DEPLOYMENT.md reviewed and accurate
- [ ] CURSOR_DEPLOY_GUIDE.md accessible to team
- [ ] Team members have access to Firebase project
- [ ] Deployment credentials securely stored

## Rollback Plan

- [ ] Previous version documented
- [ ] Rollback procedure tested
- [ ] Database backup available
- [ ] Contact information for emergency support

## Final Verification

- [ ] Site live at www.piczflip.com
- [ ] All features working as expected
- [ ] Performance metrics acceptable
- [ ] No critical errors in logs
- [ ] Team notified of successful deployment

## Notes

Date: _______________
Deployed by: _______________
Version/Commit: _______________
Issues encountered: _______________
Resolution time: _______________

---

## Quick Rollback (If Needed)

If something goes wrong:

```bash
# View deployment history
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:channel:deploy previous-version

# Or redeploy from a previous commit
git checkout <previous-commit>
npm run build
npm run deploy
```

## Support Contacts

- Firebase Support: https://firebase.google.com/support
- Repository: https://github.com/shawstintshop/PicZFlip
- Documentation: See DEPLOYMENT.md

---

**Remember**: Always test in a staging environment first when possible!
