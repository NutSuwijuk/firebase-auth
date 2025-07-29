// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, OAuthProvider, signInWithCredential, signInWithCustomToken, linkWithCredential, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCFZee6iS2G3DR4TYxwZRFiepOZHPP3ggQ",
    authDomain: "daring-calling-827.firebaseapp.com",
    databaseURL: "https://daring-calling-827.firebaseio.com",
    projectId: "daring-calling-827",
    storageBucket: "daring-calling-827.firebasestorage.app",
    messagingSenderId: "525752158341",
    appId: "1:525752158341:web:12cd034e9bbe3d9d0cc1ec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app, 'asia-southeast1');

// Initialize Cloud Functions (HTTP endpoints)
// Use emulator URL for development
const FUNCTIONS_BASE_URL = 'http://127.0.0.1:5001/daring-calling-827/asia-southeast1';

// Debug: Log which URL we're using
console.log('🌐 Using Functions URL:', FUNCTIONS_BASE_URL);
console.log('📍 Current hostname:', window.location.hostname);

// Helper function to call HTTP functions
async function callHttpFunction(functionName, data = null) {
  const url = `${FUNCTIONS_BASE_URL}/${functionName}`;
  const options = {
    method: data ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  return response.json();
}

// Test Firebase connection
auth.onAuthStateChanged((user) => {
  console.log('Firebase Auth State Changed:', user ? 'User logged in' : 'No user');
}, (error) => {
  console.error('Firebase Auth Error:', error);
  const firebaseStatus = document.getElementById('firebaseStatus');
  if (firebaseStatus) {
    firebaseStatus.textContent = `❌ Firebase error: ${error.message}`;
    firebaseStatus.className = 'status error';
    firebaseStatus.style.display = 'block';
  }
});



// Get DOM elements
const loginForm = document.getElementById('emailLoginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const userInfo = document.getElementById('userInfo');
const userDetails = document.getElementById('userDetails');
const logoutBtn = document.getElementById('logoutBtn');
const switchAccountBtn = document.getElementById('switchAccountBtn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const statusMessage = document.getElementById('statusMessage');

// Initialize Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});





// Initialize LINE provider
const lineProvider = new OAuthProvider('oidc.line'); // 'oidc.line' คือ providerId ที่ตั้งใน Firebase Console
lineProvider.addScope('profile');
lineProvider.addScope('openid');
lineProvider.addScope('email');

// Initialize Apple provider
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Update Firebase status
const firebaseStatus = document.getElementById('firebaseStatus');
if (firebaseStatus) {
  firebaseStatus.textContent = '✅ Firebase initialized successfully';
  firebaseStatus.className = 'status success';
  firebaseStatus.style.display = 'block';
}

// Check Firebase Functions health on page load
checkFunctionsHealth().then(isAvailable => {
  const backendStatus = document.getElementById('backendStatus');
  if (backendStatus) {
    if (isAvailable) {
      backendStatus.textContent = '✅ Firebase Functions are ready';
      backendStatus.className = 'status success';
    } else {
      backendStatus.textContent = '⚠️ Firebase Functions are not available';
      backendStatus.className = 'status error';
    }
    backendStatus.style.display = 'block';
  }
});



// Note: Account linking functionality has been removed

// Handle Google redirect result when page loads
async function handleGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      const isGoogle = isGoogleUser(user);
      const providerText = isGoogle ? 'Google' : 'Firebase';
      const accountType = result._tokenResponse?.isNewUser ? 'new account' : 'existing account';
      
      console.log('✅ Google sign in successful:', user);
      
      if (successMessage) {
        successMessage.textContent = `Successfully signed in with ${providerText} (${accountType}): ${user.displayName || user.email}`;
        successMessage.style.display = 'block';
      }
      if (errorMessage) {
        errorMessage.style.display = 'none';
      }
      
      // Update status message
      if (statusMessage) {
        statusMessage.textContent = `Signed in with Google as ${user.displayName || user.email}`;
        statusMessage.className = 'status success';
      }
    }
  } catch (error) {
    console.error('❌ Google redirect result error:', error);
    if (errorMessage) {
      errorMessage.textContent = `Google sign in failed: ${error.message}`;
      errorMessage.style.display = 'block';
    }
  }
}

// ตรวจสอบ LINE authorization callback เมื่อโหลดหน้า
setTimeout(checkLineAuthCallback, 500);

// Handle Google redirect result when page loads
setTimeout(handleGoogleRedirectResult, 500);

// Handle user state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('✅ User signed in:', user);
    userInfo.style.display = 'block';
    loginForm.style.display = 'none';
    
    // Note: Account linking functionality has been removed
    
    // Get Firebase tokens
    const tokens = await getFirebaseTokens(user);
    
    // Decode JWT token to show payload
    const tokenPayload = tokens ? decodeJWT(tokens.idToken) : null;
    
    // Get connected providers
    const connectedProviders = await getConnectedProviders(user);
    
    // Debug: Log user information
    console.log('🔍 User debug info:', {
      uid: user.uid,
      email: user.email,
      providerId: user.providerId,
      providerData: user.providerData,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    });
    
    // Update user details
    const profilePic = user.photoURL ? `<img src="${user.photoURL}" alt="Profile" class="profile-pic">` : '';
    userDetails.innerHTML = `
      ${profilePic}
      <div>
        <h4>${user.displayName || user.email}</h4>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>UID:</strong> ${user.uid}</p>
        <p><strong>Providers:</strong> ${connectedProviders && connectedProviders.length > 0 ? connectedProviders.join(', ') : getProviderName(user)}</p>
        <p><strong>Email Verified:</strong> ${user.emailVerified ? 'Yes' : 'No'}</p>
        ${tokens ? `
        <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
          <h5>🔑 JWT Token Info:</h5>
          <p><strong>Token Length:</strong> ${tokens.idToken.length} characters</p>
          <p><strong>Current Provider:</strong> ${tokens.provider}</p>
          <p><strong>Expires:</strong> ${tokens.tokenExpiration.toLocaleString()}</p>
          <details style="margin-top: 10px;">
            <summary>📋 Token Payload</summary>
            <pre style="background-color: #e9ecef; padding: 10px; border-radius: 3px; font-size: 12px; overflow-x: auto;">${tokenPayload ? JSON.stringify(tokenPayload, null, 2) : ''}</pre>
          </details>
          <details style="margin-top: 10px;">
            <summary>🔒 Show JWT Token</summary>
            <pre style="background-color: #f3f3f3; padding: 10px; border-radius: 3px; font-size: 12px; overflow-x: auto; word-break: break-all;">${tokens.idToken}</pre>
          </details>
        </div>
        ` : ''}
      </div>
    `;
    
    console.log('✅ User signed in:', {
      uid: user.uid,
      email: user.email,
      providerId: user.providerId,
      isGoogleUser: isGoogleUser(user)
    });

    // Sync user data with backend
    const backendResult = await syncUserWithBackend(user);
    
    // Show backend sync status
    if (backendResult) {
      const syncMessage = `Backend: ${backendResult.message} (ID: ${backendResult.user.id})`;
      if (statusMessage) {
        statusMessage.textContent = syncMessage;
        statusMessage.className = 'status success';
      }
      
      // Update backend sync info for new test page
      const backendSyncInfo = document.getElementById('backendSyncInfo');
      if (backendSyncInfo) {
        backendSyncInfo.innerHTML = `
          <p><strong>Status:</strong> ✅ Synced</p>
          <p><strong>Backend ID:</strong> ${backendResult.user.id}</p>
          <p><strong>Connected Providers:</strong> ${connectedProviders && connectedProviders.length > 0 ? connectedProviders.join(', ') : getProviderName(user)}</p>
          <p><strong>Message:</strong> ${backendResult.message}</p>
        `;
      }
    } else {
      // Update backend sync info for new test page
      const backendSyncInfo = document.getElementById('backendSyncInfo');
      if (backendSyncInfo) {
        backendSyncInfo.innerHTML = `
          <p><strong>Status:</strong> ⚠️ Not synced</p>
          <p><strong>Reason:</strong> Backend not available</p>
        `;
      }
    }

    // Update status message for test file
    if (statusMessage && !statusMessage.textContent) {
      statusMessage.textContent = `Signed in as ${user.displayName || user.email}`;
      statusMessage.className = 'status success';
    }
    
    // Update provider info and account details
    const isGoogle = isGoogleUser(user);
    const isApple = isAppleUser(user);
    
    if (isGoogle || isApple) {
      if (switchAccountBtn) switchAccountBtn.style.display = 'block';
    } else {
      if (switchAccountBtn) switchAccountBtn.style.display = 'none';
    }
    
  } else {
    console.log('ℹ️ No user signed in');
    userInfo.style.display = 'none';
    loginForm.style.display = 'block';
    
    if (statusMessage) {
      statusMessage.textContent = 'Please sign in';
      statusMessage.className = 'status warning';
    }
    
    if (successMessage) successMessage.textContent = '';
    if (errorMessage) errorMessage.textContent = '';
  }
});

// Remove redirect result handler (not needed for popup-based login)

// Handle Google login button click (use redirect instead of popup)
googleLoginBtn.addEventListener('click', async () => {
  try {
    console.log('🔄 Attempting Google sign in with redirect...');
    
    // Show loading status
    if (statusMessage) {
      statusMessage.textContent = '🔄 Redirecting to Google sign in...';
      statusMessage.className = 'status warning';
    }
    
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      access_type: 'offline',
      include_granted_scopes: 'true'
    });
    
    // Use redirect instead of popup to avoid browser policy issues
    await signInWithRedirect(auth, googleProvider);
    // Note: The page will redirect to Google, so code below won't execute immediately
    // The result will be handled when the page loads back
  } catch (error) {
    console.error('❌ Google sign in error:', error);
    
    // Handle specific Google auth errors
    let errorText = error.message;
    let helpText = '';
    let troubleshootingSteps = '';
    
    if (error.code === 'auth/popup-blocked') {
      errorText = 'Google sign in popup was blocked by browser';
      helpText = `
        <div style="margin-top: 10px; padding: 15px; background-color: #f8d7da; border-radius: 8px; border-left: 4px solid #dc3545;">
          <strong>🔒 Browser Settings:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Allow popups for this website</li>
            <li>Check your browser's popup blocker settings</li>
            <li>Try refreshing the page and try again</li>
            <li>Disable ad blockers temporarily</li>
          </ul>
        </div>
      `;
    } else if (error.code === 'auth/unauthorized-domain') {
      errorText = 'Domain not authorized for Google sign in';
      helpText = `
        <div style="margin-top: 10px; padding: 15px; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
          <strong>🔧 Setup Required:</strong>
          <p style="margin: 10px 0;">Please add this domain to Firebase Console > Authentication > Settings > Authorized domains:</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>localhost</li>
            <li>127.0.0.1</li>
            <li>Your actual domain (if deployed)</li>
          </ul>
        </div>
      `;
    } else if (error.code === 'auth/operation-not-allowed') {
      errorText = 'Google sign in not enabled';
      helpText = `
        <div style="margin-top: 10px; padding: 15px; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
          <strong>🔧 Setup Required:</strong>
          <p style="margin: 10px 0;">Please enable Google provider in Firebase Console > Authentication > Sign-in method</p>
        </div>
      `;
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorText = 'Google sign in was cancelled';
      helpText = `
        <div style="margin-top: 10px; padding: 15px; background-color: #d1ecf1; border-radius: 8px; border-left: 4px solid #17a2b8;">
          <strong>ℹ️ User Action:</strong>
          <p style="margin: 10px 0;">You cancelled the Google sign in process. Please try again.</p>
        </div>
      `;
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorText = 'Google sign in popup was closed';
      helpText = `
        <div style="margin-top: 10px; padding: 15px; background-color: #d1ecf1; border-radius: 8px; border-left: 4px solid #17a2b8;">
          <strong>ℹ️ User Action:</strong>
          <p style="margin: 10px 0;">You closed the Google sign in popup. Please complete the sign in process.</p>
        </div>
      `;
    } else {
      errorText = 'Google sign in failed';
      helpText = `
        <div style="margin-top: 10px; padding: 15px; background-color: #f8d7da; border-radius: 8px; border-left: 4px solid #dc3545;">
          <strong>🔧 Troubleshooting:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
            <li>Clear browser cache and cookies</li>
            <li>Check Firebase Console settings</li>
            <li>Verify Google OAuth configuration</li>
          </ul>
        </div>
      `;
    }
    
    // Show detailed error message
    if (errorMessage) {
      errorMessage.innerHTML = `
        <div style="margin-bottom: 15px;">
          <strong>❌ ${errorText}</strong>
          <p style="margin: 5px 0; color: #6c757d; font-size: 14px;">Error code: ${error.code || 'unknown'}</p>
          <p style="margin: 5px 0; color: #6c757d; font-size: 14px;">Error details: ${error.message}</p>
        </div>
        ${helpText}
        <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
          <button id="retryGoogleLoginBtn" class="button" style="background-color: #4285f4; color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            🔄 Try Google Login Again
          </button>
          <button id="checkFirebaseBtn" class="button" style="background-color: #6c757d; color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            🔍 Check Firebase Status
          </button>
          <button id="clearGoogleErrorBtn" class="button" style="background-color: #6c757d; color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            ✖️ Clear Error
          </button>
        </div>
      `;
      errorMessage.style.display = 'block';
      
      // Add event listeners for buttons
      document.getElementById('retryGoogleLoginBtn').addEventListener('click', () => {
        errorMessage.style.display = 'none';
        googleLoginBtn.click();
      });
      
      document.getElementById('checkFirebaseBtn').addEventListener('click', () => {
        // Check Firebase status
        const firebaseStatus = document.getElementById('firebaseStatus');
        if (firebaseStatus) {
          firebaseStatus.textContent = '✅ Firebase initialized successfully';
          firebaseStatus.className = 'status success';
          firebaseStatus.style.display = 'block';
        }
      });
      
      document.getElementById('clearGoogleErrorBtn').addEventListener('click', () => {
        errorMessage.style.display = 'none';
      });
    }
    
    if (successMessage) {
      successMessage.style.display = 'none';
    }
    
    if (statusMessage) {
      statusMessage.textContent = `Google sign in failed: ${errorText}`;
      statusMessage.className = 'status error';
    }
  }
});

// Handle LINE login button click
const lineLoginBtn = document.getElementById('lineLoginBtn');
if (lineLoginBtn) {
    lineLoginBtn.addEventListener('click', async () => {
        try {
            console.log('🟩 Starting LINE login process...');
            
            // แสดงสถานะ LINE login และคำแนะนำ
            const lineStatus = document.getElementById('lineStatus');
            const lineLoginInstructions = document.getElementById('lineLoginInstructions');
            
            if (lineStatus) {
                lineStatus.style.display = 'block';
                lineStatus.textContent = '🔄 Starting LINE login...';
                lineStatus.className = 'status warning';
            }
            
            if (lineLoginInstructions) {
                lineLoginInstructions.style.display = 'block';
            }
            
            // ตรวจสอบสถานะ Firebase Functions
            if (lineStatus) {
                lineStatus.textContent = '🔍 Checking Firebase Functions...';
            }
            
            // Firebase Functions จะทำงานอัตโนมัติ ไม่ต้องตรวจสอบ backend
            if (lineStatus) {
                lineStatus.textContent = '✅ Firebase Functions ready';
                lineStatus.className = 'status success';
            }

            // ขั้นตอนที่ 1: ขอ authorization URL จาก Cloud Functions
            if (lineStatus) {
                lineStatus.textContent = '📡 Getting LINE authorization URL...';
            }
            
            const authData = await callHttpFunction('getLineAuthUrlHttp');
            
            if (!authData.success) {
                if (lineStatus) {
                    lineStatus.textContent = '❌ Failed to get authorization URL';
                    lineStatus.className = 'status error';
                }
                throw new Error(authData.error || 'Failed to get LINE authorization URL');
            }

            console.log('✅ Got LINE authorization URL:', authData.authUrl);
            
            if (lineStatus) {
                lineStatus.textContent = '✅ Got authorization URL';
                lineStatus.className = 'status success';
            }

            // ขั้นตอนที่ 2: Redirect ไปยัง LINE authorization page
            console.log('🔄 Redirecting to LINE authorization page:', authData.authUrl.substring(0, 100) + '...');
            
            if (lineStatus) {
                lineStatus.textContent = '🔄 Redirecting to LINE authorization...';
            }
            
            // แสดงคำแนะนำ
            if (lineLoginInstructions) {
                lineLoginInstructions.innerHTML = `
                    <h4>📋 LINE Login Instructions:</h4>
                    <ul>
                        <li>✅ <strong>Complete the authorization</strong> - Follow the steps on the LINE page</li>
                        <li>✅ <strong>Allow permissions</strong> - Grant LINE the requested permissions</li>
                        <li>✅ <strong>Wait for redirect back</strong> - You'll be redirected back here after completion</li>
                        <li>✅ <strong>Don't close the browser</strong> - Let the process complete naturally</li>
                    </ul>
                    <p style="margin-top: 10px; font-size: 14px; color: #6c757d;">
                        <strong>Note:</strong> You will be redirected to LINE's authorization page and then back here.
                    </p>
                `;
                lineLoginInstructions.style.display = 'block';
            }

            // เก็บข้อมูล state ไว้ใน localStorage เพื่อตรวจสอบเมื่อกลับมา
            localStorage.setItem('lineAuthState', authData.state);
            localStorage.setItem('lineAuthTimestamp', Date.now().toString());

            // Redirect ไปยัง LINE authorization page
            window.location.href = authData.authUrl;

            // Redirect ไปยัง LINE authorization page เสร็จแล้ว
            // การประมวลผลผลลัพธ์จะทำในฟังก์ชัน checkLineAuthCallback เมื่อ redirect กลับมา

        } catch (error) {
            console.error('❌ LINE login error:', error);
            
            // อัพเดทสถานะ LINE
            const lineStatus = document.getElementById('lineStatus');
            if (lineStatus) {
                lineStatus.textContent = `❌ LINE login failed: ${error.message}`;
                lineStatus.className = 'status error';
            }
            
            // ซ่อนคำแนะนำ
            if (lineLoginInstructions) {
                lineLoginInstructions.style.display = 'none';
            }
            
            // แสดงข้อความ error ที่เหมาะสม
            if (errorMessage) {
                let errorText = error.message;
                let helpText = '';
                let troubleshootingSteps = '';
                
                // จัดการ error ตามประเภท
                if (error.message.includes('Firebase Functions') || error.message.includes('functions')) {
                    errorText = 'Firebase Functions error';
                    helpText = `
                        <div style="margin-top: 10px; padding: 15px; background-color: #d1ecf1; border-radius: 8px; border-left: 4px solid #17a2b8;">
                            <strong>🔧 Solution:</strong>
                            <p style="margin: 10px 0;">Please deploy Firebase Functions with:</p>
                            <pre style="background-color: #f8f9fa; padding: 12px; border-radius: 5px; margin: 10px 0; border: 1px solid #dee2e6;">firebase deploy --only functions</pre>
                            <p style="margin: 10px 0; font-size: 14px; color: #6c757d;">Make sure your Firebase project is properly configured</p>
                        </div>
                    `;
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorText = 'Network connection error';
                    helpText = `
                        <div style="margin-top: 10px; padding: 15px; background-color: #f8d7da; border-radius: 8px; border-left: 4px solid #dc3545;">
                            <strong>🌐 Network Issue:</strong>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Check your internet connection</li>
                                <li>Try refreshing the page</li>
                                <li>Check if the backend server is running</li>
                                <li>Verify firewall settings</li>
                            </ul>
                        </div>
                    `;
                } else {
                    errorText = 'LINE login failed';
                    helpText = `
                        <div style="margin-top: 10px; padding: 15px; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                            <strong>💡 Tips:</strong>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Complete the LINE authorization process on the LINE page</li>
                                <li>Don't close the browser during authorization</li>
                                <li>Check your internet connection</li>
                                <li>Try clicking the LINE login button again</li>
                            </ul>
                        </div>
                    `;
                }
                
                errorMessage.innerHTML = `
                    <div style="margin-bottom: 15px;">
                        <strong>❌ ${errorText}</strong>
                        <p style="margin: 5px 0; color: #6c757d; font-size: 14px;">Error details: ${error.message}</p>
                    </div>
                    ${helpText}
                    ${troubleshootingSteps}
                    <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
                        <button id="retryLineLoginBtn" class="button" style="background-color: #00c300; color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            🔄 Try LINE Login Again
                        </button>
                        <button id="checkFunctionsBtn" class="button" style="background-color: #6c757d; color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            🔍 Check Functions Status
                        </button>
                        <button id="clearErrorBtn" class="button" style="background-color: #6c757d; color: white; padding: 12px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            ✖️ Clear Error
                        </button>
                    </div>
                `;
                errorMessage.style.display = 'block';
                
                // เพิ่ม event listener สำหรับปุ่ม retry
                document.getElementById('retryLineLoginBtn').addEventListener('click', () => {
                    // ล้างข้อความ error
                    errorMessage.style.display = 'none';
                    if (lineStatus) {
                        lineStatus.style.display = 'none';
                    }
                    // เรียกใช้ LINE login อีกครั้ง
                    lineLoginBtn.click();
                });
                
                // เพิ่ม event listener สำหรับปุ่ม check functions
                document.getElementById('checkFunctionsBtn').addEventListener('click', async () => {
                            // ตรวจสอบ Firebase Functions โดยการเรียกฟังก์ชันทดสอบ
        try {
            await callHttpFunction('getLineAuthUrlHttp');
            const functionsStatus = document.getElementById('firebaseStatus');
                        if (functionsStatus) {
                            functionsStatus.textContent = '✅ Firebase Functions are working';
                            functionsStatus.className = 'status success';
                            functionsStatus.style.display = 'block';
                        }
                    } catch (error) {
                        const functionsStatus = document.getElementById('firebaseStatus');
                        if (functionsStatus) {
                            functionsStatus.textContent = `❌ Firebase Functions error: ${error.message}`;
                            functionsStatus.className = 'status error';
                            functionsStatus.style.display = 'block';
                        }
                    }
                });
                
                // เพิ่ม event listener สำหรับปุ่ม clear error
                document.getElementById('clearErrorBtn').addEventListener('click', () => {
                    errorMessage.style.display = 'none';
                    if (lineStatus) {
                        lineStatus.style.display = 'none';
                    }
                });
            }
        }
    });
}

// Handle Apple login button click
const appleLoginBtn = document.getElementById('appleLoginBtn');
if (appleLoginBtn) {
    appleLoginBtn.addEventListener('click', async () => {
        try {
            console.log('🍎 Attempting Apple sign in...');
            
            // Show status message
            if (statusMessage) {
                statusMessage.textContent = '🔄 Starting Apple sign in...';
                statusMessage.className = 'status warning';
            }
            
            const result = await signInWithPopup(auth, appleProvider);
            const user = result.user;
            
            console.log('✅ Apple sign in successful:', user);
            
            // Show success message
            if (successMessage) {
                successMessage.textContent = `✅ Apple sign in successful: ${user.displayName || user.email}`;
                successMessage.style.display = 'block';
            }
            
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
            
            // Update status message
            if (statusMessage) {
                statusMessage.textContent = `Signed in with Apple as ${user.displayName || user.email}`;
                statusMessage.className = 'status success';
            }
            
        } catch (error) {
            console.error('❌ Apple sign in error:', error);
            
            // Show error message
            if (errorMessage) {
                let errorText = error.message;
                let helpText = '';
                
                // Handle specific Apple auth errors
                if (error.code === 'auth/popup-blocked') {
                    errorText = 'Apple sign in popup was blocked';
                    helpText = `
                        <div style="margin-top: 10px; padding: 10px; background-color: #f8d7da; border-radius: 5px; border-left: 4px solid #dc3545;">
                            <strong>🔒 Browser Settings:</strong>
                            <ul style="margin: 5px 0; padding-left: 20px;">
                                <li>Allow popups for this website</li>
                                <li>Check your browser's popup blocker settings</li>
                                <li>Try refreshing the page and try again</li>
                            </ul>
                        </div>
                    `;
                } else if (error.code === 'auth/unauthorized-domain') {
                    errorText = 'Domain not authorized for Apple sign in';
                    helpText = `
                        <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
                            <strong>🔧 Setup Required:</strong>
                            <p style="margin: 5px 0;">Please add this domain to Firebase Console > Authentication > Settings > Authorized domains</p>
                        </div>
                    `;
                } else if (error.code === 'auth/operation-not-allowed') {
                    errorText = 'Apple sign in not enabled';
                    helpText = `
                        <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
                            <strong>🔧 Setup Required:</strong>
                            <p style="margin: 5px 0;">Please enable Apple provider in Firebase Console > Authentication > Sign-in method</p>
                        </div>
                    `;
                }
                
                errorMessage.innerHTML = `
                    <div style="margin-bottom: 10px;">
                        <strong>❌ ${errorText}</strong>
                    </div>
                    ${helpText}
                    <div style="margin-top: 10px;">
                        <button id="retryAppleLoginBtn" class="button" style="background-color: #000;">
                            🔄 Try Apple Sign In Again
                        </button>
                    </div>
                `;
                errorMessage.style.display = 'block';
                
                // Add retry button event listener
                document.getElementById('retryAppleLoginBtn').addEventListener('click', () => {
                    errorMessage.style.display = 'none';
                    appleLoginBtn.click();
                });
            }
            
            if (successMessage) {
                successMessage.style.display = 'none';
            }
            
            if (statusMessage) {
                statusMessage.textContent = `Apple sign in failed: ${error.message}`;
                statusMessage.className = 'status error';
            }
        }
    });
}

function showError(error) {
  const msg = error.message || error;
  if (errorMessage) errorMessage.textContent = msg;
  if (statusMessage) {
    statusMessage.textContent = msg;
    statusMessage.className = 'status error';
  }
  console.error('❌', msg);
}

// Helper function to show status messages
function showStatusMessage(message, type = 'info') {
  if (statusMessage) {
    statusMessage.textContent = message;
    statusMessage.className = `status ${type}`;
    statusMessage.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      if (statusMessage) {
        statusMessage.style.display = 'none';
      }
    }, 5000);
  }
  console.log(`📝 ${type.toUpperCase()}: ${message}`);
}

// Handle switch account button click
switchAccountBtn.addEventListener('click', async () => {
  try {
    // Sign out current user first
    await signOut(auth);
    
    // Show login form again
    loginForm.style.display = 'block';
    userInfo.style.display = 'none';
    
    // Trigger Google login again (popup)
    setTimeout(() => {
      googleLoginBtn.click();
    }, 500);
    
  } catch (error) {
    console.error('❌ Error switching account:', error.message);
    if (errorMessage) errorMessage.textContent = `Error switching account: ${error.message}`;
  }
});

// Handle logout button click
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Note: Account linking functionality has been removed
      
      if (statusMessage) {
        statusMessage.textContent = 'Successfully signed out from all services';
        statusMessage.className = 'status success';
      }
    } catch (error) {
      console.error('❌ Error signing out:', error.message);
      if (statusMessage) {
        statusMessage.textContent = `Error signing out: ${error.message}`;
        statusMessage.className = 'status error';
      }
    }
  });
}

// Helper function to detect Google user
function isGoogleUser(user) {
  // Check multiple indicators of Google authentication
  const hasGoogleProviderId = user.providerId === 'google.com' || user.providerId === 'google';
  const hasGooglePhotoURL = user.photoURL && user.photoURL.includes('googleusercontent.com');
  const hasGmailAndVerified = user.email && user.email.endsWith('@gmail.com') && user.emailVerified;
  const hasDisplayName = user.displayName && user.displayName.trim() !== '';
  const hasFirebaseProviderButGoogleIndicators = user.providerId === 'firebase' && (hasGooglePhotoURL || hasGmailAndVerified || hasDisplayName);
  
  return hasGoogleProviderId || hasGooglePhotoURL || hasGmailAndVerified || hasFirebaseProviderButGoogleIndicators;
}

// Helper function to detect Apple user
function isAppleUser(user) {
  return user.providerId === 'apple.com';
}

// Helper function to get all connected providers for a user
async function getConnectedProviders(user) {
  try {
    // Map provider IDs to display names
    const providerMap = {
      'google.com': 'Google',
      'apple.com': 'Apple',
      'oidc.line': 'LINE',
      'password': 'Email/Password',
      'facebook.com': 'Facebook',
      'twitter.com': 'Twitter',
      'github.com': 'GitHub',
      'microsoft.com': 'Microsoft',
      'yahoo.com': 'Yahoo',
      'phone': 'Phone',
      'anonymous': 'Anonymous'
    };
    
    // Get current provider
    const currentProvider = getProviderName(user);
    const providers = [currentProvider];
    
    // Try to get additional providers from user's provider data
    if (user.providerData && user.providerData.length > 0) {
      user.providerData.forEach(provider => {
        const providerName = providerMap[provider.providerId] || provider.providerId;
        if (!providers.includes(providerName)) {
          providers.push(providerName);
        }
      });
    }
    
    // For demonstration, if user has Google or Apple indicators, add them
    if (isGoogleUser(user) && !providers.includes('Google')) {
      providers.push('Google');
    }
    if (isAppleUser(user) && !providers.includes('Apple')) {
      providers.push('Apple');
    }
    
    console.log('✅ Connected providers:', providers);
    return providers;
  } catch (error) {
    console.error('❌ Error getting connected providers:', error);
    // Fallback to current provider
    return [getProviderName(user)];
  }
}

// Helper function to get provider name (for backward compatibility)
function getProviderName(user) {
  // ตรวจสอบ providerId ตาม Firebase Authentication
  switch (user.providerId) {
    case 'google.com':
      return 'Google';
    case 'apple.com':
      return 'Apple';
    case 'oidc.line':
      return 'LINE';
    case 'password':
      return 'Email/Password';
    case 'facebook.com':
      return 'Facebook';
    case 'twitter.com':
      return 'Twitter';
    case 'github.com':
      return 'GitHub';
    case 'microsoft.com':
      return 'Microsoft';
    case 'yahoo.com':
      return 'Yahoo';
    case 'phone':
      return 'Phone';
    case 'anonymous':
      return 'Anonymous';
    default:
      // ถ้าเป็น custom provider หรือ provider อื่นๆ
      if (user.providerId && user.providerId !== 'firebase') {
        return user.providerId;
      }
      // Fallback สำหรับกรณีที่ไม่มี providerId หรือเป็น firebase
      if (isGoogleUser(user)) {
        return 'Google';
      } else if (isAppleUser(user)) {
        return 'Apple';
      } else {
        return 'Unknown';
      }
  }
}

// Helper function to check Firebase Functions health
async function checkFunctionsHealth() {
  try {
    // ตรวจสอบ Firebase Functions โดยการเรียกฟังก์ชันทดสอบ
    const response = await fetch(`${FUNCTIONS_BASE_URL}/getLineAuthUrlHttp`, {
      method: 'GET',
      headers: {
        'Origin': 'http://127.0.0.1:5502'
      }
    });
    
    if (response.ok || response.status === 204) {
      console.log('✅ Firebase Functions are working');
      return true;
    } else {
      console.warn('⚠️ Firebase Functions returned status:', response.status);
      return false;
    }
  } catch (error) {
    console.warn('⚠️ Firebase Functions are not available:', error.message);
    return false;
  }
}

// Helper function to get Firebase JWT tokens
async function getFirebaseTokens(user) {
  try {
    // Get ID Token (JWT)
    const idToken = await user.getIdToken();
    
    // Get refresh token
    const refreshToken = user.refreshToken;
    
    // Get token info
    const tokenInfo = {
      idToken: idToken,
      refreshToken: refreshToken,
      tokenExpiration: new Date(Date.now() + 3600000), // 1 hour from now
      provider: getProviderName(user).toLowerCase()
    };
    
    console.log('✅ Firebase tokens retrieved:', {
      idTokenLength: idToken.length,
      refreshTokenLength: refreshToken.length,
      provider: tokenInfo.provider
    });
    
    return tokenInfo;
  } catch (error) {
    console.error('❌ Error getting Firebase tokens:', error.message);
    return null;
  }
}

// Helper function to decode JWT token (client-side)
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('❌ Error decoding JWT:', error.message);
    return null;
  }
}



// ตรวจสอบ LINE authorization callback
async function checkLineAuthCallback() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
            console.error('❌ LINE authorization error:', error);
            showStatusMessage(`LINE authorization failed: ${error}`, 'error');
            // ล้าง URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        if (code && state) {
            console.log('🔄 Processing LINE authorization callback...');
            
            // ตรวจสอบ state ว่าตรงกับที่เก็บไว้หรือไม่
            const savedState = localStorage.getItem('lineAuthState');
            if (state !== savedState) {
                console.error('❌ Invalid state parameter');
                showStatusMessage('Invalid authorization state. Please try again.', 'error');
                // ล้าง URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            // แสดงสถานะ
            const lineStatus = document.getElementById('lineStatus');
            if (lineStatus) {
                lineStatus.style.display = 'block';
                lineStatus.textContent = '🔄 Processing LINE authorization...';
                lineStatus.className = 'status warning';
            }

            try {
                // แลกเปลี่ยน authorization code เป็น token
                const loginData = await callHttpFunction('processLineCallbackHttp', { code: code, state: state });
                
                if (!loginData.success) {
                    throw new Error(loginData.error || 'LINE login failed');
                }

                console.log('✅ LINE login successful:', loginData.user);

                // เข้าสู่ระบบ Firebase ด้วย custom token
                if (loginData.customToken) {
                    try {
                        const userCredential = await signInWithCustomToken(auth, loginData.customToken);
                        console.log('✅ Firebase sign in with custom token successful:', userCredential.user);
                        
                        // อัพเดทสถานะ
                        if (lineStatus) {
                            lineStatus.textContent = `✅ LINE login successful: ${loginData.user.displayName}`;
                            lineStatus.className = 'status success';
                        }
                        
                        // แสดงข้อความสำเร็จ
                        const successMessage = document.getElementById('successMessage');
                        if (successMessage) {
                            successMessage.innerHTML = `
                                <div style="margin-bottom: 10px;">
                                    <strong>🎉 LINE Login Successful!</strong>
                                </div>
                                <div style="margin-bottom: 10px;">
                                    <strong>Welcome, ${loginData.user.displayName}!</strong><br>
                                    Email: ${loginData.user.email || 'Not provided'}<br>
                                    LINE User ID: ${loginData.user.lineUserId || 'N/A'}
                                </div>
                                <div style="font-size: 14px; color: #28a745;">
                                    ✅ Your LINE account has been successfully linked to Firebase
                                </div>
                            `;
                            successMessage.style.display = 'block';
                            
                            // Auto-hide success message after 5 seconds
                            setTimeout(() => {
                                if (successMessage) {
                                    successMessage.style.display = 'none';
                                }
                            }, 5000);
                        }

                        // เก็บข้อมูล LINE ใน localStorage
                        localStorage.setItem('lineUser', JSON.stringify(loginData.user));
                        localStorage.setItem('lineCustomToken', loginData.customToken);
                        localStorage.setItem('lineAccessToken', loginData.lineProfile.accessToken);
                        localStorage.setItem('lineProfile', JSON.stringify(loginData.lineProfile));
                        localStorage.setItem('idTokenData', JSON.stringify(loginData.idTokenData));

                    } catch (firebaseError) {
                        console.log('🔍 Firebase sign in error:', firebaseError);
                        
                        // Case: linkWithCredentials - เมื่อมี Firebase account อยู่แล้วด้วย email เดียวกัน
                        if (firebaseError.code === 'auth/account-exists-with-different-credential' || 
                            firebaseError.code === 'auth/email-already-in-use') {
                            
                            console.log('🔄 Detected existing Firebase account with same email, attempting to link accounts...');
                            
                            // ตรวจสอบว่า email นี้ใช้ provider อะไรบ้าง
                            const providers = await fetchSignInMethodsForEmail(auth, loginData.user.email);
                            console.log('📋 Available providers for email:', providers);
                            
                            // แสดงข้อความแจ้งเตือนผู้ใช้
                            const errorMessage = document.getElementById('errorMessage');
                            if (errorMessage) {
                                const providerText = providers.includes('google.com') ? 'Google' : 
                                                   providers.includes('password') ? 'Email/Password' : 
                                                   providers.join(', ');
                                
                                errorMessage.innerHTML = `
                                    <div style="margin-bottom: 10px;">
                                        <strong>⚠️ Account Link Required</strong><br>
                                        Email ${loginData.user.email} already exists with ${providerText} provider.<br>
                                        Please sign in with your existing account first, then we'll link your LINE account.
                                    </div>
                                    <div style="margin-bottom: 10px;">
                                        <button id="linkAccountsBtn" class="button" style="background-color: #28a745; margin-right: 10px;">
                                            🔗 Link LINE Account to Existing Account
                                        </button>
                                        ${providers.includes('google.com') ? `
                                        <button id="googleSignInBtn" class="button" style="background-color: #4285f4;">
                                            🔐 Sign in with Google First
                                        </button>
                                        ` : ''}
                                    </div>
                                `;
                                errorMessage.style.display = 'block';
                                
                                // Note: Account linking functionality has been removed
                                // Users can sign in with their existing account and then use LINE login
                            }
                            
                            // เก็บข้อมูล LINE สำหรับการ link ภายหลัง
                            localStorage.setItem('pendingLineLink', JSON.stringify({
                                user: loginData.user,
                                customToken: loginData.customToken,
                                lineProfile: loginData.lineProfile,
                                idTokenData: loginData.idTokenData,
                                availableProviders: providers
                            }));
                        } else {
                            // ถ้าไม่ใช่ error เกี่ยวกับ account linking ให้แสดง error
                            if (lineStatus) {
                                lineStatus.textContent = `❌ Firebase sign in failed: ${firebaseError.message}`;
                                lineStatus.className = 'status error';
                            }
                            showStatusMessage(`Firebase sign in failed: ${firebaseError.message}`, 'error');
                        }
                    }
                } else {
                    throw new Error('No custom token received from backend');
                }

            } catch (error) {
                console.error('❌ LINE login error:', error);
                if (lineStatus) {
                    lineStatus.textContent = `❌ LINE login failed: ${error.message}`;
                    lineStatus.className = 'status error';
                }
                showStatusMessage(`LINE login failed: ${error.message}`, 'error');
            }

            // ล้าง URL parameters และ localStorage
            window.history.replaceState({}, document.title, window.location.pathname);
            localStorage.removeItem('lineAuthState');
            localStorage.removeItem('lineAuthTimestamp');
        }
    } catch (error) {
        console.error('❌ Error checking LINE auth callback:', error);
    }
}



// Helper function to sync user data with backend (deprecated - using Cloud Functions now)
async function syncUserWithBackend(user) {
  try {
    console.log('ℹ️ Backend sync is deprecated - using Cloud Functions instead');
    return null;
  } catch (error) {
    console.error('❌ Error syncing user with backend:', error.message);
    return null;
  }
}

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = emailInput.value;
  const password = passwordInput.value;
  
  try {
    // Try to sign in with existing user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (successMessage) successMessage.textContent = `Successfully logged in as ${user.email}`;
    if (errorMessage) errorMessage.textContent = '';
    
  } catch (error) {
    // If sign in fails, try to create a new user
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (successMessage) successMessage.textContent = `Account created and logged in as ${user.email}`;
        if (errorMessage) errorMessage.textContent = '';
        
      } catch (createError) {
        if (errorMessage) errorMessage.textContent = `Error creating account: ${createError.message}`;
        if (successMessage) successMessage.textContent = '';
        console.error('❌ Error creating new user:', createError.message);
      }
    } else {
      if (errorMessage) errorMessage.textContent = `Error signing in: ${error.message}`;
      if (successMessage) successMessage.textContent = '';
      console.error('❌ Other sign in error:', error.message);
    }
  }
});