require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// Mock Database (In-memory storage)
const users = [];
const revokedTokens = [];
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// LINE Login Configuration
const LINE_CONFIG = {
  CHANNEL_ID: process.env.LINE_CHANNEL_ID || "2007733529",
  CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET || "4e3197d83a8d9836ae5794fda50b698a",
  REDIRECT_URI: process.env.LINE_REDIRECT_URI || "http://127.0.0.1:5500/index.html"
};


// Setup Firebase Admin with environment variables
try {
  admin.app();
} catch (e) {
  let serviceAccount;
  
  // Priority: Environment variables first
  if (process.env.FIREBASE_ADMIN_KEY) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
      console.log('✅ Using Firebase Admin credentials from environment variables');
    } catch (error) {
      console.error('❌ Error parsing FIREBASE_ADMIN_KEY from environment:', error.message);
      process.exit(1);
    }
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Alternative: Individual environment variables
    serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: "googleapis.com"
    };
    console.log('✅ Using Firebase Admin credentials from individual environment variables');
  } else {
    // Fallback: Local service account file
    try {
      serviceAccount = require('./serviceAccountKey.json');
      console.log('✅ Using Firebase Admin credentials from local serviceAccountKey.json');
    } catch (error) {
      console.error('❌ No Firebase Admin credentials found. Please set environment variables or provide serviceAccountKey.json');
      console.error('Required environment variables:');
      console.error('- FIREBASE_ADMIN_KEY (JSON string) OR');
      console.error('- FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
      process.exit(1);
    }
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://basic-firebase-9e03e-default-rtdb.firebaseio.com"
  });
}

// Initialize Firestore
const db = admin.firestore();
console.log('✅ Firestore initialized successfully');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  if (revokedTokens.includes(token)) {
    return res.status(401).json({ error: 'Token revoked' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend service is running',
    timestamp: new Date().toISOString(),
    usersCount: users.length
  });
});

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      displayName: displayName || email,
      createdAt: new Date().toISOString(),
      emailVerified: false,
      lastLoginAt: null
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        displayName: newUser.displayName
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Update last login
    newUser.lastLoginAt = new Date().toISOString();

    console.log(`✅ New user registered: ${email}`);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        emailVerified: newUser.emailVerified,
        createdAt: newUser.createdAt
      },
      token
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        displayName: user.displayName
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Update last login
    user.lastLoginAt = new Date().toISOString();

    console.log(`✅ User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      },
      token
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile (protected route)
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (error) {
    console.error('❌ Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile (protected route)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { displayName } = req.body;
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (displayName) {
      user.displayName = displayName;
    }

    console.log(`✅ Profile updated for: ${user.email}`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  console.log(`👤 User logged out: ${req.user.email}`);
  res.json({ message: 'Logout successful' });
});

// Revoke token (server-side)
app.post('/api/auth/revoke-token', authenticateToken, (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token && !revokedTokens.includes(token)) {
    revokedTokens.push(token);
  }
  res.json({ message: 'Token revoked' });
});

// Get all users (for admin purposes - remove in production)
app.get('/api/users', (req, res) => {
  const usersList = users.map(user => ({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  }));
  
  res.json({ users: usersList, count: users.length });
});

// Sync user data from Firebase
app.post('/api/auth/sync-user', async (req, res) => {
  try {
    const { firebase_uid, email, display_name, photo_url, email_verified, provider, last_login, id_token } = req.body;
    
    // Validate required fields
    if (!firebase_uid || !email) {
      return res.status(400).json({ error: 'firebase_uid and email are required' });
    }
    
    // Log JWT token info (for debugging)
    if (id_token) {
      console.log('🔑 JWT Token received:', {
        tokenLength: id_token.length,
        tokenPreview: id_token.substring(0, 50) + '...',
        provider: provider
      });
    }
    
    // Check if user exists in our system
    // เราสามารถค้นหาได้ทั้งจาก firebase_uid หรือ email
    const existingUser = users.find(user => 
      user.firebase_uid === firebase_uid || user.email === email
    );
    
    if (existingUser) {
      // Update existing user
      existingUser.displayName = display_name || existingUser.displayName;
      existingUser.photoURL = photo_url || existingUser.photoURL;
      existingUser.emailVerified = email_verified || existingUser.emailVerified;
      existingUser.provider = provider || existingUser.provider;
      existingUser.lastLoginAt = last_login || new Date().toISOString();
      
      console.log('✅ Updated existing user from Firebase:', existingUser.email);
      res.json({ 
        message: 'User updated successfully', 
        user: {
          id: existingUser.id,
          email: existingUser.email,
          displayName: existingUser.displayName,
          provider: existingUser.provider
        }
      });
    } else {
      // Create new user
      const newUser = {
        id: uuidv4(), // Backend ID (timestamp)
        firebase_uid: firebase_uid, // Firebase UID (from Firebase Auth)
        email: email,
        displayName: display_name || '',
        photoURL: photo_url || '',
        emailVerified: email_verified || false,
        provider: provider || 'email',
        createdAt: new Date().toISOString(),
        lastLoginAt: last_login || new Date().toISOString(),
        password: 'firebase-auth' // Placeholder for Firebase users
      };
      
      users.push(newUser);
      
      console.log('✅ Created new user from Firebase:', newUser.email);
      res.json({ 
        message: 'User created successfully', 
        user: {
          id: newUser.id,
          email: newUser.email,
          displayName: newUser.displayName,
          provider: newUser.provider
        }
      });
    }
  } catch (error) {
    console.error('❌ Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Get user profile by Firebase UID
app.get('/api/auth/profile-by-firebase/:firebaseUid', (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const user = users.find(u => u.firebase_uid === firebaseUid);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        firebase_uid: user.firebase_uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        provider: user.provider,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (error) {
    console.error('❌ Profile by Firebase UID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile by Firebase UID
app.put('/api/auth/update-profile-by-firebase/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const { displayName, photoURL } = req.body;
    
    const user = users.find(u => u.firebase_uid === firebaseUid);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (displayName) {
      user.displayName = displayName;
    }
    
    if (photoURL) {
      user.photoURL = photoURL;
    }

    console.log(`✅ Profile updated for Firebase user: ${user.email}`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        firebase_uid: user.firebase_uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: user.provider
      }
    });

  } catch (error) {
    console.error('❌ Profile update by Firebase UID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint: Revoke user refresh tokens (force logout)
app.post('/api/auth/revoke-user', async (req, res) => {
  try {
    const { uid, email } = req.body;
    let userId = uid;
    // ถ้าไม่มี uid แต่มี email ให้ค้นหา uid จาก email
    if (!userId && email) {
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        userId = userRecord.uid;
      } catch (err) {
        return res.status(404).json({ error: 'User not found in Firebase' });
      }
    }
    if (!userId) {
      return res.status(400).json({ error: 'uid or email required' });
    }
    await admin.auth().revokeRefreshTokens(userId);
    res.json({ message: 'Refresh tokens revoked', uid: userId });
  } catch (error) {
    // แก้ไข: ส่ง JSON error เสมอ ไม่ส่ง HTML
    console.error('❌ Error revoking user:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// ========================================
// LINE Login Routes
// ========================================

/**
 * LINE Login - Get Authorization URL
 */
app.get('/api/auth/line/auth-url', async (req, res) => {
  try {
    const state = Math.random().toString(36).substring(7);
    const authUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
      `response_type=code&` +
      `client_id=${LINE_CONFIG.CHANNEL_ID}&` +
      `redirect_uri=${encodeURIComponent(LINE_CONFIG.REDIRECT_URI)}&` +
      `state=${state}&` +
      `scope=profile%20openid%20email`;

    console.log("Generated LINE auth URL", { state });

    res.json({
      success: true,
      authUrl,
      state
    });
  } catch (error) {
    console.error("Error generating LINE auth URL:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate authorization URL"
    });
  }
});

/**
 * LINE Login - Exchange Code for Token (Improved Version)
 * This follows the correct approach: check by email first, then either link or create
 */
app.post('/api/auth/line/login', async (req, res) => {
  // --- เพิ่มบรรทัดนี้ที่ด้านบนสุดของฟังก์ชัน ---
  console.log(`[${new Date().toISOString()}] Received a request to /api/auth/line/login`);
  
  try {
    const { code, state } = req.body;

    console.log(`[${new Date().toISOString()}] 📥 Received request body:`, {
      hasCode: !!code,
      codeLength: code ? code.length : 0,
      codePreview: code ? code.substring(0, 10) + '...' : 'none',
      hasState: !!state,
      stateValue: state || 'none'
    });

    if (!code) {
      console.log(`[${new Date().toISOString()}] ❌ Missing authorization code in request`);
      const errorResponse = {
        success: false,
        error: "Authorization code is required"
      };
      console.log(`[${new Date().toISOString()}] 📤 Sending validation error response:`, errorResponse);
      return res.status(400).json(errorResponse);
    }

    console.log("🔄 Processing LINE login with improved logic", { 
      code: code.substring(0, 10) + '...', 
      state
    });

    console.log(`[${new Date().toISOString()}] 🔧 LINE Configuration:`, {
      channelId: LINE_CONFIG.CHANNEL_ID,
      redirectUri: LINE_CONFIG.REDIRECT_URI,
      hasChannelSecret: !!LINE_CONFIG.CHANNEL_SECRET
    });

    // Step 1: Exchange code for access token
    console.log(`[${new Date().toISOString()}] Step 1: Exchanging authorization code for access token...`);
    const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: LINE_CONFIG.REDIRECT_URI,
        client_id: LINE_CONFIG.CHANNEL_ID,
        client_secret: LINE_CONFIG.CHANNEL_SECRET
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, id_token } = tokenResponse.data;
    console.log(`[${new Date().toISOString()}] ✅ Successfully obtained access token and ID token from LINE`);

    // Step 2: Get user profile from LINE
    console.log(`[${new Date().toISOString()}] Step 2: Getting user profile from LINE...`);
    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const lineProfile = profileResponse.data;
    console.log(`[${new Date().toISOString()}] ✅ Successfully obtained LINE profile:`, {
      userId: lineProfile.userId,
      displayName: lineProfile.displayName,
      hasPicture: !!lineProfile.pictureUrl
    });

    // Step 3: Verify ID token to get email
    console.log(`[${new Date().toISOString()}] Step 3: Verifying ID token to get email...`);
    const idTokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/verify', 
      new URLSearchParams({
        id_token: id_token,
        client_id: LINE_CONFIG.CHANNEL_ID
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const idTokenData = idTokenResponse.data;
    console.log(`[${new Date().toISOString()}] ✅ Successfully verified ID token and obtained email:`, {
      email: idTokenData.email,
      emailVerified: idTokenData.email_verified
    });
    
    // Extract LINE user data
    const lineUserId = lineProfile.userId;
    const lineEmail = idTokenData.email;
    const lineDisplayName = lineProfile.displayName;
    const linePictureUrl = lineProfile.pictureUrl;

    if (!lineEmail) {
      console.log(`[${new Date().toISOString()}] ❌ LINE email permission not granted`);
      const errorResponse = {
        success: false,
        error: "Email permission not granted in LINE. Please grant email permission and try again."
      };
      console.log(`[${new Date().toISOString()}] 📤 Sending error response:`, errorResponse);
      return res.status(400).json(errorResponse);
    }

    console.log("📧 LINE user data extracted:", {
      lineUserId,
      lineEmail,
      lineDisplayName,
      hasPicture: !!linePictureUrl
    });

    let firebaseUser;
    let isNewUser = false;
    let isAccountLinked = false;

    // Step 4: Check if user exists by email (THE CORRECT APPROACH)
    console.log(`[${new Date().toISOString()}] Step 4: Checking if user exists by email: ${lineEmail}`);
    try {
      firebaseUser = await admin.auth().getUserByEmail(lineEmail);
      console.log(`[${new Date().toISOString()}] ✅ Found existing user by email: ${lineEmail}, UID: ${firebaseUser.uid}`);
      
      // Case 1: User found by email - this means we need to LINK accounts
      isAccountLinked = true;
      
      // Update existing user with latest LINE data
      console.log(`[${new Date().toISOString()}] Updating existing Firebase user with LINE data...`);
      await admin.auth().updateUser(firebaseUser.uid, {
        displayName: lineDisplayName,
        photoURL: linePictureUrl,
        lastSignInTime: new Date().toISOString()
      });

      // Update custom claims to include LINE information
      const existingClaims = firebaseUser.customClaims || {};
      await admin.auth().setCustomUserClaims(firebaseUser.uid, {
        ...existingClaims,
        lineUserId: lineUserId,
        lineDisplayName: lineDisplayName,
        linePictureUrl: linePictureUrl,
        lineStatusMessage: lineProfile.statusMessage,
        lastLineSignIn: new Date().toISOString(),
        hasLineAccount: true
      });

      console.log(`[${new Date().toISOString()}] 🔗 Linked LINE account to existing Firebase user: ${firebaseUser.uid}`);

    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`[${new Date().toISOString()}] 📝 User with email ${lineEmail} not found. Creating new user.`);
        
        // Case 2: User not found by email - create new user
        isNewUser = true;
        
        console.log(`[${new Date().toISOString()}] Creating new Firebase user...`);
        firebaseUser = await admin.auth().createUser({
          email: lineEmail,
          emailVerified: true, // Trust email from LINE
          displayName: lineDisplayName,
          photoURL: linePictureUrl,
          disabled: false
        });

        // Set custom claims for new user
        console.log(`[${new Date().toISOString()}] Setting custom claims for new user...`);
        await admin.auth().setCustomUserClaims(firebaseUser.uid, {
          provider: 'line.com',
          lineUserId: lineUserId,
          lineDisplayName: lineDisplayName,
          linePictureUrl: linePictureUrl,
          lineStatusMessage: lineProfile.statusMessage,
          email: lineEmail,
          emailVerified: true,
          signInProvider: 'line.com',
          lastSignInTime: new Date().toISOString(),
          isLineUser: true
        });

        console.log(`[${new Date().toISOString()}] ✅ Created new Firebase user: ${firebaseUser.uid}`);
          } else {
      console.log(`[${new Date().toISOString()}] ❌ Firebase error (not user-not-found):`, {
        errorCode: error.code,
        errorMessage: error.message
      });
      throw error; // Re-throw other errors
    }
    }

    // Step 5: Generate custom token for Firebase Auth
    console.log(`[${new Date().toISOString()}] Step 5: Generating custom token for Firebase Auth...`);
    const customToken = await admin.auth().createCustomToken(firebaseUser.uid, {
      provider: 'line.com',
      lineUserId: lineUserId,
      lineDisplayName: lineDisplayName,
      email: lineEmail,
      isNewUser: isNewUser,
      isAccountLinked: isAccountLinked
    });
    console.log(`[${new Date().toISOString()}] ✅ Successfully generated custom token for Firebase Auth`);

    console.log(`[${new Date().toISOString()}] 🎉 LINE login successful`, { 
      lineUserId: lineUserId,
      firebaseUid: firebaseUser.uid,
      email: lineEmail,
      isNewUser: isNewUser,
      isAccountLinked: isAccountLinked,
      lastSignInTime: new Date().toISOString()
    });

    const responseData = {
      success: true,
      user: {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        provider: 'line',
        lineUserId: lineUserId,
        isNewUser: isNewUser,
        isAccountLinked: isAccountLinked
      },
      customToken,
      lineProfile: {
        userId: lineUserId,
        displayName: lineDisplayName,
        pictureUrl: linePictureUrl,
        statusMessage: lineProfile.statusMessage,
        accessToken: access_token,
        idToken: id_token,
        expiresIn: tokenResponse.data.expires_in,
        refreshToken: tokenResponse.data.refresh_token,
        tokenType: tokenResponse.data.token_type
      },
      idTokenData: {
        iss: idTokenData.iss,
        sub: idTokenData.sub,
        aud: idTokenData.aud,
        exp: idTokenData.exp,
        iat: idTokenData.iat,
        email: lineEmail,
        emailVerified: idTokenData.email_verified,
        name: lineDisplayName,
        picture: linePictureUrl
      },
      accountInfo: {
        isNewUser: isNewUser,
        isAccountLinked: isAccountLinked,
        message: isNewUser ? 
          "New account created successfully" : 
          "LINE account linked to existing account successfully"
      },
      timestamp: new Date().toISOString()
    };

    console.log(`[${new Date().toISOString()}] 📤 Sending response to client:`, {
      success: responseData.success,
      userUid: responseData.user.uid,
      userEmail: responseData.user.email,
      isNewUser: responseData.user.isNewUser,
      isAccountLinked: responseData.user.isAccountLinked,
      hasCustomToken: !!responseData.customToken,
      customTokenLength: responseData.customToken ? responseData.customToken.length : 0
    });

    res.json(responseData);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ LINE login error:`, error);
    console.error(`[${new Date().toISOString()}] Error details:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    
    const errorResponse = {
      success: false,
      error: "LINE login failed",
      details: error.message,
      lineError: error.response?.data
    };
    
    console.log(`[${new Date().toISOString()}] 📤 Sending error response:`, errorResponse);
    res.status(500).json(errorResponse);
  }
});

/**
 * LINE Login - Verify Token
 */
app.post('/api/auth/line/verify', async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "Access token is required"
      });
    }

    // Verify token with LINE API
    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const lineProfile = profileResponse.data;

    // Find Firebase user by LINE user ID
    const firebaseUser = await findFirebaseUserByLineId(lineProfile.userId);

    if (!firebaseUser) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      user: {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        provider: 'line',
        lineUserId: lineProfile.userId
      },
      lineProfile
    });

  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      error: "Token verification failed",
      details: error.message
    });
  }
});

/**
 * LINE Login - Link Account
 * สำหรับเชื่อมต่อ LINE account กับ Firebase account ที่มีอยู่แล้ว
 */
app.post('/api/auth/line/link-account', async (req, res) => {
  try {
    const { currentUserUid, lineUser, lineProfile, idTokenData } = req.body;

    if (!currentUserUid || !lineUser || !lineProfile) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters for account linking"
      });
    }

    console.log("Processing LINE account linking", { 
      currentUserUid,
      lineUserId: lineProfile.userId,
      email: lineUser.email
    });

    // ตรวจสอบว่าผู้ใช้ปัจจุบันมีอยู่จริงใน Firebase
    let currentFirebaseUser;
    try {
      currentFirebaseUser = await admin.auth().getUser(currentUserUid);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: "Current user not found in Firebase"
      });
    }

    // ตรวจสอบว่า email ตรงกัน
    if (currentFirebaseUser.email !== lineUser.email) {
      return res.status(400).json({
        success: false,
        error: "Email mismatch between current account and LINE account"
      });
    }

    // ตรวจสอบว่ามี LINE account อื่นที่ใช้ email เดียวกันหรือไม่
    let existingLineUser;
    try {
      // ค้นหาผู้ใช้ที่มี LINE provider และ email เดียวกัน
      const listUsersResult = await admin.auth().listUsers();
      existingLineUser = listUsersResult.users.find(user => 
        user.email === lineUser.email && 
        user.providerData.some(provider => provider.providerId === 'oidc.line')
      );
    } catch (error) {
      console.log("No existing LINE user found with same email");
    }

    let finalUserUid = currentUserUid;

    if (existingLineUser && existingLineUser.uid !== currentUserUid) {
      // มี LINE account อื่นอยู่แล้ว ให้ลบออกและใช้ current user
      console.log("Found existing LINE user, will delete and use current user");
      try {
        await admin.auth().deleteUser(existingLineUser.uid);
        console.log("Deleted existing LINE user:", existingLineUser.uid);
      } catch (deleteError) {
        console.error("Error deleting existing LINE user:", deleteError);
      }
    }

    // อัพเดท Firebase user ด้วยข้อมูล LINE
    const updateData = {
      displayName: lineUser.displayName || currentFirebaseUser.displayName,
      photoURL: lineUser.photoURL || currentFirebaseUser.photoURL,
      emailVerified: lineUser.emailVerified || currentFirebaseUser.emailVerified
    };

    // เพิ่ม custom claims สำหรับ LINE
    const customClaims = {
      lineUserId: lineProfile.userId,
      lineDisplayName: lineProfile.displayName,
      linkedProviders: [...(currentFirebaseUser.customClaims?.linkedProviders || []), 'line'],
      lastLinkedAt: new Date().toISOString()
    };

    await admin.auth().updateUser(currentUserUid, updateData);
    await admin.auth().setCustomUserClaims(currentUserUid, customClaims);

    // สร้าง custom token สำหรับผู้ใช้ที่ link แล้ว
    const customToken = await admin.auth().createCustomToken(currentUserUid, {
      provider: 'linked_account',
      lineUserId: lineProfile.userId,
      lineDisplayName: lineProfile.displayName,
      email: lineUser.email,
      linkedAt: new Date().toISOString()
    });

    console.log("LINE account linking successful", { 
      currentUserUid,
      lineUserId: lineProfile.userId,
      email: lineUser.email,
      linkedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      user: {
        uid: currentUserUid,
        displayName: updateData.displayName,
        email: lineUser.email,
        photoURL: updateData.photoURL,
        provider: 'linked_account',
        lineUserId: lineProfile.userId,
        linkedProviders: customClaims.linkedProviders
      },
      customToken,
      lineProfile: {
        userId: lineProfile.userId,
        displayName: lineProfile.displayName,
        pictureUrl: lineProfile.pictureUrl,
        statusMessage: lineProfile.statusMessage,
        accessToken: lineProfile.accessToken,
        idToken: lineProfile.idToken,
        expiresIn: lineProfile.expiresIn,
        refreshToken: lineProfile.refreshToken,
        tokenType: lineProfile.tokenType
      },
      idTokenData: {
        iss: idTokenData.iss,
        sub: idTokenData.sub,
        aud: idTokenData.aud,
        exp: idTokenData.exp,
        iat: idTokenData.iat,
        email: idTokenData.email,
        emailVerified: idTokenData.emailVerified,
        name: idTokenData.name,
        picture: idTokenData.picture
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("LINE account linking error:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    res.status(500).json({
      success: false,
      error: "LINE account linking failed",
      details: error.message,
      lineError: error.response?.data
    });
  }
});

/**
 * LINE Login - Logout
 */
app.post('/api/auth/line/logout', async (req, res) => {
  try {
    const { accessToken, firebaseUid } = req.body;

    if (accessToken) {
      // Revoke LINE access token
      await axios.post('https://api.line.me/oauth2/v2.1/revoke', 
        new URLSearchParams({
          access_token: accessToken,
          client_id: LINE_CONFIG.CHANNEL_ID,
          client_secret: LINE_CONFIG.CHANNEL_SECRET
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
    }

    if (firebaseUid) {
      // Revoke Firebase refresh tokens
      await admin.auth().revokeRefreshTokens(firebaseUid);
    }

    console.log("LINE logout successful", { firebaseUid });

    res.json({
      success: true,
      message: "Logout successful"
    });

  } catch (error) {
    console.error("LINE logout error:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
      details: error.message
    });
  }
});

/**
 * LINE Login Callback Handler
 */
app.get('/api/auth/line/callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      console.error("LINE authorization error:", error, error_description);
      return res.redirect(`/line-callback.html?error=${error}&error_description=${error_description}`);
    }

    if (!code || !state) {
      return res.redirect('/line-callback.html?error=missing_params&error_description=Missing authorization code or state parameter');
    }

    // Redirect to callback page with code and state
    res.redirect(`/line-callback.html?code=${code}&state=${state}`);

  } catch (error) {
    console.error("LINE callback error:", error);
    res.redirect(`/line-callback.html?error=callback_error&error_description=${error.message}`);
  }
});

// Helper Functions for LINE Login

/**
 * Helper function to get user info by Firebase UID
 * @param {string} uid - Firebase user UID
 * @returns {Object} User information
 */
async function getUserInfoByUid(uid) {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      emailVerified: userRecord.emailVerified,
      customClaims: userRecord.customClaims,
      lastSignInTime: userRecord.metadata.lastSignInTime,
      creationTime: userRecord.metadata.creationTime
    };
  } catch (error) {
    console.error("Error getting user info by UID:", error);
    throw error;
  }
}



// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints:`);
  console.log(`   POST /api/auth/register - Register new user`);
  console.log(`   POST /api/auth/login - Login user`);
  console.log(`   GET  /api/auth/profile - Get user profile`);
  console.log(`   PUT  /api/auth/profile - Update user profile`);
  console.log(`   POST /api/auth/logout - Logout user`);
  console.log(`🟩 LINE Login endpoints:`);
  console.log(`   GET  /api/auth/line/auth-url - Get LINE authorization URL`);
  console.log(`   POST /api/auth/line/login - Exchange code for token`);
  console.log(`   POST /api/auth/line/verify - Verify LINE token`);
  console.log(`   POST /api/auth/line/logout - LINE logout`);
  console.log(`   GET  /api/auth/line/callback - LINE callback handler`);
  console.log(`🔄 Firebase sync endpoints:`);
  console.log(`   POST /api/auth/sync-user - Sync Firebase user data`);
  console.log(`   GET  /api/auth/profile-by-firebase/:uid - Get profile by Firebase UID`);
  console.log(`   PUT  /api/auth/update-profile-by-firebase/:uid - Update profile by Firebase UID`);
  console.log(`👥 Users endpoint: GET /api/users`);
  console.log(`👥 Revoke user endpoint: POST /api/auth/revoke-user`);
}); 