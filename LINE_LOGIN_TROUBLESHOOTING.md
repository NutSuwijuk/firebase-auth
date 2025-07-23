# LINE Login Troubleshooting Guide

## Common Issues and Solutions

### 1. ❌ LINE login was cancelled

**Symptoms:**
- Error message: "LINE login was cancelled"
- Popup window closes before completion
- Authorization process doesn't complete

**Common Causes:**
- Popup window was closed manually before authorization completed
- Browser blocked the popup window
- Network connection issues during authorization
- LINE app authorization was cancelled on mobile
- Session timeout during the authorization process

**Solutions:**

#### A. Check Popup Blocker Settings

**Chrome:**
1. Click the popup blocker icon in the address bar (🛡️)
2. Select "Allow" for this site
3. Refresh the page and try again

**Firefox:**
1. Go to Settings > Privacy & Security > Permissions > Block pop-up windows
2. Add exception for your site
3. Refresh the page and try again

**Edge:**
1. Click the popup blocker icon in the address bar
2. Select "Always allow pop-ups from this site"
3. Refresh the page and try again

**Safari:**
1. Go to Safari > Preferences > Websites > Pop-up Windows
2. Set your site to "Allow"
3. Refresh the page and try again

#### B. Complete the Authorization Process

1. **Don't close the popup** until you see "Login Successful"
2. **Follow all steps** in the LINE authorization popup
3. **Grant permissions** when prompted by LINE
4. **Wait for completion** - the popup will close automatically

#### C. Network and Connection Issues

1. **Check internet connection** - ensure stable connectivity
2. **Try again** - network issues are often temporary
3. **Clear browser cache** - may resolve session issues
4. **Use a different network** - if on corporate/firewalled network

### 2. ⚠️ Backend server is not running

**Symptoms:**
- Error message: "Backend server is not available"
- Cannot connect to localhost:3000
- LINE login button doesn't work

**Solution:**
1. Open terminal/command prompt
2. Navigate to your project directory
3. Run: `node server.js`
4. Verify server starts without errors
5. Check that it's running on port 3000

**Troubleshooting:**
- Check if port 3000 is already in use
- Verify all dependencies are installed (`npm install`)
- Check for syntax errors in server.js
- Ensure environment variables are set correctly

### 3. 🔒 Popup was blocked by browser

**Symptoms:**
- Error message: "Popup blocked by browser"
- No popup window appears
- Browser shows popup blocker notification

**Solutions:**

#### A. Allow Popups for This Site

**Chrome:**
1. Look for the popup blocker icon in the address bar
2. Click it and select "Allow pop-ups from [site]"
3. Refresh the page

**Firefox:**
1. Go to Settings > Privacy & Security > Permissions
2. Click "Settings" next to "Block pop-up windows"
3. Add your site to the exceptions list

**Edge:**
1. Click the popup blocker icon in the address bar
2. Select "Always allow pop-ups from this site"

#### B. Disable Popup Blocker Temporarily

1. Open browser settings
2. Find popup blocker settings
3. Temporarily disable for testing
4. Remember to re-enable after testing

### 4. ⏰ LINE login timed out

**Symptoms:**
- Error message: "LINE login timeout after 10 minutes"
- Authorization process takes too long
- Popup remains open but doesn't complete

**Solutions:**
1. **Check internet speed** - slow connections may cause timeouts
2. **Try again** - timeouts are often temporary
3. **Use a different network** - if current network is slow
4. **Check LINE servers** - verify LINE services are accessible

### 5. 🌐 Network connection error

**Symptoms:**
- Error message: "Network connection error"
- Cannot reach backend server
- Fetch requests fail

**Solutions:**
1. **Check internet connection**
2. **Verify backend server is running**
3. **Check firewall settings**
4. **Try refreshing the page**
5. **Check if localhost:3000 is accessible**

### 6. ⚙️ LINE Configuration Issues

**Symptoms:**
- Error message: "Failed to get authorization URL"
- LINE login button doesn't work
- Backend errors related to LINE configuration

**Solutions:**

#### A. Check Environment Variables

Ensure these are set in your `.env` file or environment:

```env
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_REDIRECT_URI=http://localhost:3000/line-callback.html
```

#### B. Verify LINE Console Settings

1. Go to [LINE Developers Console](https://developers.line.biz/)
2. Select your channel
3. Verify Channel ID and Channel Secret
4. Check that LINE Login is enabled
5. Verify Callback URL is set correctly

#### C. Check Redirect URI

The redirect URI must match exactly:
- **Correct:** `http://localhost:3000/line-callback.html`
- **Incorrect:** `http://localhost:3000/line-callback.html/` (trailing slash)

### 7. 🔐 Firebase Configuration Issues

**Symptoms:**
- Error message: "Firebase sign in error"
- Cannot create custom token
- Firebase authentication fails

**Solutions:**

#### A. Check Firebase Admin SDK

1. Verify `serviceAccountKey.json` exists and is valid
2. Check Firebase project settings
3. Ensure service account has proper permissions

#### B. Verify Firebase Console Settings

1. Go to Firebase Console
2. Check Authentication > Sign-in method
3. Ensure LINE provider is enabled
4. Verify authorized domains include `localhost`

### 8. 📱 Mobile-Specific Issues

**Symptoms:**
- LINE login works on desktop but not mobile
- Authorization fails on mobile browsers
- Popup behavior differs on mobile

**Solutions:**
1. **Use desktop browser** for testing
2. **Check mobile browser settings** for popup blocking
3. **Try different mobile browser** (Chrome, Safari, Firefox)
4. **Use desktop mode** on mobile browser

## Testing Your Setup

### Use the Test Page

1. Open `line-login-test.html` in your browser
2. Run all diagnostic tests
3. Follow the recommendations provided

### Manual Testing Steps

1. **Start backend server:** `node server.js`
2. **Open main page:** `index.html`
3. **Check backend status** - should show green
4. **Click LINE login button**
5. **Complete authorization** in popup
6. **Verify success message** appears

## Debugging Tips

### 1. Check Browser Console

1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

### 2. Check Server Logs

1. Monitor terminal where server is running
2. Look for error messages
3. Check for LINE API errors
4. Verify request/response logs

### 3. Test Individual Components

1. **Test backend health:** `http://localhost:3000/api/health`
2. **Test LINE auth URL:** `http://localhost:3000/api/auth/line/auth-url`
3. **Test popup functionality** with simple test page

## Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/popup-closed-by-user` | User closed popup | Don't close popup until completion |
| `auth/popup-blocked` | Browser blocked popup | Allow popups for this site |
| `auth/network-request-failed` | Network error | Check internet connection |
| `auth/timeout` | Request timed out | Try again, check network speed |
| `auth/invalid-credential` | Invalid LINE credentials | Check LINE configuration |

## Getting Help

If you're still experiencing issues:

1. **Check the test page** for specific diagnostics
2. **Review server logs** for detailed error information
3. **Verify all configuration** matches this guide
4. **Test with a fresh browser session**
5. **Try on a different device/network**

## Prevention Tips

1. **Always complete authorization** - don't close popup early
2. **Allow popups** for your development site
3. **Keep backend server running** during testing
4. **Use stable internet connection**
5. **Clear browser cache** if issues persist 