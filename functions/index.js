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
  // maxInstances: 5,
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
        status: false,
        code: "MISSING_TOKEN",
        message: "Access token is required",
        data: null,
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
      // Logic Check User FireBase
      try {
        // Check if user already exists with this email
        const existingUser = await admin.auth().getUserByEmail(email);
        console.log("✅ Found existing user:", existingUser.uid);
        uid = existingUser.uid; // Use existing UID to link account
      } catch (err) {
        if (err.code === "auth/user-not-found") {
          console.log(`ℹ️ User with email ${email} not found, creating new user`);

          // Create new user with LINE sub as UID
          uid = sub;
          await admin.auth().createUser({
            uid: uid,
            // displayName: "",
            email: email,
            // photoURL: verifyData.picture, // Uncomment if you have picture URL
          });
          console.log(`✅ Created new user with UID: ${uid}`);
        } else {
          throw err;
        }
      }

      // สร้าง custom token หลังจากได้ uid แล้ว (เรียกที่เดียว)
      console.log(`🔗 User UID: ${uid}`);
      const customToken = await admin.auth().createCustomToken(uid);
      console.log("✅ Custom token created:", customToken);

      // แลก Custom Token เป็น ID Token ผ่าน REST API
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

      // ตรวจสอบว่าได้ idToken หรือไม่
      if (!idTokenData.idToken) {
        throw new Error("ID token not received from Firebase");
      }

      response.json({
        status: true,
        code: "SUCCESS",
        message: "Success",
        data: {
          // custom_token: customToken,
          id_token: idTokenData.idToken,
          // refresh_token: idTokenData.refreshToken,
          // expires_in: idTokenData.expiresIn,
          // user_uid: uid,
        },
      });
    } else {
      console.log("❌ Invalid LINE channel ID");
      return response.status(400).json({
        status: false,
        code: "INVALID_CHANNEL",
        message: "Invalid LINE channel ID",
        data: null,
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
        status: false,
        code: "LINE_VERIFICATION_FAILED",
        message: "LINE token verification failed",
        data: null,
      });
    } else {
      // Network or other error
      response.status(500).json({
        status: false,
        code: "VERIFICATION_FAILED",
        message: "Token verification failed",
        data: null,
      });
    }
  }
});
