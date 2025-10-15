# 🚀 Quick Start: Deploy to www.piczflip.com

**Your repository is ready! Follow these simple steps to go live.**

---

## ⚡ 3-Step Deployment from Cursor

### Step 1: Open Terminal in Cursor
Press `` Ctrl+` `` (Windows/Linux) or `` Cmd+` `` (Mac)

### Step 2: Run Deployment Script
```bash
./deploy.sh
```

### Step 3: Follow the Prompts
The script will guide you through:
- Logging into Firebase
- Building your app
- Deploying to Firebase
- Verifying deployment

**That's it! Your site is live at https://piczflip-beta.web.app**

---

## 🌐 Add Custom Domain (www.piczflip.com)

After your first deployment:

### 1. Firebase Console Setup
- Go to: https://console.firebase.google.com/
- Select: `piczflip-beta` project
- Click: **Hosting** (left sidebar)
- Click: **Add custom domain**
- Enter: `piczflip.com` and `www.piczflip.com`
- Copy the DNS records provided

### 2. Configure DNS at Your Domain Registrar
Add these records where you bought your domain (GoDaddy, Namecheap, etc.):

**A Record (for root domain):**
```
Type: A
Name: @
Value: [IPs from Firebase]
```

**CNAME Record (for www):**
```
Type: CNAME
Name: www
Value: [domain from Firebase]
```

**TXT Record (for verification):**
```
Type: TXT
Name: @
Value: [code from Firebase]
```

### 3. Wait for DNS Propagation
- Usually takes 24-48 hours
- Firebase will automatically issue SSL certificate
- Check status in Firebase Console

---

## 🤖 Enable Automated Deployment (Optional but Recommended!)

### 1. Generate Firebase Token
```bash
firebase login:ci
```
Copy the token displayed

### 2. Add to GitHub
- Go to: https://github.com/shawstintshop/PicZFlip/settings/secrets/actions
- Click: **New repository secret**
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: [paste token]
- Click: **Add secret**

**Now every push to `main` automatically deploys!** 🎉

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] You can login: `firebase login`
- [ ] App builds: `npm run build`
- [ ] All changes committed to git

---

## 🆘 Having Issues?

**Firebase CLI not found:**
```bash
npm install -g firebase-tools
```

**Not logged in:**
```bash
firebase login
```

**Build fails:**
```bash
npm run setup  # Reinstall dependencies
npm run build  # Try again
```

**More help:**
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [CURSOR_DEPLOY_GUIDE.md](./CURSOR_DEPLOY_GUIDE.md) - Cursor-specific help

---

## ✅ Verify Your Deployment

After deploying, check:

1. **Default URL**: https://piczflip-beta.web.app
2. **Firebase Console**: https://console.firebase.google.com/project/piczflip-beta/hosting
3. **Custom Domain** (after DNS): https://www.piczflip.com

---

## 💡 Pro Tips

- Test locally first: `npm run dev`
- Use preview channels: `firebase hosting:channel:deploy preview`
- Check logs: `firebase functions:log`
- Monitor in Firebase Console

---

## 🎯 Summary

1. **Deploy**: Run `./deploy.sh` in Cursor terminal
2. **Configure**: Add custom domain in Firebase Console
3. **Update DNS**: Add records at your domain registrar
4. **Wait**: 24-48 hours for DNS propagation
5. **Live**: Your site is at www.piczflip.com! 🚀

**Questions?** Check [DEPLOYMENT_SETUP_COMPLETE.md](./DEPLOYMENT_SETUP_COMPLETE.md)

---

**Ready to go live? Open Cursor and run: `./deploy.sh`**
