// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, OAuthProvider, signInWithCredential, signInWithCustomToken, linkWithCredential, fetchSignInMethodsForEmail } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBH3BdZw6qTyiYK7cZ7Arapeyoc2Nryft0",
    authDomain: "basic-firebase-9e03e.firebaseapp.com",
    projectId: "basic-firebase-9e03e",
    storageBucket: "basic-firebase-9e03e.firebasestorage.app",
    messagingSenderId: "351515692984",
    appId: "1:351515692984:web:cd4eec800311f35fe7494d",
    measurementId: "G-T8R4DBMKD5"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);



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
}

// Check backend health on page load
checkBackendHealth().then(isAvailable => {
  const backendStatus = document.getElementById('backendStatus');
  if (backendStatus) {
    if (isAvailable) {
      backendStatus.textContent = '✅ Backend is running (localhost:3000)';
      backendStatus.className = 'status success';
    } else {
      backendStatus.textContent = '⚠️ Backend is not available (localhost:3000)';
      backendStatus.className = 'status error';
    }
  }
});



// ตรวจสอบ pending LINE link เมื่อโหลดหน้า
setTimeout(checkPendingLineLink, 1000);

// Handle user state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('✅ User signed in:', user);
    userInfo.style.display = 'block';
    loginForm.style.display = 'none';
    
    // ตรวจสอบ pending LINE link เมื่อผู้ใช้เข้าสู่ระบบ
    await checkPendingLineLink();
    
    // Get Firebase tokens
    const tokens = await getFirebaseTokens(user);
    
    // Decode JWT token to show payload
    const tokenPayload = tokens ? decodeJWT(tokens.idToken) : null;
    
    // Update user details
    const profilePic = user.photoURL ? `<img src="${user.photoURL}" alt="Profile" class="profile-pic">` : '';
    userDetails.innerHTML = `
      ${profilePic}
      <div>
        <h4>${user.displayName || user.email}</h4>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>UID:</strong> ${user.uid}</p>
        <p><strong>Provider:</strong> ${getProviderName(user)}</p>
        <p><strong>Email Verified:</strong> ${user.emailVerified ? 'Yes' : 'No'}</p>
        ${tokens ? `
        <div style="margin-top: 15px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
          <h5>🔑 JWT Token Info:</h5>
          <p><strong>Token Length:</strong> ${tokens.idToken.length} characters</p>
          <p><strong>Provider:</strong> ${tokens.provider}</p>
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
          <p><strong>Provider:</strong> ${getProviderName(user)}</p>
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

// Handle Google login button click (use popup)
googleLoginBtn.addEventListener('click', async () => {
  try {
    console.log('🔄 Attempting Google sign in with popup...');
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      access_type: 'offline',
      include_granted_scopes: 'true'
    });
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const isGoogle = isGoogleUser(user);
    const providerText = isGoogle ? 'Google' : 'Firebase';
    const accountType = result._tokenResponse?.isNewUser ? 'new account' : 'existing account';
    if (successMessage) {
      successMessage.textContent = `Successfully signed in with ${providerText} (${accountType}): ${user.displayName || user.email}`;
    }
    if (errorMessage) {
      errorMessage.textContent = '';
    }
    // No need to manually trigger onAuthStateChanged, it will fire automatically
  } catch (error) {
    showError(error);
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
            
            // ตรวจสอบสถานะ backend ก่อน
            if (lineStatus) {
                lineStatus.textContent = '🔍 Checking backend server...';
            }
            
            const isBackendAvailable = await checkBackendHealth();
            if (!isBackendAvailable) {
                if (lineStatus) {
                    lineStatus.textContent = '❌ Backend server not available';
                    lineStatus.className = 'status error';
                }
                throw new Error('Backend server is not available. Please start the server with: node server.js');
            }
            
            if (lineStatus) {
                lineStatus.textContent = '✅ Backend server is running';
                lineStatus.className = 'status success';
            }

            // ขั้นตอนที่ 1: ขอ authorization URL จาก backend
            if (lineStatus) {
                lineStatus.textContent = '📡 Getting LINE authorization URL...';
            }
            
            const authResponse = await fetch('http://localhost:3000/api/auth/line/auth-url', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const authData = await authResponse.json();
            
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

            // ขั้นตอนที่ 2: เปิด popup window สำหรับ LINE authorization
            console.log('🪟 Opening popup window with URL:', authData.authUrl.substring(0, 100) + '...');
            
            const popup = window.open(
                authData.authUrl,
                'lineLogin',
                'width=500,height=600,scrollbars=yes,resizable=yes,location=yes,status=yes,toolbar=no,menubar=no,centerscreen=yes'
            );

            // ตรวจสอบว่า popup เปิดสำเร็จหรือไม่
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                throw new Error('Popup blocked by browser. Please allow popups for this site and try again.');
            }

            console.log('✅ Popup window opened successfully');
            
            // พยายาม focus popup
            try {
                popup.focus();
            } catch (error) {
                console.log('⚠️ Cannot focus popup (security policy)');
            }
            
            if (lineStatus) {
                lineStatus.textContent = '🪟 Popup opened, waiting for authorization... (timeout: 10 minutes)';
            }

            // รอผลลัพธ์จาก popup
            const result = await new Promise((resolve, reject) => {
                let messageHandler = null;
                let closedCheckInterval = null;
                let timeoutId = null;
                let isResolved = false;
                let timeLeft = 600; // 10 minutes in seconds

                // ตั้ง timeout 10 นาที (เพิ่มจาก 5 นาที)
                timeoutId = setTimeout(() => {
                    if (isResolved) return;
                    isResolved = true;
                    console.log('⏰ LINE login timeout (10 minutes)');
                    if (closedCheckInterval) clearInterval(closedCheckInterval);
                    if (messageHandler) window.removeEventListener('message', messageHandler);
                    if (popup && !popup.closed) popup.close();
                    reject(new Error('LINE login timeout after 10 minutes. Please try again.'));
                }, 600000); // 10 minutes

                // ตรวจสอบว่า popup ถูกปิดหรือไม่ และอัพเดทเวลาที่เหลือ
                closedCheckInterval = setInterval(() => {
                    if (isResolved) return;
                    
                    // อัพเดทเวลาที่เหลือ
                    timeLeft--;
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    
                    if (lineStatus) {
                        lineStatus.textContent = `🪟 Popup opened, waiting for authorization... (timeout: ${minutes}:${seconds.toString().padStart(2, '0')})`;
                    }
                    
                    try {
                        if (popup.closed) {
                            console.log('🔄 Popup window was closed by user');
                            isResolved = true;
                            clearInterval(closedCheckInterval);
                            if (messageHandler) window.removeEventListener('message', messageHandler);
                            clearTimeout(timeoutId);
                            reject(new Error('LINE login was cancelled by user'));
                        }
                    } catch (error) {
                        console.log('⚠️ Error checking popup status:', error);
                        // ถ้าไม่สามารถตรวจสอบ popup ได้ ให้รอต่อไป
                    }
                }, 1000);

                // รับฟังข้อความจาก popup
                messageHandler = function handleMessage(event) {
                    if (isResolved) return;
                    
                    console.log('📨 Received message from popup:', event.data);
                    
                    // ตรวจสอบ origin
                    if (event.origin !== window.location.origin) {
                        console.log('⚠️ Ignoring message from different origin:', event.origin);
                        return;
                    }
                    
                    if (event.data.type === 'LINE_AUTH_SUCCESS') {
                        console.log('✅ LINE auth success received');
                        isResolved = true;
                        clearInterval(closedCheckInterval);
                        clearTimeout(timeoutId);
                        window.removeEventListener('message', messageHandler);
                        if (popup && !popup.closed) popup.close();
                        resolve(event.data);
                    } else if (event.data.type === 'LINE_AUTH_ERROR') {
                        console.log('❌ LINE auth error received:', event.data.message);
                        isResolved = true;
                        clearInterval(closedCheckInterval);
                        clearTimeout(timeoutId);
                        window.removeEventListener('message', messageHandler);
                        if (popup && !popup.closed) popup.close();
                        reject(new Error(event.data.message || 'LINE authentication failed'));
                    } else if (event.data.type === 'LINE_LOGIN_POPUP_CLOSED') {
                        console.log('ℹ️ LINE popup closed by user');
                        isResolved = true;
                        clearInterval(closedCheckInterval);
                        clearTimeout(timeoutId);
                        window.removeEventListener('message', messageHandler);
                        reject(new Error('LINE login was cancelled by user'));
                    } else if (event.data.type === 'LINE_LOGIN_CANCELLED') {
                        console.log('ℹ️ LINE login cancelled by user');
                        isResolved = true;
                        clearInterval(closedCheckInterval);
                        clearTimeout(timeoutId);
                        window.removeEventListener('message', messageHandler);
                        if (popup && !popup.closed) popup.close();
                        reject(new Error('LINE login was cancelled by user'));
                    }
                };

                window.addEventListener('message', messageHandler);
                
                // เพิ่มการตรวจสอบ popup focus
                const focusCheckInterval = setInterval(() => {
                    if (isResolved) {
                        clearInterval(focusCheckInterval);
                        return;
                    }
                    
                    try {
                        if (popup && !popup.closed) {
                            // พยายาม focus popup เพื่อให้ผู้ใช้เห็น
                            popup.focus();
                        }
                    } catch (error) {
                        // ไม่สามารถ focus ได้ (อาจเป็นเพราะ security policy)
                    }
                }, 2000);
            });

            console.log('✅ LINE authorization successful, processing login...');

            // ขั้นตอนที่ 3: แลกเปลี่ยน authorization code เป็น token
            const loginResponse = await fetch('http://localhost:3000/api/auth/line/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: result.code,
                    state: result.state
                })
            });

            const loginData = await loginResponse.json();
            
            if (!loginData.success) {
                throw new Error(loginData.error || 'LINE login failed');
            }

            console.log('✅ LINE login successful:', loginData.user);

            // ขั้นตอนที่ 4: เข้าสู่ระบบ Firebase ด้วย custom token
            if (loginData.customToken) {
                try {
                    const userCredential = await signInWithCustomToken(auth, loginData.customToken);
                    console.log('✅ Firebase sign in with custom token successful:', userCredential.user);
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
                            
                            // เพิ่ม event listener สำหรับปุ่ม link accounts
                            document.getElementById('linkAccountsBtn').addEventListener('click', async () => {
                                try {
                                    await handleAccountLinking(loginData);
                                } catch (linkError) {
                                    console.error('❌ Account linking failed:', linkError);
                                    if (errorMessage) {
                                        errorMessage.textContent = `Account linking failed: ${linkError.message}`;
                                    }
                                }
                            });
                            
                            // เพิ่ม event listener สำหรับปุ่ม Google sign in (ถ้ามี)
                            const googleSignInBtn = document.getElementById('googleSignInBtn');
                            if (googleSignInBtn) {
                                googleSignInBtn.addEventListener('click', async () => {
                                    try {
                                        await handleGoogleSignInForLinking(loginData);
                                    } catch (googleError) {
                                        console.error('❌ Google sign in for linking failed:', googleError);
                                        if (errorMessage) {
                                            errorMessage.textContent = `Google sign in failed: ${googleError.message}`;
                                        }
                                    }
                                });
                            }
                        }
                        
                        // เก็บข้อมูล LINE สำหรับการ link ภายหลัง
                        localStorage.setItem('pendingLineLink', JSON.stringify({
                            user: loginData.user,
                            customToken: loginData.customToken,
                            lineProfile: loginData.lineProfile,
                            idTokenData: loginData.idTokenData,
                            availableProviders: providers
                        }));
                        
                        return; // ออกจากฟังก์ชันโดยไม่แสดงข้อความสำเร็จ
                    }
                    
                    // ถ้าไม่ใช่ error เกี่ยวกับ account linking ให้ throw error ต่อไป
                    throw firebaseError;
                }
            } else {
                throw new Error('No custom token received from backend');
            }

            // อัพเดทสถานะ LINE
            if (lineStatus) {
                lineStatus.textContent = `✅ LINE login successful: ${loginData.user.displayName}`;
                lineStatus.className = 'status success';
            }
            
            // ซ่อนคำแนะนำ
            if (lineLoginInstructions) {
                lineLoginInstructions.style.display = 'none';
            }
            
            // แสดงข้อความสำเร็จ
            if (successMessage) {
                successMessage.textContent = `✅ LINE login successful: ${loginData.user.displayName}`;
                successMessage.style.display = 'block';
            }

            // เก็บข้อมูล LINE ใน localStorage
            localStorage.setItem('lineUser', JSON.stringify(loginData.user));
            localStorage.setItem('lineCustomToken', loginData.customToken);
            localStorage.setItem('lineAccessToken', loginData.lineProfile.accessToken);
            localStorage.setItem('lineProfile', JSON.stringify(loginData.lineProfile));
            localStorage.setItem('idTokenData', JSON.stringify(loginData.idTokenData));

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
                
                // จัดการ error ตามประเภท
                if (error.message.includes('cancelled by user')) {
                    errorText = 'LINE login was cancelled';
                    helpText = `
                        <div style="margin-top: 10px; padding: 10px; background-color: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
                            <strong>💡 Tips:</strong>
                            <ul style="margin: 5px 0; padding-left: 20px;">
                                <li>Make sure to complete the LINE authorization process</li>
                                <li>Don't close the popup window until you see the success message</li>
                                <li>If the popup doesn't appear, check your browser's popup blocker</li>
                                <li>Try clicking the LINE login button again</li>
                            </ul>
                        </div>
                    `;
                } else if (error.message.includes('Backend server not available')) {
                    errorText = 'Backend server is not running';
                    helpText = `
                        <div style="margin-top: 10px; padding: 10px; background-color: #d1ecf1; border-radius: 5px; border-left: 4px solid #17a2b8;">
                            <strong>🔧 Solution:</strong>
                            <p style="margin: 5px 0;">Please start the backend server with:</p>
                            <pre style="background-color: #f8f9fa; padding: 8px; border-radius: 3px; margin: 5px 0;">node server.js</pre>
                        </div>
                    `;
                } else if (error.message.includes('Popup blocked')) {
                    errorText = 'Popup was blocked by browser';
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
                }
                
                errorMessage.innerHTML = `
                    <div style="margin-bottom: 10px;">
                        <strong>❌ ${errorText}</strong>
                    </div>
                    ${helpText}
                    <div style="margin-top: 10px;">
                        <button id="retryLineLoginBtn" class="button" style="background-color: #00c300;">
                            🔄 Try LINE Login Again
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
      
      // ล้างข้อมูล pending LINE link เมื่อ logout
      localStorage.removeItem('pendingLineLink');
      
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

// Helper function to get provider name
function getProviderName(user) {
  if (isGoogleUser(user)) {
    return 'Google';
  } else if (user.providerId === 'oidc.line') {
    return 'LINE';
  } else if (user.providerId === 'apple.com') {
    return 'Apple';
  } else if (user.providerId === 'password') {
    return 'Email/Password';
  } else {
    return user.providerId || 'Unknown';
  }
}

// Helper function to check backend health
async function checkBackendHealth() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    if (response.ok) {
      console.log('✅ Backend is running');
      return true;
    } else {
      console.warn('⚠️ Backend health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.warn('⚠️ Backend is not available:', error.message);
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

// ฟังก์ชันสำหรับ Google Sign-In เพื่อการเชื่อมต่อบัญชี
async function handleGoogleSignInForLinking(lineLoginData) {
    try {
        console.log('🔄 Starting Google sign in for account linking...');
        
        // ตรวจสอบว่าผู้ใช้ยังไม่ได้เข้าสู่ระบบอยู่
        if (auth.currentUser) {
            console.log('✅ User already signed in, proceeding with account linking...');
            return await handleAccountLinking(lineLoginData);
        }
        
        // ตรวจสอบว่า email นี้ใช้ Google provider หรือไม่
        const providers = await fetchSignInMethodsForEmail(auth, lineLoginData.user.email);
        if (!providers.includes('google.com')) {
            throw new Error('Google provider not available for this email');
        }
        
        console.log('🔐 Signing in with Google for account linking...');
        
        // ตั้งค่า Google provider
        const googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({
            prompt: 'select_account',
            login_hint: lineLoginData.user.email
        });
        
        // Sign in with Google
        const googleResult = await signInWithPopup(auth, googleProvider);
        console.log('✅ Google sign in successful for linking:', googleResult.user);
        
        // ตรวจสอบว่า email ตรงกันหรือไม่
        if (googleResult.user.email !== lineLoginData.user.email) {
            await signOut(auth);
            throw new Error(`Email mismatch. Google account: ${googleResult.user.email}, LINE account: ${lineLoginData.user.email}`);
        }
        
        // ดำเนินการ account linking
        return await handleAccountLinking(lineLoginData);
        
    } catch (error) {
        console.error('❌ Google sign in for linking error:', error);
        throw error;
    }
}

// ฟังก์ชันสำหรับจัดการการเชื่อมต่อบัญชี (Account Linking)
async function handleAccountLinking(lineLoginData) {
    try {
        console.log('🔄 Starting account linking process...');
        
        // ตรวจสอบว่าผู้ใช้เข้าสู่ระบบอยู่หรือไม่
        const currentUser = auth.currentUser;
        if (!currentUser) {
            throw new Error('Please sign in with your existing account first');
        }
        
        console.log('✅ Current user found:', currentUser.email);
        
        // ตรวจสอบว่ามีข้อมูล LINE ที่รอการ link หรือไม่
        const pendingLineLink = localStorage.getItem('pendingLineLink');
        if (!pendingLineLink) {
            throw new Error('No pending LINE account to link');
        }
        
        const lineData = JSON.parse(pendingLineLink);
        
        // ตรวจสอบว่า email ตรงกันหรือไม่
        if (currentUser.email !== lineData.user.email) {
            throw new Error(`Email mismatch. Current account: ${currentUser.email}, LINE account: ${lineData.user.email}`);
        }
        
        console.log('✅ Email verification passed, proceeding with account linking...');
        
        // ขั้นตอนที่ 1: ขอ custom token สำหรับ LINE account จาก backend
        const linkResponse = await fetch('http://localhost:3000/api/auth/line/link-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentUserUid: currentUser.uid,
                lineUser: lineData.user,
                lineProfile: lineData.lineProfile,
                idTokenData: lineData.idTokenData
            })
        });
        
        const linkData = await linkResponse.json();
        
        if (!linkData.success) {
            throw new Error(linkData.error || 'Failed to link accounts on backend');
        }
        
        console.log('✅ Backend account linking successful');
        
        // ขั้นตอนที่ 2: Link LINE credential กับ Firebase account ปัจจุบัน
        try {
            // สร้าง LINE credential จาก custom token
            const lineCredential = OAuthProvider.credential(
                'oidc.line',
                lineData.customToken
            );
            
            // Link credential กับ account ปัจจุบัน
            const linkResult = await currentUser.linkWithCredential(lineCredential);
            console.log('✅ Firebase account linking successful:', linkResult);
            
        } catch (linkError) {
            console.log('⚠️ Firebase credential linking failed, but backend linking successful:', linkError);
            
            // แม้ว่า Firebase credential linking จะล้มเหลว แต่ backend linking สำเร็จแล้ว
            // เราสามารถใช้ custom token เพื่อเข้าสู่ระบบใหม่
            if (linkData.customToken) {
                await signOut(auth);
                const newUserCredential = await signInWithCustomToken(auth, linkData.customToken);
                console.log('✅ Re-authenticated with linked account:', newUserCredential.user);
            }
        }
        
        // ลบข้อมูล pending link
        localStorage.removeItem('pendingLineLink');
        
        // แสดงข้อความสำเร็จ
        if (successMessage) {
            successMessage.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <strong>✅ Account Linking Successful!</strong><br>
                    Your LINE account has been successfully linked to your existing account.<br>
                    Email: ${currentUser.email}
                </div>
            `;
            successMessage.style.display = 'block';
        }
        
        // ลบข้อความ error
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
        
        // เก็บข้อมูล LINE ใน localStorage
        localStorage.setItem('lineUser', JSON.stringify(lineData.user));
        localStorage.setItem('lineCustomToken', linkData.customToken || lineData.customToken);
        localStorage.setItem('lineAccessToken', lineData.lineProfile.accessToken);
        localStorage.setItem('lineProfile', JSON.stringify(lineData.lineProfile));
        localStorage.setItem('idTokenData', JSON.stringify(lineData.idTokenData));
        
    } catch (error) {
        console.error('❌ Account linking error:', error);
        throw error;
    }
}

// ฟังก์ชันสำหรับตรวจสอบและจัดการ pending LINE link
async function checkPendingLineLink() {
    try {
        const pendingLineLink = localStorage.getItem('pendingLineLink');
        if (pendingLineLink) {
            const lineData = JSON.parse(pendingLineLink);
            console.log('🔄 Found pending LINE link for:', lineData.user.email);
            
            // ตรวจสอบ provider ที่ใช้ได้
            const providers = lineData.availableProviders || [];
            const providerText = providers.includes('google.com') ? 'Google' : 
                               providers.includes('password') ? 'Email/Password' : 
                               providers.join(', ');
            
            // แสดงข้อความแจ้งเตือนผู้ใช้
            if (errorMessage) {
                errorMessage.innerHTML = `
                    <div style="margin-bottom: 10px;">
                        <strong>🔄 Pending Account Link</strong><br>
                        You have a pending LINE account link for ${lineData.user.email}.<br>
                        This email already exists with ${providerText} provider.
                    </div>
                    <div style="margin-bottom: 10px;">
                        <button id="completeLinkBtn" class="button" style="background-color: #28a745; margin-right: 10px;">
                            🔗 Complete Account Linking
                        </button>
                        ${providers.includes('google.com') ? `
                        <button id="googleSignInForLinkBtn" class="button" style="background-color: #4285f4;">
                            🔐 Sign in with Google First
                        </button>
                        ` : ''}
                    </div>
                `;
                errorMessage.style.display = 'block';
                
                // เพิ่ม event listener สำหรับปุ่ม complete link
                document.getElementById('completeLinkBtn').addEventListener('click', async () => {
                    try {
                        await handleAccountLinking(lineData);
                    } catch (linkError) {
                        console.error('❌ Account linking failed:', linkError);
                        if (errorMessage) {
                            errorMessage.textContent = `Account linking failed: ${linkError.message}`;
                        }
                    }
                });
                
                // เพิ่ม event listener สำหรับปุ่ม Google sign in (ถ้ามี)
                const googleSignInForLinkBtn = document.getElementById('googleSignInForLinkBtn');
                if (googleSignInForLinkBtn) {
                    googleSignInForLinkBtn.addEventListener('click', async () => {
                        try {
                            await handleGoogleSignInForLinking(lineData);
                        } catch (googleError) {
                            console.error('❌ Google sign in for linking failed:', googleError);
                            if (errorMessage) {
                                errorMessage.textContent = `Google sign in failed: ${googleError.message}`;
                            }
                        }
                    });
                }
            }
        }
    } catch (error) {
        console.error('❌ Error checking pending LINE link:', error);
    }
}

// Helper function to sync user data with backend
async function syncUserWithBackend(user) {
  try {
    // Check if backend is available
    const isBackendAvailable = await checkBackendHealth();
    if (!isBackendAvailable) {
      console.warn('⚠️ Skipping backend sync - backend not available');
      return null;
    }

    // Get Firebase tokens
    const tokens = await getFirebaseTokens(user);
    
    const userData = {
      firebase_uid: user.uid,
      email: user.email,
      display_name: user.displayName || '',
      photo_url: user.photoURL || '',
      email_verified: user.emailVerified,
      provider: getProviderName(user).toLowerCase(),
      last_login: new Date().toISOString(),
      // Include JWT token for backend verification
      id_token: tokens?.idToken || null
    };

    const response = await fetch('http://localhost:3000/api/auth/sync-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ User synced with backend:', result);
      return result;
    } else {
      console.error('❌ Failed to sync user with backend:', response.status);
      return null;
    }
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

// ===== ACCOUNT LINKING FUNCTIONALITY =====

// Global variables for account linking
let currentUser = null;
let pendingCredential = null;

// Get DOM elements for account linking
const authSection = document.getElementById('authSection');
const linkingSection = document.getElementById('linkingSection');
const accountLinkingDialog = document.getElementById('accountLinkingDialog');
const conflictEmail = document.getElementById('conflictEmail');

// Buttons for account linking
const lineSignInButton = document.getElementById('lineLoginBtn');
const googleSignInButton = document.getElementById('googleLoginBtn');
const linkLineButton = document.getElementById('linkLineButton');
const linkGoogleButton = document.getElementById('linkGoogleButton');
const logoutButton = document.getElementById('logoutBtn');
const cancelLinkingButton = document.getElementById('cancelLinkingButton');
const googleSignInForLinkingButton = document.getElementById('googleSignInForLinkingButton');

// Event Listeners for account linking
if (cancelLinkingButton) {
    cancelLinkingButton.addEventListener('click', hideAccountLinkingDialog);
}

if (googleSignInForLinkingButton) {
            googleSignInForLinkingButton.addEventListener('click', handleGoogleSignInForLinkingUI);
}

if (linkLineButton) {
    linkLineButton.addEventListener('click', handleLinkLine);
}

if (linkGoogleButton) {
    linkGoogleButton.addEventListener('click', handleLinkGoogle);
}

// Update the existing onAuthStateChanged to include account linking functionality
const originalOnAuthStateChanged = onAuthStateChanged;
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        showUserInfo(user);
        showLinkingSection();
        hideAuthSection();
        showStatusMessage('เข้าสู่ระบบสำเร็จ!', 'success');
    } else {
        currentUser = null;
        hideUserInfo();
        showAuthSection();
        hideLinkingSection();
        clearStatusMessage();
    }
});

// LINE Login Handler with Account Linking
async function handleLineLogin() {
    try {
        showStatusMessage('กำลังเข้าสู่ระบบด้วย LINE...', 'info');
        
        // Create LINE provider
        const provider = new OAuthProvider('oidc.line');
        provider.addScope('profile');
        provider.addScope('openid');
        provider.addScope('email');

        // Sign in with popup
        const result = await signInWithPopup(auth, provider);
        console.log('✅ LINE login successful:', result.user);
        
    } catch (error) {
        console.error('❌ LINE login error:', error);
        
        if (error.code === 'auth/account-exists-with-different-credential') {
            // Email conflict detected
            const email = error.email;
            pendingCredential = error.credential;
            
            console.log(`📧 Email conflict: ${email} is used with a different account`);
            showAccountLinkingDialog(email);
        } else {
            showStatusMessage(`เกิดข้อผิดพลาดในการล็อกอิน: ${error.message}`, 'error');
        }
    }
}

// Google Sign In for Linking Handler (UI Version)
async function handleGoogleSignInForLinkingUI() {
    try {
        showStatusMessage('กำลังล็อกอินด้วย Google เพื่อเชื่อมโยงบัญชี...', 'info');
        hideAccountLinkingDialog();
        
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        const result = await signInWithPopup(auth, provider);
        console.log('✅ Google login for linking successful:', result.user);
        
        // Link accounts
        if (pendingCredential) {
            await linkAccountsAndNotifyUser(result.user, pendingCredential);
        }
        
    } catch (error) {
        console.error('❌ Google login for linking error:', error);
        showStatusMessage(`เกิดข้อผิดพลาดในการล็อกอิน: ${error.message}`, 'error');
    }
}

// Link LINE Account
async function handleLinkLine() {
    if (!currentUser) {
        showStatusMessage('กรุณาเข้าสู่ระบบก่อน', 'error');
        return;
    }

    try {
        showStatusMessage('กำลังเชื่อมโยงกับ LINE...', 'info');
        
        const provider = new OAuthProvider('oidc.line');
        provider.addScope('profile');
        provider.addScope('openid');
        provider.addScope('email');

        const result = await currentUser.linkWithPopup(provider);
        console.log('✅ LINE account linked successfully:', result);
        
        showStatusMessage('เชื่อมโยงบัญชี LINE สำเร็จ!', 'success');
        updateUserInfo();
        
    } catch (error) {
        console.error('❌ LINE linking error:', error);
        
        if (error.code === 'auth/provider-already-linked') {
            showStatusMessage('บัญชี LINE ถูกเชื่อมโยงแล้ว', 'info');
        } else if (error.code === 'auth/credential-already-in-use') {
            showStatusMessage('บัญชี LINE นี้ถูกใช้กับบัญชีอื่นแล้ว', 'error');
        } else {
            showStatusMessage(`เกิดข้อผิดพลาดในการเชื่อมโยง: ${error.message}`, 'error');
        }
    }
}

// Link Google Account
async function handleLinkGoogle() {
    if (!currentUser) {
        showStatusMessage('กรุณาเข้าสู่ระบบก่อน', 'error');
        return;
    }

    try {
        showStatusMessage('กำลังเชื่อมโยงกับ Google...', 'info');
        
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        const result = await currentUser.linkWithPopup(provider);
        console.log('✅ Google account linked successfully:', result);
        
        showStatusMessage('เชื่อมโยงบัญชี Google สำเร็จ!', 'success');
        updateUserInfo();
        
    } catch (error) {
        console.error('❌ Google linking error:', error);
        
        if (error.code === 'auth/provider-already-linked') {
            showStatusMessage('บัญชี Google ถูกเชื่อมโยงแล้ว', 'info');
        } else if (error.code === 'auth/credential-already-in-use') {
            showStatusMessage('บัญชี Google นี้ถูกใช้กับบัญชีอื่นแล้ว', 'error');
        } else {
            showStatusMessage(`เกิดข้อผิดพลาดในการเชื่อมโยง: ${error.message}`, 'error');
        }
    }
}

// Link Accounts and Notify User
async function linkAccountsAndNotifyUser(user, credential) {
    try {
        showStatusMessage('กำลังเชื่อมโยงบัญชี...', 'info');
        
        // Convert string to credential object if necessary
        const linkCredential = typeof credential === 'string' ? 
            OAuthProvider.credential('oidc.line', credential) : credential;
        
        // Link the credential
        const result = await user.linkWithCredential(linkCredential);
        console.log('✅ Account linking successful:', result);
        
        // Clear pending credential
        pendingCredential = null;
        
        showStatusMessage('✅ บัญชีถูกเชื่อมโยงเรียบร้อยแล้ว! ตอนนี้คุณสามารถล็อกอินด้วย Google หรือ LINE ก็ได้', 'success');
        updateUserInfo();
        
    } catch (error) {
        console.error('❌ Account linking failed:', error);
        showStatusMessage(`ไม่สามารถเชื่อมโยงบัญชีได้: ${error.message}`, 'error');
    }
}

// Show User Information
function showUserInfo(user) {
    document.getElementById('userDisplayName').textContent = user.displayName || 'ไม่ระบุชื่อ';
    document.getElementById('userEmail').textContent = user.email || 'ไม่ระบุอีเมล';
    document.getElementById('userAvatar').src = user.photoURL || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTJaIiBmaWxsPSIjNjY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDE0IDcgMTYuMzMgNyAxOVYyMEgxN1YxOUMxNyAxNi4zMyAxNC42NyAxNCAxMiAxNFoiIGZpbGw9IiM2NjYiLz4KPC9zdmc+Cg==';
    
    // Get provider information
    const providers = user.providerData.map(provider => {
        switch (provider.providerId) {
            case 'google.com': return 'Google';
            case 'oidc.line': return 'LINE';
            case 'password': return 'Email/Password';
            default: return provider.providerId;
        }
    });
    
    document.getElementById('userProviders').textContent = providers.join(', ') || 'ไม่ระบุ';
    
    userInfo.classList.add('show');
}

// Update User Information
function updateUserInfo() {
    if (currentUser) {
        showUserInfo(currentUser);
    }
}

// Hide User Information
function hideUserInfo() {
    userInfo.classList.remove('show');
}

// Show Auth Section
function showAuthSection() {
    authSection.style.display = 'block';
}

// Hide Auth Section
function hideAuthSection() {
    authSection.style.display = 'none';
}

// Show Linking Section
function showLinkingSection() {
    linkingSection.style.display = 'block';
}

// Hide Linking Section
function hideLinkingSection() {
    linkingSection.style.display = 'none';
}

// Show Account Linking Dialog
function showAccountLinkingDialog(email) {
    conflictEmail.textContent = email;
    accountLinkingDialog.classList.add('show');
}

// Hide Account Linking Dialog
function hideAccountLinkingDialog() {
    accountLinkingDialog.classList.remove('show');
    pendingCredential = null;
}

// Show Status Message
function showStatusMessage(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = `status ${type} show`;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 5000);
}

// Clear Status Message
function clearStatusMessage() {
    statusMessage.classList.remove('show');
}

// Initialize the account linking functionality
console.log('🚀 Account Linking functionality initialized'); 