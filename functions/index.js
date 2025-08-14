// functions/index.js

const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const axios = require("axios");

// Initialize Firebase Admin SDK
if (process.env.FUNCTIONS_EMULATOR) {
  const serviceAccount = require("../serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  admin.initializeApp();
}

// Global options
setGlobalOptions({
  region: "asia-southeast1",
});

// LINE OAuth Configuration
const LINE_CONFIG = {
  CHANNEL_ID: "2007733529",
  CHANNEL_SECRET: "4e3197d83a8d9836ae5794fda50b698a",
  VERIFY_URL: "https://api.line.me/oauth2/v2.1/verify",
};

/**
 * Send standardized response
 */
function sendResponse(response, status, code, message, data = null) {
  return response.status(status).json({
    status: status < 400,
    code,
    message,
    data,
  });
}

/**
 * Handle CORS headers
 */
function handleCORS(request, response) {
  const origin = request.headers.origin;
  const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://basic-firebase-80425.web.app",
    "https://basic-firebase-80425.firebaseapp.com",
  ];

  if (origin && allowedOrigins.includes(origin)) {
    response.set("Access-Control-Allow-Origin", origin);
  } else {
    response.set("Access-Control-Allow-Origin", "https://basic-firebase-80425.web.app");
  }

  response.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.set("Access-Control-Max-Age", "3600");

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return false;
  }

  return true;
}

// LINE Login Function
exports.verifyLineLogin = onRequest(async (request, response) => {
  if (!handleCORS(request, response)) {
    return;
  }

  try {
    const { accessToken, sub, email } = request.query;
    console.log("accessToken:", accessToken);
    console.log("sub:", sub);
    console.log("email:", email);

    if (!accessToken) {
      return sendResponse(response, 400, "MISSING_TOKEN", "Access token is required");
    }

    console.log(`🔍 Verifying LINE access token: ${accessToken.substring(0, 20)}...`);

    // Verify token with LINE API
    const verifyResponse = await axios.get(`https://api.line.me/oauth2/v2.1/verify?access_token=${accessToken}`);
    const verifyData = verifyResponse.data;
    
    console.log("✅ LINE token verification successful:", {
      clientId: verifyData.client_id,
      expiresIn: verifyData.expires_in,
      scope: verifyData.scope,
    });

    // Check if the client ID matches our LINE channel
    if (verifyData.client_id == LINE_CONFIG.CHANNEL_ID) {
      console.log("✅ LINE channel ID verified successfully");

      let uid;
      
      // Check if user exists or create new one
      try {
        const existingUser = await admin.auth().getUserByEmail(email);
        console.log("✅ Found existing user:", existingUser.uid);
        uid = existingUser.uid;
      } catch (err) {
        if (err.code === "auth/user-not-found") {
          console.log(`ℹ️ User with email ${email} not found, creating new user`);
          uid = sub;
          await admin.auth().createUser({
            uid: uid,
            email: email,
          });
          console.log(`✅ Created new user with UID: ${uid}`);
        } else {
          throw err;
        }
      }

      // Create custom token
      console.log(`🔗 User UID: ${uid}`);
      const customToken = await admin.auth().createCustomToken(uid);
      console.log("✅ Custom token created:", customToken);

      // Exchange custom token for ID token
      console.log("🔄 Exchanging custom token for ID token...");
      const idTokenResponse = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=" +
          "AIzaSyC4pMv-UMVU4hqkSV-FaEiA1Z0txFo9j0I",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: customToken,
            returnSecureToken: true,
          }),
        },
      );

      if (!idTokenResponse.ok) {
        throw new Error(`Failed to exchange custom token: ${idTokenResponse.statusText}`);
      }

      const idTokenData = await idTokenResponse.json();
      console.log("✅ ID token exchange successful");

      if (!idTokenData.idToken) {
        throw new Error("ID token not received from Firebase");
      }

      sendResponse(response, 200, "SUCCESS", "Success", {
        id_token: idTokenData.idToken,
      });
    } else {
      console.log("❌ Invalid LINE channel ID");
      return sendResponse(response, 400, "INVALID_CHANNEL", "Invalid LINE channel ID");
    }
  } catch (error) {
    console.error("❌ LINE token verification error:", error);

    if (error.response) {
      console.error("LINE API error response:", {
        status: error.response.status,
        data: error.response.data,
      });

      sendResponse(response, error.response.status, "LINE_VERIFICATION_FAILED", "LINE token verification failed");
    } else {
      sendResponse(response, 500, "VERIFICATION_FAILED", "Token verification failed");
    }
  }
});
