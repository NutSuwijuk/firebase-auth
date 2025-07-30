# 🚀 Firebase Functions Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. **Project Configuration**
- [ ] Project ID updated in `.firebaserc` → `basic-firebase-80425`
- [ ] Project ID updated in `functions/index.js` → `basic-firebase-80425`
- [ ] Firebase project exists and is accessible

### 2. **LINE OAuth Configuration**
- [ ] LINE Channel ID updated in `functions/index.js`
- [ ] LINE Channel Secret updated in `functions/index.js`
- [ ] Redirect URI configured correctly
- [ ] LINE Login enabled in Firebase Console

### 3. **Code Quality**
- [ ] ESLint passes without errors
- [ ] No console.log statements in production code
- [ ] Error handling implemented properly
- [ ] CORS headers configured correctly

### 4. **Dependencies**
- [ ] All dependencies installed (`npm install`)
- [ ] No outdated packages
- [ ] Package.json is up to date

### 5. **Firebase Services**
- [ ] Authentication enabled in Firebase Console
- [ ] Cloud Functions enabled in Firebase Console
- [ ] Billing account configured (if required)

## 🧹 Cleanup Commands

```bash
# Clean functions directory
cd functions
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Run linting
npm run lint

# Fix linting issues (if any)
npm run lint -- --fix
```

## 🧪 Testing Commands

```bash
# Start emulator
firebase emulators:start --only functions

# Test functions locally
curl -X POST http://localhost:5001/basic-firebase-80425/asia-southeast1/getLineAuthUrlHttp

# Check logs
firebase functions:log
```

## 🚀 Deployment Commands

```bash
# Deploy only functions
firebase deploy --only functions

# Deploy with force (if needed)
firebase deploy --only functions --force

# Check deployment status
firebase functions:list
```

## 📋 Post-Deployment Checks

- [ ] Functions deployed successfully
- [ ] Functions are accessible via HTTPS
- [ ] LINE OAuth flow works correctly
- [ ] Error logs are clean
- [ ] Performance is acceptable

## 🔧 Troubleshooting

### Common Issues:
1. **Authentication Error**: Check Firebase Admin SDK initialization
2. **CORS Error**: Verify CORS headers in functions
3. **LINE OAuth Error**: Check Channel ID/Secret and Redirect URI
4. **Deployment Error**: Ensure billing is enabled and quota is available

### Useful Commands:
```bash
# View function logs
firebase functions:log --only getLineAuthUrlHttp,processLineCallbackHttp

# Delete function (if needed)
firebase functions:delete getLineAuthUrlHttp --force

# Check project status
firebase projects:list
``` 