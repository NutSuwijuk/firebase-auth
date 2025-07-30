// functions/index.js

const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const admin = require("firebase-admin");
const axios = require("axios");
const {v4: uuidv4} = require("uuid");

// Initialize Firebase Admin SDK for emulator
admin.initializeApp({
  projectId: "daring-calling-827",
});

// Set global options for all functions
setGlobalOptions({
  region: "asia-southeast1",
  maxInstances: 5,
});

// Performance Metrics Tracking
let invocationCount = {
  getLineAuthUrlHttp: 0,
  processLineCallbackHttp: 0,
};

// Global performance tracking
let globalPerformance = {
  totalInvocations: 0,
  totalExecutionTime: 0,
  totalMemoryUsed: 0,
  totalOutboundSize: 0,
  startTime: Date.now(),
  functionStats: {
    getLineAuthUrlHttp: {
      invocations: 0,
      totalTime: 0,
      totalMemory: 0,
      totalOutbound: 0,
      avgTime: 0,
      avgMemory: 0,
      avgOutbound: 0
    },
    processLineCallbackHttp: {
      invocations: 0,
      totalTime: 0,
      totalMemory: 0,
      totalOutbound: 0,
      avgTime: 0,
      avgMemory: 0,
      avgOutbound: 0
    }
  }
};

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
 * Helper function to log performance metrics
 * @param {string} functionName - Name of the function
 * @param {number} startTime - Start time in milliseconds
 * @param {number} startMemory - Start memory usage in MB
 * @param {number} responseSize - Response size in bytes
 */
function logPerformanceMetrics(functionName, startTime, startMemory, responseSize = 0) {
  const endTime = Date.now();
  const endMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
  const executionTime = endTime - startTime;
  const memoryUsed = endMemory - startMemory;
  
  // Update global performance tracking
  globalPerformance.totalInvocations++;
  globalPerformance.totalExecutionTime += executionTime;
  globalPerformance.totalMemoryUsed += memoryUsed;
  globalPerformance.totalOutboundSize += responseSize;
  
  // Update function-specific stats
  const functionStats = globalPerformance.functionStats[functionName];
  functionStats.invocations++;
  functionStats.totalTime += executionTime;
  functionStats.totalMemory += memoryUsed;
  functionStats.totalOutbound += responseSize;
  
  // Calculate averages
  functionStats.avgTime = functionStats.totalTime / functionStats.invocations;
  functionStats.avgMemory = functionStats.totalMemory / functionStats.invocations;
  functionStats.avgOutbound = functionStats.totalOutbound / functionStats.invocations;
  
  console.log(`=== Performance Metrics for ${functionName} ===`);
  console.log(`Total Invocations: ${invocationCount[functionName]}`);
  console.log(`Execution Time: ${executionTime}ms`);
  console.log(`Memory Used: ~${memoryUsed.toFixed(2)} MB`);
  console.log(`Peak Memory: ~${endMemory.toFixed(2)} MB`);
  console.log(`Outbound Networking Size: ${responseSize} bytes`);
  console.log(`==============================================`);
  
  // Log summary after each invocation
  logGlobalSummary();
}

/**
 * Helper function to log global performance summary
 */
function logGlobalSummary() {
  const uptime = Date.now() - globalPerformance.startTime;
  const uptimeMinutes = (uptime / 1000 / 60).toFixed(2);
  
  console.log(`\n📊 GLOBAL PERFORMANCE SUMMARY`);
  console.log(`==============================================`);
  console.log(`⏱️  Uptime: ${uptimeMinutes} minutes`);
  console.log(`🔄 Total Invocations: ${globalPerformance.totalInvocations}`);
  console.log(`⚡ Total Execution Time: ${globalPerformance.totalExecutionTime}ms`);
  console.log(`💾 Total Memory Used: ~${globalPerformance.totalMemoryUsed.toFixed(2)} MB`);
  console.log(`📤 Total Outbound Data: ${globalPerformance.totalOutboundSize} bytes`);
  
  if (globalPerformance.totalInvocations > 0) {
    console.log(`\n📈 AVERAGES:`);
    console.log(`⚡ Avg Execution Time: ${(globalPerformance.totalExecutionTime / globalPerformance.totalInvocations).toFixed(2)}ms`);
    console.log(`💾 Avg Memory Used: ~${(globalPerformance.totalMemoryUsed / globalPerformance.totalInvocations).toFixed(2)} MB`);
    console.log(`📤 Avg Outbound Data: ${(globalPerformance.totalOutboundSize / globalPerformance.totalInvocations).toFixed(0)} bytes`);
  }
  
  console.log(`\n🔧 FUNCTION BREAKDOWN:`);
  
  // getLineAuthUrlHttp stats
  const authUrlStats = globalPerformance.functionStats.getLineAuthUrlHttp;
  if (authUrlStats.invocations > 0) {
    console.log(`\n  📋 getLineAuthUrlHttp:`);
    console.log(`    🔄 Invocations: ${authUrlStats.invocations}`);
    console.log(`    ⚡ Avg Time: ${authUrlStats.avgTime.toFixed(2)}ms`);
    console.log(`    💾 Avg Memory: ~${authUrlStats.avgMemory.toFixed(2)} MB`);
    console.log(`    📤 Avg Outbound: ${authUrlStats.avgOutbound.toFixed(0)} bytes`);
  }
  
  // processLineCallbackHttp stats
  const callbackStats = globalPerformance.functionStats.processLineCallbackHttp;
  if (callbackStats.invocations > 0) {
    console.log(`\n  📋 processLineCallbackHttp:`);
    console.log(`    🔄 Invocations: ${callbackStats.invocations}`);
    console.log(`    ⚡ Avg Time: ${callbackStats.avgTime.toFixed(2)}ms`);
    console.log(`    💾 Avg Memory: ~${callbackStats.avgMemory.toFixed(2)} MB`);
    console.log(`    📤 Avg Outbound: ${callbackStats.avgOutbound.toFixed(0)} bytes`);
  }
  
  console.log(`\n💰 ESTIMATED COSTS (per 1000 invocations):`);
  const avgExecutionTime = globalPerformance.totalInvocations > 0 ? 
    globalPerformance.totalExecutionTime / globalPerformance.totalInvocations : 0;
  const avgMemory = globalPerformance.totalInvocations > 0 ? 
    globalPerformance.totalMemoryUsed / globalPerformance.totalInvocations : 0;
  
  const cpuSeconds = (avgExecutionTime / 1000) * 1000; // Convert ms to seconds for 1000 invocations
  const gbSeconds = (avgMemory / 1024) * (avgExecutionTime / 1000) * 1000; // Convert MB to GB and ms to seconds
  const outboundMB = (globalPerformance.totalOutboundSize / globalPerformance.totalInvocations) * 1000 / 1024 / 1024; // Convert bytes to MB
  
  console.log(`    ⚡ CPU-seconds: ${cpuSeconds.toFixed(2)}`);
  console.log(`    💾 GB-seconds: ${gbSeconds.toFixed(4)}`);
  console.log(`    📤 Outbound: ${outboundMB.toFixed(2)} MB`);
  
  console.log(`==============================================\n`);
}

/**
 * Helper function to reset performance metrics
 */
function resetPerformanceMetrics() {
  globalPerformance = {
    totalInvocations: 0,
    totalExecutionTime: 0,
    totalMemoryUsed: 0,
    totalOutboundSize: 0,
    startTime: Date.now(),
    functionStats: {
      getLineAuthUrlHttp: {
        invocations: 0,
        totalTime: 0,
        totalMemory: 0,
        totalOutbound: 0,
        avgTime: 0,
        avgMemory: 0,
        avgOutbound: 0
      },
      processLineCallbackHttp: {
        invocations: 0,
        totalTime: 0,
        totalMemory: 0,
        totalOutbound: 0,
        avgTime: 0,
        avgMemory: 0,
        avgOutbound: 0
      }
    }
  };
  
  invocationCount = {
    getLineAuthUrlHttp: 0,
    processLineCallbackHttp: 0,
  };
  
  console.log('🔄 Performance metrics have been reset!');
}

/**
 * Helper function to get current performance stats
 * @return {Object} Current performance statistics
 */
function getPerformanceStats() {
  return {
    global: globalPerformance,
    invocationCount: invocationCount,
    uptime: Date.now() - globalPerformance.startTime
  };
}

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
  // Performance tracking start
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
  invocationCount.getLineAuthUrlHttp++;
  
  console.log(`=== Starting getLineAuthUrlHttp (Invocation #${invocationCount.getLineAuthUrlHttp}) ===`);
  
  // Handle CORS
  if (!handleCORS(request, response)) {
    return; // Preflight request handled
  }

  try {
    const {authUrl, state} = generateLineAuthUrl();

    const responseData = {
      success: true,
      authUrl: authUrl,
      state: state,
    };
    
    // Calculate response size
    const responseString = JSON.stringify(responseData);
    const responseSize = Buffer.from(responseString).length;
    
    // Log performance metrics
    logPerformanceMetrics('getLineAuthUrlHttp', startTime, startMemory, responseSize);
    
    response.json(responseData);
  } catch (error) {
    console.error("Error generating LINE auth URL:", error);
    
    const errorResponse = {
      success: false,
      error: `Failed to generate LINE authorization URL: ${error.message}`,
    };
    
    const responseString = JSON.stringify(errorResponse);
    const responseSize = Buffer.from(responseString).length;
    
    // Log performance metrics even for errors
    logPerformanceMetrics('getLineAuthUrlHttp', startTime, startMemory, responseSize);
    
    response.status(500).json(errorResponse);
  }
});

// HTTP function for LINE Callback processing
exports.processLineCallbackHttp = onRequest(async (request, response) => {
  // Performance tracking start
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
  invocationCount.processLineCallbackHttp++;
  
  console.log(`=== Starting processLineCallbackHttp (Invocation #${invocationCount.processLineCallbackHttp}) ===`);
  
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
      
      const errorResponse = {
        success: false,
        error: "Authorization code and state are required",
      };
      
      const responseString = JSON.stringify(errorResponse);
      const responseSize = Buffer.from(responseString).length;
      
      logPerformanceMetrics('processLineCallbackHttp', startTime, startMemory, responseSize);
      
      response.status(400).json(errorResponse);
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
      const errorResponse = {
        success: false,
        error: "Email permission not granted in LINE",
      };
      
      const responseString = JSON.stringify(errorResponse);
      const responseSize = Buffer.from(responseString).length;
      
      logPerformanceMetrics('processLineCallbackHttp', startTime, startMemory, responseSize);
      
      response.status(400).json(errorResponse);
      return;
    }

    const firebaseUid = await createOrUpdateFirebaseUser(lineEmail,
        lineDisplayName, linePictureUrl);

    // 5. Create custom token
    const customToken = await admin.auth().createCustomToken(firebaseUid);
    console.log(`Generated custom token for UID: ${firebaseUid}`);

    // 6. Return data
    const responseData = {
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
    };
    
    // Calculate response size
    const responseString = JSON.stringify(responseData);
    const responseSize = Buffer.from(responseString).length;
    
    // Log performance metrics
    logPerformanceMetrics('processLineCallbackHttp', startTime, startMemory, responseSize);
    
    response.json(responseData);
  } catch (error) {
    console.error("Error processing LINE callback:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response && error.response.data,
    });
    
    const errorResponse = {
      success: false,
      error: `LINE login failed: ${error.message}`,
      details: (error.response && error.response.data) || error.stack,
    };
    
    const responseString = JSON.stringify(errorResponse);
    const responseSize = Buffer.from(responseString).length;
    
    // Log performance metrics even for errors
    logPerformanceMetrics('processLineCallbackHttp', startTime, startMemory, responseSize);
    
    response.status(500).json(errorResponse);
  }
});

// HTTP function for getting performance statistics
exports.getPerformanceStatsHttp = onRequest(async (request, response) => {
  // Handle CORS
  if (!handleCORS(request, response)) {
    return; // Preflight request handled
  }

  try {
    const stats = getPerformanceStats();
    
    const responseData = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: stats
    };
    
    response.json(responseData);
  } catch (error) {
    console.error("Error getting performance stats:", error);
    
    const errorResponse = {
      success: false,
      error: `Failed to get performance stats: ${error.message}`,
    };
    
    response.status(500).json(errorResponse);
  }
});

// HTTP function for resetting performance metrics
exports.resetPerformanceMetricsHttp = onRequest(async (request, response) => {
  // Handle CORS
  if (!handleCORS(request, response)) {
    return; // Preflight request handled
  }

  try {
    resetPerformanceMetrics();
    
    const responseData = {
      success: true,
      message: "Performance metrics have been reset successfully",
      timestamp: new Date().toISOString()
    };
    
    response.json(responseData);
  } catch (error) {
    console.error("Error resetting performance metrics:", error);
    
    const errorResponse = {
      success: false,
      error: `Failed to reset performance metrics: ${error.message}`,
    };
    
    response.status(500).json(errorResponse);
  }
});
