# 🧪 LINE Login Testing Guide

## 🎯 Testing the Improved LINE Login Implementation

This guide will help you test the new LINE login implementation that automatically handles account linking.

## 🚀 Setup

### 1. Start Backend Server
```bash
cd /d/TSB/POC/firebase-auth
node server.js
```

### 2. Open Test Page
Open `test-line-login.html` in your browser (or use Live Server)

## 📋 Test Scenarios

### Test Case 1: New User Registration
**Goal**: Test creating a new account with LINE

**Steps**:
1. Clear all data (click "🗑️ Clear All Data")
2. Click "🟩 Login with LINE"
3. Complete LINE authorization
4. Grant email permission
5. Check results

**Expected Results**:
- ✅ Status: "New Account Created"
- ✅ User information displays correctly
- ✅ LINE User ID shows in user details
- ✅ Account Status: "New Account"

### Test Case 2: Account Linking (Google → LINE)
**Goal**: Test linking LINE account to existing Google account

**Steps**:
1. Clear all data
2. Click "🔍 Login with Google" first
3. Sign in with Google account
4. Sign out
5. Click "🟩 Login with LINE" with same email
6. Complete LINE authorization
7. Check results

**Expected Results**:
- ✅ Status: "Account Linked"
- ✅ User information shows both Google and LINE data
- ✅ Account Status: "Linked Account"
- ✅ Same Firebase UID as Google account

### Test Case 3: Account Linking (Email/Password → LINE)
**Goal**: Test linking LINE account to existing email/password account

**Steps**:
1. Clear all data
2. Create account with email/password first
3. Sign out
4. Click "🟩 Login with LINE" with same email
5. Complete LINE authorization
6. Check results

**Expected Results**:
- ✅ Status: "Account Linked"
- ✅ User information shows both email and LINE data
- ✅ Account Status: "Linked Account"
- ✅ Same Firebase UID as email account

## 🔍 Debug Tools

### Check localStorage Data
Click "📱 Check localStorage" to see:
- `lineUser`: User data from LINE login
- `lineProfile`: LINE profile information
- `lineCustomToken`: Firebase custom token

### Check Firebase User
Click "🔥 Check Firebase User" to see:
- Current Firebase user state
- User properties and metadata
- Provider information

### Clear All Data
Click "🗑️ Clear All Data" to:
- Clear localStorage
- Sign out from Firebase
- Reset the test environment

## 📊 Expected Data Structure

### After LINE Login (localStorage)
```json
{
  "lineUser": {
    "uid": "firebase_uid",
    "displayName": "User Name",
    "email": "user@example.com",
    "photoURL": "https://...",
    "provider": "line",
    "lineUserId": "U123456789",
    "isNewUser": false,
    "isAccountLinked": true
  },
  "lineProfile": {
    "userId": "U123456789",
    "displayName": "User Name",
    "pictureUrl": "https://...",
    "statusMessage": "Hello!",
    "accessToken": "...",
    "idToken": "..."
  },
  "lineCustomToken": "firebase_custom_token"
}
```

### User Display Information
```
👤 User Information
[Profile Picture]
User Name
Email: user@example.com
UID: firebase_uid
Provider: LINE (Custom Token)
Email Verified: Yes
LINE User ID: U123456789
Account Status: Linked Account
```

## 🐛 Troubleshooting

### Problem: User data not showing
**Solution**:
1. Check browser console for errors
2. Click "📱 Check localStorage" to verify data
3. Click "🔥 Check Firebase User" to verify authentication
4. Try refreshing the page

### Problem: Account not linking
**Solution**:
1. Ensure same email is used for both accounts
2. Check backend server is running
3. Verify LINE email permission is granted
4. Check browser console for error messages

### Problem: Backend not responding
**Solution**:
1. Ensure `node server.js` is running
2. Check port 3000 is available
3. Verify Firebase Admin credentials
4. Check server console for errors

## 📝 Test Checklist

### Before Testing
- [ ] Backend server running (`node server.js`)
- [ ] Firebase project configured
- [ ] LINE Channel configured
- [ ] Browser console open for debugging

### After Each Test
- [ ] User information displays correctly
- [ ] Account status is accurate
- [ ] No console errors
- [ ] localStorage contains expected data
- [ ] Firebase user state is correct

### Edge Cases to Test
- [ ] LINE login without email permission
- [ ] Network errors during login
- [ ] Invalid authorization code
- [ ] Expired tokens
- [ ] Multiple rapid login attempts

## 🎉 Success Criteria

The implementation is working correctly if:

1. **New users**: Can create accounts seamlessly
2. **Existing users**: Can link accounts automatically
3. **User data**: Displays correctly after login
4. **Error handling**: Provides clear error messages
5. **UI feedback**: Shows appropriate status messages
6. **Data persistence**: Maintains user data across sessions

## 📞 Support

If you encounter issues:

1. Check the browser console for error messages
2. Check the server console for backend errors
3. Verify all configuration settings
4. Test with the debug tools provided
5. Refer to the main documentation in `LINE_LOGIN_IMPROVED.md` 