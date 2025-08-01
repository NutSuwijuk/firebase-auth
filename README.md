# Firebase Authentication with Apple Sign-In

This project demonstrates Firebase Authentication integration with multiple providers including Apple Sign-In, Google, and LINE.

## 🍎 Apple Sign-In Setup Guide

### Prerequisites
- Apple Developer Account ($99/year)
- Firebase project
- Domain for your web app

### Step 1: Apple Developer Console Setup

1. **Create App ID**
   - Go to [Apple Developer Console](https://developer.apple.com/account/)
   - Navigate to Certificates, Identifiers & Profiles
   - Click "Identifiers" → "+" → "App IDs"
   - Select "App" and click "Continue"
   - Fill in:
     - Description: Your app name
     - Bundle ID: `com.yourcompany.yourapp` (unique identifier)
   - Enable "Sign In with Apple" capability
   - Click "Continue" and "Register"

2. **Create Service ID**
   - Go to "Identifiers" → "+" → "Services IDs"
   - Select "Services IDs" and click "Continue"
   - Fill in:
     - Description: Your service name
     - Identifier: `com.yourcompany.yourapp.web` (for web)
   - Enable "Sign In with Apple" capability
   - Click "Continue" and "Register"

3. **Configure Service ID**
   - Click on your Service ID
   - Under "Sign In with Apple", click "Configure"
   - Add your domain (e.g., `yourdomain.com`)
   - Add return URL: `https://yourdomain.com/__/auth/handler`
   - Click "Save"

4. **Create Private Key**
   - Go to "Keys" → "+"
   - Fill in:
     - Key Name: `Firebase Apple Sign-In`
     - Enable "Sign In with Apple"
   - Click "Continue" and "Register"
   - Download the `.p8` file (you can only download once!)
   - Note your Team ID and Key ID

### Step 2: Firebase Console Setup

1. **Enable Apple Sign-In**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Authentication → Sign-in method
   - Enable "Apple" provider

2. **Configure Apple Provider**
   - Click on "Apple" provider
   - Fill in:
     - **Service ID**: `com.yourcompany.yourapp.web` (from Step 1)
     - **Apple Team ID**: Your Team ID (from Step 1)
     - **Key ID**: Your Key ID (from Step 1)
     - **Private Key**: Upload the `.p8` file (from Step 1)
   - Click "Save"

3. **Add Authorized Domains**
   - Go to Authentication → Settings → Authorized domains
   - Add your domains:
     - `localhost` (for development)
     - `127.0.0.1` (for development)
     - `yourdomain.com` (for production)

### Step 3: Code Configuration

The Apple Sign-In is already configured in the code:

```javascript
const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");
```

### Step 4: Testing

1. **Development Testing**
   - Use `localhost` or `127.0.0.1`
   - Make sure these domains are in Firebase authorized domains
   - Test with a real Apple ID

2. **Production Testing**
   - Deploy to your domain
   - Ensure domain is verified in Apple Developer Console
   - Test with real Apple IDs

## 🚨 Common Issues and Solutions

### Issue 1: "Apple Sign-In is not enabled"
**Solution**: Enable Apple provider in Firebase Console → Authentication → Sign-in method

### Issue 2: "Unauthorized domain"
**Solution**: Add your domain to Firebase Console → Authentication → Settings → Authorized domains

### Issue 3: "Invalid configuration"
**Solution**: 
- Verify Service ID, Team ID, and Key ID are correct
- Ensure private key file is properly uploaded
- Check that domain is verified in Apple Developer Console

### Issue 4: "Popup blocked"
**Solution**: Allow popups for your domain in browser settings

### Issue 5: "Network error"
**Solution**: 
- Check internet connection
- Verify Apple Developer Console is accessible
- Check if Apple services are down

## 🔧 Debugging

Use the "Check Apple Setup Status" button in the app to verify your configuration.

Check browser console for detailed error messages.

## 📱 Browser Compatibility

Apple Sign-In works on:
- Safari (macOS, iOS)
- Chrome (macOS, Windows)
- Firefox (macOS, Windows)
- Edge (Windows)

## 🔒 Security Notes

- Keep your private key secure
- Never commit `.p8` files to version control
- Use environment variables for sensitive data in production
- Regularly rotate your Apple private keys

## 📚 Additional Resources

- [Apple Sign-In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Firebase Apple Auth Documentation](https://firebase.google.com/docs/auth/web/apple)
- [Apple Developer Guidelines](https://developer.apple.com/app-store/review/guidelines/#sign-in-with-apple)

## 🚀 Deployment

1. Deploy Firebase Functions:
   ```bash
   firebase deploy --only functions
   ```

2. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

3. Or deploy to your own domain and ensure it's added to authorized domains.

---

## Other Authentication Methods

This project also supports:
- **Google Sign-In**: Configure in Firebase Console
- **LINE Login**: Configure LINE Channel ID and Secret
- **Email/Password**: Basic email authentication

For more information, check the Firebase Console documentation for each provider.