# คู่มือขั้นสูง Firebase Authentication

## การตั้งค่า Apple Sign-In แบบละเอียด

### 1. Apple Developer Console Setup

#### สร้าง App ID
1. ไปที่ [Apple Developer Console](https://developer.apple.com/account/)
2. ไปที่ Certificates, Identifiers & Profiles
3. คลิก "Identifiers" → "+" → "App IDs"
4. เลือก "App" และคลิก "Continue"
5. กรอกข้อมูล:
   - Description: ชื่อแอปของคุณ
   - Bundle ID: `com.yourcompany.yourapp` (ต้องไม่ซ้ำ)
6. เปิดใช้งาน "Sign In with Apple" capability
7. คลิก "Continue" และ "Register"

#### สร้าง Service ID
1. ไปที่ "Identifiers" → "+" → "Services IDs"
2. เลือก "Services IDs" และคลิก "Continue"
3. กรอกข้อมูล:
   - Description: ชื่อบริการของคุณ
   - Identifier: `com.yourcompany.yourapp.web` (สำหรับเว็บ)
4. เปิดใช้งาน "Sign In with Apple" capability
5. คลิก "Continue" และ "Register"

#### ตั้งค่า Service ID
1. คลิกที่ Service ID ที่สร้างขึ้น
2. ใต้ "Sign In with Apple" คลิก "Configure"
3. เพิ่มโดเมนของคุณ (เช่น `yourdomain.com`)
4. เพิ่ม Return URL: `https://yourdomain.com/__/auth/handler`
5. คลิก "Save"

#### สร้าง Private Key
1. ไปที่ "Keys" → "+"
2. กรอกข้อมูล:
   - Key Name: `Firebase Apple Sign-In`
   - เปิดใช้งาน "Sign In with Apple"
3. คลิก "Continue" และ "Register"
4. ดาวน์โหลดไฟล์ `.p8` (ดาวน์โหลดได้ครั้งเดียว!)
5. บันทึก Team ID และ Key ID

### 2. Firebase Console Setup

#### เปิดใช้งาน Apple Sign-In
1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจคของคุณ
3. ไปที่ Authentication → Sign-in method
4. เปิดใช้งาน "Apple" provider

#### ตั้งค่า Apple Provider
1. คลิกที่ "Apple" provider
2. กรอกข้อมูล:
   - **Service ID**: `com.yourcompany.yourapp.web` (จากขั้นตอนที่ 1)
   - **Apple Team ID**: Team ID ของคุณ (จากขั้นตอนที่ 1)
   - **Key ID**: Key ID ของคุณ (จากขั้นตอนที่ 1)
   - **Private Key**: อัปโหลดไฟล์ `.p8` (จากขั้นตอนที่ 1)
3. คลิก "Save"

### 3. โค้ด Frontend สำหรับ Apple Sign-In

```javascript
// ตั้งค่า Apple Provider
const appleProvider = new firebase.auth.OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

// ฟังก์ชันล็อกอินด้วย Apple
async function signInWithApple() {
  try {
    const result = await firebase.auth().signInWithPopup(appleProvider);
    console.log('ล็อกอินสำเร็จ:', result.user);
    
    // ตรวจสอบว่าผู้ใช้เป็นผู้ใช้ใหม่หรือไม่
    if (result.additionalUserInfo.isNewUser) {
      console.log('ผู้ใช้ใหม่:', result.user.displayName);
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    
    // จัดการข้อผิดพลาดเฉพาะ
    if (error.code === 'auth/popup-closed-by-user') {
      alert('ผู้ใช้ปิดหน้าต่างล็อกอิน');
    } else if (error.code === 'auth/unauthorized-domain') {
      alert('โดเมนไม่ได้รับอนุญาต');
    }
  }
}
```

## การตั้งค่า LINE Login แบบละเอียด

### 1. LINE Developers Console Setup

#### สร้าง Channel
1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. คลิก "Create Channel"
3. เลือก "LINE Login"
4. กรอกข้อมูล:
   - Channel name: ชื่อแอปของคุณ
   - Channel description: คำอธิบายแอป
   - Category: เลือกหมวดหมู่ที่เหมาะสม
   - Subcategory: เลือกหมวดหมู่ย่อย
5. คลิก "Create"

#### ตั้งค่า Channel
1. ไปที่ "LINE Login" tab
2. ตั้งค่า Callback URL: `https://yourdomain.com/callback`
3. เปิดใช้งาน "Use ID Token"
4. เปิดใช้งาน "Use Access Token"
5. บันทึก Channel ID และ Channel Secret

### 2. Firebase Cloud Functions Setup

#### ตั้งค่า Environment Variables
```bash
# ใน Firebase Console ไปที่ Functions → Configuration
# เพิ่ม environment variables:
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_REDIRECT_URI=https://yourdomain.com/callback
```

#### โค้ด Cloud Functions สำหรับ LINE Login

```javascript
// functions/index.js
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

admin.initializeApp();

// ตั้งค่า LINE OAuth
const LINE_CONFIG = {
  CHANNEL_ID: process.env.LINE_CHANNEL_ID,
  CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET,
  REDIRECT_URI: process.env.LINE_REDIRECT_URI,
  AUTH_URL: "https://access.line.me/oauth2/v2.1/authorize",
  TOKEN_URL: "https://api.line.me/oauth2/v2.1/token",
  PROFILE_URL: "https://api.line.me/v2/profile",
  VERIFY_URL: "https://api.line.me/oauth2/v2.1/verify",
};

// สร้าง LINE Authorization URL
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

// แลกเปลี่ยน authorization code เป็น tokens
async function exchangeCodeForTokens(code) {
  const tokenData = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: LINE_CONFIG.REDIRECT_URI,
    client_id: LINE_CONFIG.CHANNEL_ID,
    client_secret: LINE_CONFIG.CHANNEL_SECRET,
  });

  const response = await axios.post(LINE_CONFIG.TOKEN_URL, tokenData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
}

// ตรวจสอบ LINE ID token
async function verifyLineIdToken(idToken) {
  const verifyData = new URLSearchParams({
    id_token: idToken,
    client_id: LINE_CONFIG.CHANNEL_ID,
  });

  const response = await axios.post(LINE_CONFIG.VERIFY_URL, verifyData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
}

// ดึงข้อมูล LINE profile
async function getLineProfile(accessToken) {
  const response = await axios.get(LINE_CONFIG.PROFILE_URL, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

// สร้างหรืออัปเดต Firebase user
async function createOrUpdateFirebaseUser(lineEmail, lineDisplayName, linePictureUrl) {
  let firebaseUid;

  try {
    // ตรวจสอบว่าผู้ใช้มีอยู่แล้วหรือไม่
    const userRecord = await admin.auth().getUserByEmail(lineEmail);
    firebaseUid = userRecord.uid;

    // อัปเดตข้อมูลผู้ใช้
    await admin.auth().updateUser(firebaseUid, {
      displayName: lineDisplayName,
      photoURL: linePictureUrl,
    });
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      // สร้างผู้ใช้ใหม่
      console.log(`สร้างผู้ใช้ใหม่สำหรับอีเมล: ${lineEmail}`);
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

// Cloud Function สำหรับสร้าง LINE Auth URL
exports.getLineAuthUrlHttp = onRequest(async (request, response) => {
  // จัดการ CORS
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  try {
    const { authUrl, state } = generateLineAuthUrl();

    response.json({
      success: true,
      authUrl: authUrl,
      state: state,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการสร้าง LINE auth URL:", error);
    response.status(500).json({
      success: false,
      error: `ไม่สามารถสร้าง LINE authorization URL ได้: ${error.message}`,
    });
  }
});

// Cloud Function สำหรับประมวลผล LINE callback
exports.processLineCallbackHttp = onRequest(async (request, response) => {
  // จัดการ CORS
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }

  try {
    console.log("Request body:", request.body);
    console.log("Request headers:", request.headers);

    const { code, state } = request.body;

    if (!code || !state) {
      console.error("ไม่มี code หรือ state:", { code: !!code, state: !!state });
      response.status(400).json({
        success: false,
        error: "ต้องมี authorization code และ state",
      });
      return;
    }

    console.log("ประมวลผล LINE callback ด้วย code:", code.substring(0, 10) + "...");

    // 1. แลกเปลี่ยน authorization code เป็น tokens
    const { access_token: accessToken, id_token: idToken } = await exchangeCodeForTokens(code);
    console.log("ได้ LINE access token และ ID token");

    // 2. ตรวจสอบ ID token
    const idTokenData = await verifyLineIdToken(idToken);
    console.log("ตรวจสอบ LINE ID token สำหรับผู้ใช้:", idTokenData.sub);

    // 3. ดึงข้อมูล LINE profile
    const lineProfile = await getLineProfile(accessToken);
    console.log("ได้ LINE profile:", lineProfile.displayName);

    // 4. สร้างหรืออัปเดต Firebase user
    const lineEmail = idTokenData.email;
    const lineDisplayName = lineProfile.displayName;
    const linePictureUrl = lineProfile.pictureUrl;

    if (!lineEmail) {
      response.status(400).json({
        success: false,
        error: "ไม่ได้รับอนุญาตให้เข้าถึงอีเมลใน LINE",
      });
      return;
    }

    const firebaseUid = await createOrUpdateFirebaseUser(lineEmail, lineDisplayName, linePictureUrl);

    // 5. ส่งข้อมูลกลับ (ใช้ LINE ID token แทน custom token)
    response.json({
      success: true,
      lineIdToken: idToken, // ใช้ LINE ID token แทน custom token
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
    console.error("เกิดข้อผิดพลาดในการประมวลผล LINE callback:", error);
    console.error("รายละเอียดข้อผิดพลาด:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response && error.response.data,
    });
    response.status(500).json({
      success: false,
      error: `การล็อกอิน LINE ล้มเหลว: ${error.message}`,
      details: (error.response && error.response.data) || error.stack,
    });
  }
});
```

### 3. โค้ด Frontend สำหรับ LINE Login

```javascript
// ฟังก์ชันล็อกอินด้วย LINE
async function signInWithLine() {
  try {
    // เรียก Cloud Function เพื่อสร้าง LINE Auth URL
    const response = await fetch('/api/line/auth-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    
    if (data.success) {
      // เปิดหน้าต่างใหม่สำหรับล็อกอิน LINE
      const popup = window.open(
        data.authUrl, 
        'line-login', 
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      // ตรวจสอบเมื่อหน้าต่างปิด
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          console.log('หน้าต่าง LINE login ปิดแล้ว');
        }
      }, 1000);
      
    } else {
      console.error('ไม่สามารถสร้าง LINE auth URL ได้:', data.error);
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการล็อกอิน LINE:', error);
  }
}

// ฟังก์ชันประมวลผล LINE callback
async function processLineCallback(code, state) {
  try {
    const response = await fetch('/api/line/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('ล็อกอิน LINE สำเร็จ:', data.user);
      
      // สร้าง custom token สำหรับ Firebase
      const customToken = await createCustomToken(data.user.uid);
      
      // ล็อกอิน Firebase ด้วย custom token
      const userCredential = await firebase.auth().signInWithCustomToken(customToken);
      console.log('ล็อกอิน Firebase สำเร็จ:', userCredential.user);
      
    } else {
      console.error('การล็อกอิน LINE ล้มเหลว:', data.error);
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการประมวลผล LINE callback:', error);
  }
}
```

## การจัดการข้อผิดพลาดและ Debug

### 1. ข้อผิดพลาดที่พบบ่อย

#### Firebase Auth Errors
```javascript
// จัดการข้อผิดพลาด Firebase Auth
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log('ผู้ใช้ล็อกอินแล้ว:', user);
  } else {
    console.log('ไม่มีผู้ใช้ล็อกอิน');
  }
}, (error) => {
  console.error('เกิดข้อผิดพลาดในการตรวจสอบสถานะ:', error);
  
  switch (error.code) {
    case 'auth/network-request-failed':
      console.error('ปัญหาเครือข่าย');
      break;
    case 'auth/too-many-requests':
      console.error('มีการร้องขอมากเกินไป');
      break;
    case 'auth/user-disabled':
      console.error('ผู้ใช้ถูกปิดใช้งาน');
      break;
    default:
      console.error('ข้อผิดพลาดอื่นๆ:', error.message);
  }
});
```

#### Apple Sign-In Errors
```javascript
async function signInWithApple() {
  try {
    const provider = new firebase.auth.OAuthProvider("apple.com");
    provider.addScope("email");
    provider.addScope("name");
    
    const result = await firebase.auth().signInWithPopup(provider);
    console.log('ล็อกอินสำเร็จ:', result.user);
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        console.error('ผู้ใช้ปิดหน้าต่างล็อกอิน');
        break;
      case 'auth/unauthorized-domain':
        console.error('โดเมนไม่ได้รับอนุญาต');
        break;
      case 'auth/invalid-credential':
        console.error('ข้อมูลประจำตัวไม่ถูกต้อง');
        break;
      case 'auth/operation-not-allowed':
        console.error('Apple Sign-In ไม่ได้เปิดใช้งาน');
        break;
      default:
        console.error('ข้อผิดพลาดอื่นๆ:', error.message);
    }
  }
}
```

### 2. เครื่องมือ Debug

#### Browser Console
```javascript
// เปิด Developer Tools (F12) และดู Console
// เพิ่ม debug logs
console.log('Firebase config:', firebaseConfig);
console.log('Current user:', firebase.auth().currentUser);
```

#### Firebase Console
- ไปที่ Authentication → Users
- ดูผู้ใช้ที่สร้างขึ้น
- ตรวจสอบ Provider ที่เชื่อมต่อ
- ดู logs ใน Functions → Logs

#### Cloud Functions Logs
```bash
# ดู logs ของ Cloud Functions
firebase functions:log

# ดู logs เฉพาะ function
firebase functions:log --only getLineAuthUrlHttp
```

## การตั้งค่าความปลอดภัย

### 1. Environment Variables
```javascript
// ใช้ environment variables แทนการ hardcode
const config = {
  lineChannelId: process.env.LINE_CHANNEL_ID,
  lineChannelSecret: process.env.LINE_CHANNEL_SECRET,
  firebaseApiKey: process.env.FIREBASE_API_KEY,
  appleTeamId: process.env.APPLE_TEAM_ID,
  appleKeyId: process.env.APPLE_KEY_ID
};
```

### 2. CORS Settings
```javascript
// อนุญาตเฉพาะโดเมนที่ต้องการ
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

## การ Deploy และ Production

### 1. Deploy Cloud Functions
```bash
# ติดตั้ง dependencies
cd functions
npm install

# Deploy functions
firebase deploy --only functions

# Deploy เฉพาะ function ที่ต้องการ
firebase deploy --only functions:getLineAuthUrlHttp
```

### 2. Deploy Frontend
```bash
# Deploy ไปยัง Firebase Hosting
firebase deploy --only hosting

# หรือ Deploy ไปยัง Vercel
vercel

# หรือ Deploy ไปยัง Netlify
netlify deploy
```

### 3. การตั้งค่า Production
```javascript
// ตรวจสอบ environment
const isProduction = process.env.NODE_ENV === 'production';

// ใช้ config ที่แตกต่างกันตาม environment
const config = isProduction ? {
  // Production config
  corsOrigin: 'https://yourdomain.com',
  lineRedirectUri: 'https://yourdomain.com/callback'
} : {
  // Development config
  corsOrigin: 'http://localhost:5500',
  lineRedirectUri: 'http://localhost:5500/callback'
};
```

## สรุป

การตั้งค่า Firebase Authentication สำหรับ Apple Sign-In และ LINE Login ต้องมีการตั้งค่าที่ซับซ้อน แต่เมื่อตั้งค่าเสร็จแล้ว การใช้งานจะง่ายและปลอดภัย

### จุดสำคัญ
1. **Apple Sign-In**: ต้องตั้งค่าใน Apple Developer Console และ Firebase Console
2. **LINE Login**: ต้องใช้ Cloud Functions เพื่อจัดการ OAuth flow
3. **ความปลอดภัย**: ใช้ environment variables และ CORS settings
4. **Debug**: ใช้ browser console และ Firebase logs
5. **Production**: ตั้งค่าโดเมนและ environment variables ให้ถูกต้อง

### ขั้นตอนต่อไป
1. ทดสอบการล็อกอินในเครื่อง
2. Deploy ไปยัง production
3. ทดสอบการล็อกอินใน production
4. ตรวจสอบ logs และแก้ไขปัญหา
5. เพิ่มฟีเจอร์เพิ่มเติมตามต้องการ 