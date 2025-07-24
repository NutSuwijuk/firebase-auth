# 🔑 JWT Token Debug Guide

## 🎯 Overview

This guide explains how to view and debug JWT token information from the LINE login implementation.

## 📊 What You Can See

### 1. **Token Details**
- **Token Length**: Number of characters in the JWT token
- **Provider**: Authentication provider (LINE, Google, etc.)
- **Issued At**: When the token was created
- **Expires At**: When the token will expire
- **Status**: Whether the token is valid or expired
- **Time Remaining**: How much time is left before expiration

### 2. **User Information**
- **User ID**: Firebase user UID
- **Email**: User's email address
- **Email Verified**: Whether email is verified
- **LINE User ID**: LINE user identifier (if applicable)
- **New User**: Whether this is a new account
- **Account Linked**: Whether accounts were linked

### 3. **Raw Data**
- **Full Token Payload**: Complete JSON structure of the token
- **Raw JWT Token**: The actual JWT string
- **Refresh Token**: Firebase refresh token

## 🛠️ How to View Token Data

### Method 1: Automatic Display
After LINE login, token information is automatically displayed in the user information section.

### Method 2: Debug Buttons
Use the debug buttons in `test-line-login.html`:

1. **🔑 Check JWT Token**: Shows detailed token information
2. **📱 Check localStorage**: Shows stored LINE data
3. **🔥 Check Firebase User**: Shows Firebase user state

### Method 3: Browser Console
Open browser console (F12) to see detailed token information logged automatically.

## 📋 Token Structure

### Firebase JWT Token Payload
```json
{
  "iss": "https://securetoken.google.com/your-project-id",
  "aud": "your-project-id",
  "auth_time": 1234567890,
  "user_id": "firebase_uid",
  "sub": "firebase_uid",
  "iat": 1234567890,
  "exp": 1234567890,
  "email": "user@example.com",
  "email_verified": true,
  "firebase": {
    "identities": {
      "email": ["user@example.com"]
    },
    "sign_in_provider": "custom"
  },
  "provider": "line.com",
  "lineUserId": "U123456789",
  "isNewUser": false,
  "isAccountLinked": true,
  "_formatted": {
    "issuedAt": "2024-01-01 12:00:00",
    "expiresAt": "2024-01-01 13:00:00",
    "isExpired": false,
    "timeRemaining": 3600
  }
}
```

### Custom Claims (Added by Backend)
- `provider`: Authentication provider
- `lineUserId`: LINE user identifier
- `isNewUser`: Whether this is a new account
- `isAccountLinked`: Whether accounts were linked

## 🔍 Debugging Steps

### Step 1: Check Token Validity
1. Look at the **Status** field
2. Check **Time Remaining**
3. Verify **Issued At** and **Expires At** times

### Step 2: Verify User Information
1. Check **User ID** matches Firebase UID
2. Verify **Email** is correct
3. Confirm **Email Verified** status

### Step 3: Check LINE Integration
1. Look for **LINE User ID**
2. Check **Provider** is "line.com"
3. Verify **Account Status** (New/Linked)

### Step 4: Examine Custom Claims
1. Look for custom fields in the payload
2. Check for `isNewUser` and `isAccountLinked`
3. Verify `lineUserId` is present

## 🐛 Common Issues

### Issue: Token Expired
**Symptoms**: Status shows "❌ Expired"
**Solution**: 
- User needs to sign in again
- Check if token refresh is working

### Issue: Missing LINE Data
**Symptoms**: No LINE User ID or provider information
**Solution**:
- Check if LINE login completed successfully
- Verify backend processed the login correctly
- Check localStorage for LINE data

### Issue: Wrong User ID
**Symptoms**: User ID doesn't match expected value
**Solution**:
- Check if account linking worked correctly
- Verify email addresses match
- Check backend logs for errors

### Issue: Missing Custom Claims
**Symptoms**: No `isNewUser` or `isAccountLinked` fields
**Solution**:
- Check backend custom token generation
- Verify Firebase Admin SDK is working
- Check server logs for errors

## 📝 Testing Checklist

### Before Testing
- [ ] Backend server is running
- [ ] Firebase project is configured
- [ ] LINE Channel is set up
- [ ] Browser console is open

### After LINE Login
- [ ] Token is valid (not expired)
- [ ] User ID is correct
- [ ] Email is present and verified
- [ ] LINE User ID is present
- [ ] Provider shows "line.com"
- [ ] Account status is correct (New/Linked)
- [ ] Custom claims are present

### Token Security
- [ ] Token is not exposed in URLs
- [ ] Token is stored securely
- [ ] Token expires appropriately
- [ ] Refresh token is available

## 🔧 Advanced Debugging

### Console Commands
```javascript
// Get current user
const user = auth.currentUser;

// Get ID token
const token = await user.getIdToken();

// Decode token manually
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);

// Check custom claims
console.log('Custom claims:', payload.provider, payload.lineUserId);
```

### Network Tab
1. Open Developer Tools → Network tab
2. Perform LINE login
3. Look for requests to:
   - `/api/auth/line/login`
   - Firebase authentication endpoints
4. Check response data and headers

### Application Tab
1. Open Developer Tools → Application tab
2. Check Local Storage for:
   - `lineUser`
   - `lineProfile`
   - `lineCustomToken`
3. Check Session Storage for Firebase data

## 📞 Support

If you encounter issues:

1. **Check Console**: Look for error messages
2. **Verify Token**: Use the debug tools
3. **Check Network**: Look for failed requests
4. **Review Logs**: Check backend server logs
5. **Test Again**: Clear data and retry

## 🎉 Success Indicators

The token is working correctly if:

- ✅ Token is valid and not expired
- ✅ User information is complete
- ✅ LINE integration data is present
- ✅ Custom claims are set correctly
- ✅ Account status reflects the actual state
- ✅ No security warnings in console 