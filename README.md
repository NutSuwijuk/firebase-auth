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

## 🔧 Provider Management

### Checking Available Providers

The app now includes a feature to check which authentication providers are available:

1. **Automatic Display**: Provider status is automatically displayed at the top of the page when it loads
2. **No Manual Action Required**: No need to click any buttons - the status appears immediately
3. **Real-time Updates**: Provider status updates automatically when authentication state changes
4. **Smart UI**: Only available providers are shown as login buttons, unavailable ones are hidden

### Provider Status Display

The app automatically shows:
- ✅ **Available providers** with their display names and status
- ❌ **Unavailable providers** are hidden from the UI
- 📊 **Total count** of available providers
- 🌐 **Domain information** (localhost, Firebase domain, or custom domain)
- 🕒 **Last checked timestamp**
- 🎨 **Color-coded status**: Green for success, yellow for warnings, red for errors

### How It Works (No Cloud Functions Required)

The provider checking uses client-side methods:

1. **Provider Creation Test**: Attempts to create provider instances
2. **Firebase Configuration Check**: Validates Firebase config
3. **Domain Authorization Check**: Verifies current domain
4. **Browser Compatibility Check**: Ensures browser support

### Troubleshooting Provider Issues

If you see fewer providers than expected:

1. **Check Firebase Console**: Go to Authentication > Sign-in method
2. **Enable Providers**: Click on each provider and enable it
3. **Configure Settings**: Fill in required configuration for each provider
4. **Check Domain**: Ensure your domain is in authorized domains
5. **Refresh Page**: Reload the page to see updated provider status

### Benefits of Client-Side Checking

- ✅ **No Cloud Functions required** - Works immediately
- ✅ **Faster response** - No network requests needed
- ✅ **Real-time updates** - Checks on every page load
- ✅ **Detailed diagnostics** - Shows domain, browser, and config info

## 🔗 User's Linked Authentication Providers

### Overview

The app now displays which authentication providers are linked to the currently logged-in user's account. This is different from the general "available providers" - it shows the specific authentication methods that the current user has used to sign in.

### Features

1. **Automatic Detection**: Shows linked providers immediately when a user is signed in
2. **Real-time Updates**: Updates automatically when authentication state changes
3. **Clear Display**: Shows provider names and IDs in a user-friendly format
4. **Multiple Scenarios**: Handles different authentication states:
   - ✅ **User with linked providers**: Shows list of linked authentication methods
   - ⚠️ **User without linked providers**: Shows "no providers linked" message
   - ❌ **No user signed in**: Hides the section entirely

### What It Shows

For a signed-in user, the app displays:
- **Total linked providers count**
- **List of linked providers** with friendly names:
  - Google (`google.com`)
  - Apple (`apple.com`)
  - LINE (`line.com`)
  - Facebook (`facebook.com`)
  - Twitter (`twitter.com`)
  - GitHub (`github.com`)
  - Microsoft (`microsoft.com`)
  - Yahoo (`yahoo.com`)
  - Email/Password (`password`)
- **Last checked timestamp**
- **Color-coded status**: Green for linked providers, yellow for no providers, red for errors

### Technical Details

The feature uses `firebase.auth().currentUser.providerData` to retrieve the user's linked authentication providers. This array contains information about each authentication method the user has used to sign in to their account.

### Example Scenarios

1. **User signed in with Google**: Shows "Google (google.com)" as linked provider
2. **User signed in with Apple**: Shows "Apple (apple.com)" as linked provider
3. **User signed in with LINE**: Shows "LINE (line.com)" as linked provider
4. **User with multiple linked accounts**: Shows all linked providers in a list
5. **User signed out**: Section is hidden

## Other Authentication Methods

This project also supports:
- **Google Sign-In**: Configure in Firebase Console
- **LINE Login**: Configure LINE Channel ID and Secret
- **Email/Password**: Basic email authentication

For more information, check the Firebase Console documentation for each provider.