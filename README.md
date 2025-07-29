# Firebase Authentication with LINE Login - Cloud Functions Edition

🔥 **Firebase Authentication** integrated with **LINE Login** using **Firebase Cloud Functions**

## 🚀 Quick Start

### 1. Deploy Cloud Functions
```bash
npm run deploy-functions
```

### 2. Configure LINE OAuth
1. Edit `functions/.env` with your LINE channel credentials
2. Set callback URL in LINE Developers Console: `https://daring-calling-827.web.app`

### 3. Deploy Web App
```bash
npm run deploy-all
```

## 📋 Features

- ✅ **LINE Login** with OAuth 2.0
- ✅ **Google Sign-In** 
- ✅ **Apple Sign-In**
- ✅ **Email/Password** authentication
- ✅ **Account Linking** between providers
- ✅ **Firebase Cloud Functions** backend
- ✅ **Real-time** authentication state
- ✅ **Responsive** design

## 🏗️ Architecture

```
Frontend (index.html) 
    ↓
Firebase Auth SDK
    ↓
Firebase Cloud Functions
    ↓
LINE OAuth API
```

## 🔧 Configuration

### Environment Variables
Create `functions/.env`:
```env
LINE_CHANNEL_ID=your-line-channel-id
LINE_CHANNEL_SECRET=your-line-channel-secret
LINE_REDIRECT_URI=https://daring-calling-827.web.app
```

### Firebase Console Setup
1. Enable Authentication providers:
   - Google
   - LINE (OIDC)
   - Apple
   - Email/Password

2. Add authorized domains:
   - `localhost`
   - `127.0.0.1`
   - `daring-calling-827.web.app`

## 📁 Project Structure

```
firebase-auth/
├── functions/                 # Cloud Functions
│   ├── index.js              # LINE OAuth functions
│   ├── package.json          # Functions dependencies
│   └── .env                  # Environment variables
├── index.html                # Main web app
├── app-simple.js             # Frontend logic
├── deploy-functions.js       # Deployment script
└── CLOUD_FUNCTIONS_SETUP.md  # Detailed setup guide
```

## 🚀 Deployment

### Deploy Functions Only
```bash
npm run deploy-functions
```

### Deploy Everything
```bash
npm run deploy-all
```

### Manual Deployment
```bash
# Deploy functions
firebase deploy --only functions

# Deploy web app
firebase deploy --only hosting
```

## 🔍 Testing

1. **Local Testing**:
   ```bash
   firebase emulators:start --only functions
   ```

2. **Production Testing**:
   - Deploy functions
   - Test LINE login flow
   - Verify user creation/authentication

## 📚 Documentation

- [Cloud Functions Setup](CLOUD_FUNCTIONS_SETUP.md) - Detailed configuration guide
- [Firebase Functions](https://firebase.google.com/docs/functions) - Official documentation
- [LINE Login](https://developers.line.biz/en/docs/line-login/) - LINE OAuth guide

## 🐛 Troubleshooting

### Common Issues

1. **Functions not deployed**:
   ```bash
   firebase functions:log
   ```

2. **LINE OAuth errors**:
   - Check LINE channel configuration
   - Verify callback URL matches exactly

3. **Environment variables**:
   - Ensure `.env` file exists in `functions/` directory
   - Check variable names match exactly

## 🔒 Security

- ✅ State parameter validation
- ✅ LINE ID token verification
- ✅ Firebase custom token generation
- ✅ Environment variable protection

## 📈 Monitoring

- **Firebase Console**: Monitor function execution and errors
- **LINE Developers Console**: Check OAuth usage and errors
- **Firebase Analytics**: Track authentication events

---

**Note**: This project uses Firebase Cloud Functions instead of a traditional backend server for better scalability and security.