// functions/index.js

const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const axios = require("axios");

// เริ่มต้น Firebase Admin SDK
// สำหรับ Emulator ให้ใช้ service account key
if (process.env.FUNCTIONS_EMULATOR) {
  // รันใน Emulator
  const serviceAccount = require("../serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  // รันใน Production
  admin.initializeApp();
}

// ตั้งค่า global options สำหรับ functions ทั้งหมด
setGlobalOptions({
  region: "asia-southeast1",
  maxInstances: 5,
});

// การตั้งค่า LINE OAuth
const LINE_CONFIG = {
  CHANNEL_ID: "2007733529",
  CHANNEL_SECRET: "4e3197d83a8d9836ae5794fda50b698a",
  VERIFY_URL: "https://api.line.me/oauth2/v2.1/verify",
};

/**
 * จัดการ CORS headers
 * @param {Object} request - Express request object
 * @param {Object} response - Express response object
 * @return {boolean} True ถ้า origin อนุญาต
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
    return false; // Preflight request handled
  }

  return true;
}

// ฟังก์ชัน LINE Login
exports.verifyLineLogin = onRequest(async (request, response) => {
  // จัดการ CORS
  if (!handleCORS(request, response)) {
    return; // Preflight request handled
  }

  try {
    const { accessToken, sub, email } = request.query;
    console.log("accessToken:", accessToken);
    console.log("sub:", sub);
    console.log("email:", email);

    if (!accessToken) {
      return response.status(400).json({
        success: false,
        error: "Access token is required",
      });
    }

    console.log(`🔍 Verifying LINE access token: ${accessToken.substring(0, 20)}...`);

    // Verify token with LINE API using GET method
    const verifyResponse = await axios.get(`https://api.line.me/oauth2/v2.1/verify?access_token=${accessToken}`);
    // VerifyLine Client
    const verifyData = verifyResponse.data;
    console.log("✅ LINE token verification successful:", {
      clientId: verifyData.client_id,
      expiresIn: verifyData.expires_in,
      scope: verifyData.scope,
    });

    // Check if the client ID matches our LINE channel
    if (verifyData.client_id == LINE_CONFIG.CHANNEL_ID) {
      console.log("✅ LINE channel ID verified successfully");

      // Get user email from LINE service (this should come from your actual service)
      // const emailTest = "suwijuk@mfec.co.th"; // ควรได้จาก request service จริง

      let uid;
      let customToken = "";
      // Logic Check User FireBase
      try {
        // Check if user already exists with this email
        const existingUser = await admin.auth().getUserByEmail(email);
        console.log("✅ Found existing user:", existingUser.uid);
        uid = existingUser.uid; // Use existing UID to link account

        // ใช้ uid สร้าง custom token
        customToken = await admin.auth().createCustomToken(uid);
        console.log("✅ Custom token created:", customToken);
      } catch (err) {
        if (err.code === "auth/user-not-found") {
          console.log(`ℹ️ User with email ${email} not found, creating new user`);

          // Create new user with LINE sub as UID
          // const sub = "U0790667d818d612bb8fb8af91e30db8a";
          // uid = sub;
          uid = sub;
          await admin.auth().createUser({
            uid: uid,
            // displayName: "",
            email: email,
            // photoURL: verifyData.picture, // Uncomment if you have picture URL
          });
          customToken = await admin.auth().createCustomToken(uid);
          console.log(`✅ Created new user with UID: ${uid}`);
        } else {
          throw err;
        }
      }

      console.log(`🔗 User UID: ${uid}`);

      response.json({
        success: true,
        // message: "LINE access token verified successfully",
        // verificationData: verifyData,
        // userUid: uid,
        customToken: customToken,
        // timestamp: new Date().toISOString()
      });
    } else {
      console.log("❌ Invalid LINE channel ID");
      return response.status(400).json({
        success: false,
        error: "Invalid LINE channel ID",
      });
    }
  } catch (error) {
    console.error("❌ LINE token verification error:", error);

    if (error.response) {
      // LINE API returned an error response
      console.error("LINE API error response:", {
        status: error.response.status,
        data: error.response.data,
      });

      response.status(error.response.status).json({
        success: false,
        error: "LINE token verification failed",
        details: error.response.data,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Network or other error
      response.status(500).json({
        success: false,
        error: "Token verification failed",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
});
