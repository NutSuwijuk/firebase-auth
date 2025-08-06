# คู่มือ Firebase Authentication สำหรับผู้เริ่มต้น

## Firebase Authentication คืออะไร?

Firebase Authentication เป็นบริการจัดการผู้ใช้ของ Google ที่ช่วยให้คุณเพิ่มระบบล็อกอินให้กับแอปพลิเคชันได้อย่างง่ายดาย

### ข้อดีของ Firebase Auth
- ✅ มีระบบล็อกอินสำเร็จรูป
- ✅ รองรับ Provider หลายตัว (Google, Apple, LINE, etc.)
- ✅ ปลอดภัยด้วยมาตรฐานของ Google
- ✅ ง่ายต่อการใช้งาน
- ✅ มีระบบจัดการผู้ใช้ในตัว

## สถาปัตยกรรมระบบ

### การทำงานของระบบ
1. **ผู้ใช้กดปุ่มล็อกอิน** → Frontend ส่งคำขอไปยัง Provider
2. **Provider ส่งข้อมูลกลับมา** → Frontend ได้ข้อมูลผู้ใช้
3. **Frontend ส่งข้อมูลไป Backend** → Backend สร้าง Firebase User
4. **Backend ส่ง Firebase Token กลับมา** → Frontend ใช้ Token
5. **Frontend เชื่อมต่อ Firebase** → เข้าถึงข้อมูลและบริการต่างๆ

## การตั้งค่า Firebase Project

### 1. สร้าง Firebase Project
1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก "Create a project"
3. ตั้งชื่อโปรเจค
4. เลือก "Enable Google Analytics" (ไม่บังคับ)
5. คลิก "Create project"

### 2. เพิ่มแอปพลิเคชัน
1. คลิกไอคอนเว็บ (</>) 
2. ตั้งชื่อแอป
3. คลิก "Register app"
4. คัดลอก Firebase Config

### 3. เปิดใช้งาน Authentication
1. ไปที่ "Authentication" ในเมนูด้านซ้าย
2. คลิก "Get started"
3. ไปที่แท็บ "Sign-in method"
4. เปิดใช้งาน Provider ที่ต้องการ

### 4. ตั้งค่า Authorized Domains
1. ไปที่ Authentication → Settings
2. ในส่วน "Authorized domains"
3. เพิ่มโดเมน: `localhost`, `127.0.0.1`, โดเมนจริงของคุณ

## Frontend (ส่วนหน้าเว็บ)

### การตั้งค่า Firebase ใน Frontend
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

firebase.initializeApp(firebaseConfig);
```

### การล็อกอินด้วย Google
```javascript
async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider);
    console.log('ล็อกอินสำเร็จ:', result.user);
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  }
}
```

### การตรวจสอบสถานะผู้ใช้
```javascript
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // ผู้ใช้ล็อกอินแล้ว
    showUserInfo(user);
  } else {
    // ผู้ใช้ยังไม่ได้ล็อกอิน
    showLoginButtons();
  }
});
```

## Backend (ส่วนหลังเว็บ)

### การตั้งค่า Express Server
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500']
}));

app.use(express.json());
```

### การเชื่อมต่อกับ LINE API
```javascript
app.post('/api/line/auth-url', async (req, res) => {
  try {
    const authUrl = generateLineAuthUrl();
    res.json({ success: true, authUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### การสร้าง Firebase User
```javascript
async function createOrUpdateFirebaseUser(email, displayName, photoURL) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(userRecord.uid, {
      displayName: displayName,
      photoURL: photoURL
    });
    return userRecord.uid;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      const newUser = await admin.auth().createUser({
        email: email,
        displayName: displayName,
        photoURL: photoURL
      });
      return newUser.uid;
    }
    throw error;
  }
}
```

## Firebase Cloud Functions

### Cloud Functions คืออะไร?
Cloud Functions คือบริการของ Google ที่ให้คุณรันโค้ดบนเซิร์ฟเวอร์ของ Google โดยไม่ต้องจัดการเซิร์ฟเวอร์เอง

### ข้อดีของ Cloud Functions
- ✅ ไม่ต้องจัดการเซิร์ฟเวอร์
- ✅ ปรับขนาดอัตโนมัติ
- ✅ ปลอดภัย
- ✅ เชื่อมต่อ Firebase ได้โดยตรง

### ตัวอย่าง Cloud Function
```javascript
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

exports.getLineAuthUrlHttp = onRequest(async (request, response) => {
  try {
    const authUrl = generateLineAuthUrl();
    response.json({
      success: true,
      authUrl: authUrl
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

## การเชื่อมต่อกับ Provider ต่างๆ

### Google Sign-In
**การตั้งค่า:**
1. ไปที่ Firebase Console → Authentication → Sign-in method
2. เปิดใช้งาน Google
3. เพิ่ม Support email
4. บันทึก

**โค้ด:**
```javascript
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  const result = await firebase.auth().signInWithPopup(provider);
}
```

### Apple Sign-In
**การตั้งค่า:**
1. ไปที่ Apple Developer Console
2. สร้าง App ID และ Service ID
3. สร้าง Private Key (.p8 file)
4. ตั้งค่าใน Firebase Console

**โค้ด:**
```javascript
async function signInWithApple() {
  const provider = new firebase.auth.OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  const result = await firebase.auth().signInWithPopup(provider);
}
```

### LINE Login
**การตั้งค่า:**
1. ไปที่ LINE Developers Console
2. สร้าง Channel
3. ตั้งค่า Callback URL
4. บันทึก Channel ID และ Channel Secret

**โค้ด:**
```javascript
async function signInWithLine() {
  const response = await fetch('/api/line/auth-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  if (data.success) {
    window.open(data.authUrl, 'line-login', 'width=500,height=600');
  }
}
```

## การทดสอบและแก้ไขปัญหา

### การทดสอบ
```bash
# เริ่มต้น Backend Server
npm start

# เปิดไฟล์ index.html ในเบราว์เซอร์
```

### ปัญหาที่พบบ่อย

**1. "Firebase: Error (auth/unauthorized-domain)"**
- เพิ่มโดเมนใน Firebase Console → Authentication → Settings → Authorized domains

**2. "Popup blocked"**
- อนุญาต popup สำหรับโดเมนของคุณ

**3. "Invalid configuration" (Apple)**
- ตรวจสอบ Service ID, Team ID, Key ID และ Private Key

**4. "Network error" (LINE)**
- ตรวจสอบ Channel ID, Channel Secret และ Callback URL

## การ Deploy

### Deploy ไปยัง Firebase Hosting
```bash
# ติดตั้ง Firebase CLI
npm install -g firebase-tools

# ล็อกอิน
firebase login

# เริ่มต้นโปรเจค
firebase init

# Deploy
firebase deploy
```

### Deploy Cloud Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

## คำถามที่พบบ่อย

### Q: Firebase Auth ปลอดภัยไหม?
**A**: ใช่ ปลอดภัยมาก เพราะใช้มาตรฐานความปลอดภัยของ Google

### Q: ต้องจ่ายเงินไหม?
**A**: มี Free Tier ที่ให้ใช้งานได้ฟรี:
- ผู้ใช้ 10,000 คน/เดือน
- การยืนยันอีเมล 10,000 ครั้ง/เดือน

### Q: รองรับ Provider อะไรบ้าง?
**A**: รองรับมากมาย: Google, Apple, Facebook, Twitter, LINE, Discord, Steam, อีเมล/รหัสผ่าน, เบอร์โทรศัพท์

### Q: ต้องเขียนโค้ดเยอะไหม?
**A**: ไม่เยอะเลย! เพียงไม่กี่บรรทัด:
```javascript
const provider = new firebase.auth.GoogleAuthProvider();
const result = await firebase.auth().signInWithPopup(provider);
```

## สรุป

Firebase Authentication เป็นเครื่องมือที่ทรงพลังสำหรับการจัดการผู้ใช้:

### ข้อดี
- ง่ายต่อการใช้งาน
- ปลอดภัย
- รองรับหลาย Provider
- ฟรี
- ปรับขนาดได้

### ขั้นตอนต่อไป
1. สร้าง Firebase Project
2. ตั้งค่า Authentication
3. เพิ่ม Provider ที่ต้องการ
4. เขียนโค้ด Frontend
5. ทดสอบและ Deploy

### เคล็ดลับ
- เริ่มต้นด้วย Google Sign-In (ง่ายที่สุด)
- ทดสอบในเครื่องก่อน Deploy
- ใช้ Cloud Functions สำหรับ Provider ที่ซับซ้อน
- เก็บข้อมูลสำคัญใน Environment Variables

**Happy Coding! 🎉** 