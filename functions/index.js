// functions/index.js

const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const admin = require("firebase-admin");
const axios = require("axios");
const {v4: uuidv4} = require("uuid");

// Initialize Firebase Admin SDK for emulator
admin.initializeApp({
  projectId: "basic-firebase-80425",
});

// Set global options for all functions
setGlobalOptions({
  region: "asia-southeast1",
  maxInstances: 5,
});

// LINE OAuth Configuration
const LINE_CONFIG = {
  CHANNEL_ID: "2007733529",
  CHANNEL_SECRET: "4e3197d83a8d9836ae5794fda50b698a",
  REDIRECT_URI: "http://127.0.0.1:5502/index.html",
  AUTH_URL: "https://access.line.me/oauth2/v2.1/authorize",
  TOKEN_URL: "https://api.line.me/oauth2/v2.1/token",
  PROFILE_URL: "https://api.line.me/v2/profile",
  VERIFY_URL: "https://api.line.me/oauth2/v2.1/verify",
};

/**
 * Helper function to generate LINE authorization URL
 * @return {Object} Object containing authUrl and state
 */
function generateLineAuthUrl() {
  const state = uuidv4();
  const scope = "profile openid email";

  return {
    authUrl: `${LINE_CONFIG.AUTH_URL}?` +
      `response_type=code&` +
      `client_id=${LINE_CONFIG.CHANNEL_ID}&` +
      `redirect_uri=${encodeURIComponent(LINE_CONFIG.REDIRECT_URI)}&` +
      `state=${state}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `nonce=${uuidv4()}`,
    state: state,
  };
}

/**
 * Helper function to exchange authorization code for tokens
 * @param {string} code - Authorization code from LINE
 * @return {Promise<Object>} Token response data
 */
async function exchangeCodeForTokens(code) {
  const tokenData = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: LINE_CONFIG.REDIRECT_URI,
    client_id: LINE_CONFIG.CHANNEL_ID,
    client_secret: LINE_CONFIG.CHANNEL_SECRET,
  });

  const tokenResponse = await axios.post(LINE_CONFIG.TOKEN_URL, tokenData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return tokenResponse.data;
}

/**
 * Helper function to verify LINE ID token
 * @param {string} idToken - LINE ID token to verify
 * @return {Promise<Object>} Verified token data
 */
async function verifyLineIdToken(idToken) {
  const verifyData = new URLSearchParams({
    id_token: idToken,
    client_id: LINE_CONFIG.CHANNEL_ID,
  });

  const idTokenResponse = await axios.post(LINE_CONFIG.VERIFY_URL, verifyData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return idTokenResponse.data;
}

/**
 * Helper function to get LINE profile
 * @param {string} accessToken - LINE access token
 * @return {Promise<Object>} LINE profile data
 */
async function getLineProfile(accessToken) {
  const profileResponse = await axios.get(LINE_CONFIG.PROFILE_URL, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  return profileResponse.data;
}

/**
 * Helper function to create or update Firebase user
 * @param {string} lineEmail - User email from LINE
 * @param {string} lineDisplayName - User display name from LINE
 * @param {string} linePictureUrl - User picture URL from LINE
 * @return {Promise<string>} Firebase user UID
 */
async function createOrUpdateFirebaseUser(lineEmail, lineDisplayName,
    linePictureUrl) {
  let firebaseUid;

  try {
    // Check if user exists
    const userRecord = await admin.auth().getUserByEmail(lineEmail);
    firebaseUid = userRecord.uid;

    // Update user data
    await admin.auth().updateUser(firebaseUid, {
      displayName: lineDisplayName,
      photoURL: linePictureUrl,
    });
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      // Create new user
      console.log(`Creating new user for email: ${lineEmail}`);
      const newUser = await admin.auth().createUser({
        email: lineEmail,
        emailVerified: true,
        displayName: lineDisplayName,
        photoURL: linePictureUrl,
      });
      firebaseUid = newUser.uid;
    } else {
      throw error;
    }
  }

  return firebaseUid;
}

/**
 * Helper function to handle CORS headers
 * @param {Object} request - Express request object
 * @param {Object} response - Express response object
 * @return {boolean} True if origin is allowed
 */
function handleCORS(request, response) {
  const origin = request.headers.origin;

  // Always allow localhost for development (including port 5502)
  if (origin && (origin.includes("localhost") ||
      origin.includes("127.0.0.1"))) {
    response.set("Access-Control-Allow-Origin", origin);
  } else {
    response.set("Access-Control-Allow-Origin", "http://127.0.0.1:5502");
  }

  response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.set("Access-Control-Max-Age", "3600");

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return false; // Don't continue processing
  }

  return true; // Continue processing
}

// LINE Login Functions Only

// HTTP function for LINE Authorization URL
exports.getLineAuthUrlHttp = onRequest(async (request, response) => {
  // Handle CORS
  if (!handleCORS(request, response)) {
    return; // Preflight request handled
  }

  try {
    const {authUrl, state} = generateLineAuthUrl();

    response.json({
      success: true,
      authUrl: authUrl,
      state: state,
    });
  } catch (error) {
    console.error("Error generating LINE auth URL:", error);
    response.status(500).json({
      success: false,
      error: `Failed to generate LINE authorization URL: ${error.message}`,
    });
  }
});

// HTTP function for LINE Callback processing
exports.processLineCallbackHttp = onRequest(async (request, response) => {
  // Handle CORS
  if (!handleCORS(request, response)) {
    return; // Preflight request handled
  }

  try {
    console.log("Request body:", request.body);
    console.log("Request headers:", request.headers);

    const {code, state} = request.body;

    if (!code || !state) {
      console.error("Missing code or state:", {code: !!code, state: !!state});
      response.status(400).json({
        success: false,
        error: "Authorization code and state are required",
      });
      return;
    }

    console.log("Processing LINE callback with code:",
        code.substring(0, 10) + "...");

    // 1. Exchange authorization code for tokens
    const {access_token: accessToken, id_token: idToken} =
        await exchangeCodeForTokens(code);
    console.log("Got LINE access token and ID token");

    // 2. Verify ID token
    const idTokenData = await verifyLineIdToken(idToken);
    console.log("Verified LINE ID token for user:", idTokenData.sub);

    // 3. Get LINE profile
    const lineProfile = await getLineProfile(accessToken);
    console.log("Got LINE profile:", lineProfile.displayName);

    // 4. Create or update Firebase user
    const lineEmail = idTokenData.email;
    const lineDisplayName = lineProfile.displayName;
    const linePictureUrl = lineProfile.pictureUrl;

    if (!lineEmail) {
      response.status(400).json({
        success: false,
        error: "Email permission not granted in LINE",
      });
      return;
    }

    const firebaseUid = await createOrUpdateFirebaseUser(lineEmail,
        lineDisplayName, linePictureUrl);

    // 5. Create custom token
    const customToken = await admin.auth().createCustomToken(firebaseUid);
    console.log(`Generated custom token for UID: ${firebaseUid}`);

    // 6. Return data
    response.json({
      success: true,
      customToken: customToken,
      user: {
        uid: firebaseUid,
        email: lineEmail,
        displayName: lineDisplayName,
        photoURL: linePictureUrl,
        lineUserId: lineProfile.userId,
      },
      lineProfile: {
        userId: lineProfile.userId,
        displayName: lineProfile.displayName,
        pictureUrl: lineProfile.pictureUrl,
        statusMessage: lineProfile.statusMessage,
        accessToken: accessToken,
      },
      idTokenData: idTokenData,
    });
  } catch (error) {
    console.error("Error processing LINE callback:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response && error.response.data,
    });
    response.status(500).json({
      success: false,
      error: `LINE login failed: ${error.message}`,
      details: (error.response && error.response.data) || error.stack,
    });
  }
});
