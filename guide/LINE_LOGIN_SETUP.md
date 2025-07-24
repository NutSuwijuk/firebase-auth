# LINE Login Setup Guide

## 📋 การตั้งค่า LINE Login สำหรับ Express Server + Firebase

### 1. การตั้งค่า LINE Developers Console

#### 1.1 สร้าง LINE Channel
1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Provider ใหม่ (ถ้ายังไม่มี)
3. สร้าง Channel ใหม่เลือก "LINE Login"
4. ตั้งชื่อ Channel และอัปโหลดไอคอน

#### 1.2 ตั้งค่า Channel
1. **Channel ID**: คัดลอก Channel ID
2. **Channel Secret**: คัดลอก Channel Secret
3. **Callback URL**: ตั้งเป็น `http://localhost:3000/line-callback.html`

#### 1.3 เปิดใช้งาน Features
- ✅ LINE Login
- ✅ OpenID Connect
- ✅ Email (ถ้าต้องการ)

### 2. การตั้งค่า Express Server

#### 2.1 อัปเดต LINE_CONFIG ใน server.js
```javascript
const LINE_CONFIG = {
  CHANNEL_ID: "YOUR_CHANNEL_ID",           // เปลี่ยนเป็น Channel ID ของคุณ
  CHANNEL_SECRET: "YOUR_CHANNEL_SECRET",   // เปลี่ยนเป็น Channel Secret ของคุณ
  REDIRECT_URI: "http://localhost:3000/line-callback.html"
};
```

#### 2.2 เริ่มต้น Server
```bash
node server.js
```

### 3. การตั้งค่า Firebase

#### 3.1 เปิดใช้งาน Custom Authentication
1. ไปที่ Firebase Console > Authentication
2. เปิดใช้งาน "Custom" provider
3. ไม่ต้องตั้งค่า OAuth provider ใน Firebase (เพราะเราใช้ Express server)

#### 3.2 ตั้งค่า Authorized Domains
เพิ่ม domain ที่อนุญาต:
- `localhost`
- `127.0.0.1`

### 4. การทดสอบ

#### 4.1 เริ่มต้นระบบ
1. เริ่ม Express server: `node server.js`
2. เปิดไฟล์ `index-simple.html` ในเบราว์เซอร์
3. คลิกปุ่ม "🟩 Sign in with LINE"

#### 4.2 ขั้นตอนการทำงาน
1. **Frontend** → ขอ authorization URL จาก backend
2. **Backend** → สร้าง LINE authorization URL
3. **Frontend** → เปิด popup window ไปยัง LINE
4. **LINE** → ผู้ใช้ล็อกอินและ authorize
5. **LINE** → redirect กลับมาที่ callback URL
6. **Callback** → ส่ง authorization code กลับไปยัง parent window
7. **Frontend** → ส่ง code ไปยัง backend เพื่อแลกเปลี่ยนเป็น token
8. **Backend** → แลกเปลี่ยน code เป็น access token และสร้าง Firebase custom token
9. **Frontend** → เข้าสู่ระบบ Firebase ด้วย custom token

### 5. ไฟล์ที่เกี่ยวข้อง

#### 5.1 Frontend Files
- `index-simple.html` - หน้าหลักที่มีปุ่ม LINE Login
- `app-simple.js` - JavaScript สำหรับจัดการ LINE login
- `line-callback.html` - หน้า callback สำหรับรับ authorization code

#### 5.2 Backend Files
- `server.js` - Express server ที่จัดการ LINE API
- `serviceAccountKey.json` - Firebase Admin SDK credentials

### 6. API Endpoints

#### 6.1 LINE Login Endpoints
- `GET /api/auth/line/auth-url` - ขอ authorization URL
- `POST /api/auth/line/login` - แลกเปลี่ยน code เป็น token
- `POST /api/auth/line/verify` - ตรวจสอบ access token
- `POST /api/auth/line/logout` - ออกจากระบบ

#### 6.2 Account Linking Endpoints
- `POST /api/auth/link/line` - เชื่อมต่อ LINE กับบัญชีที่มีอยู่
- `POST /api/auth/unlink` - ยกเลิกการเชื่อมต่อ provider

### 7. การจัดการ Error

#### 7.1 Common Errors
- **Backend not available**: ตรวจสอบว่า `node server.js` ทำงานอยู่
- **Invalid Channel ID/Secret**: ตรวจสอบการตั้งค่าใน LINE_CONFIG
- **Callback URL mismatch**: ตรวจสอบ redirect URI ใน LINE Developers Console
- **CORS error**: ตรวจสอบการตั้งค่า CORS ใน Express server

#### 7.2 Debug Tips
- เปิด Developer Tools > Console เพื่อดู log
- ตรวจสอบ Network tab เพื่อดู API calls
- ตรวจสอบ Firebase Console > Authentication > Users

### 8. การปรับปรุงสำหรับ Production

#### 8.1 Security
- ใช้ environment variables สำหรับ sensitive data
- เพิ่ม rate limiting
- ตรวจสอบ origin ของ requests
- ใช้ HTTPS

#### 8.2 Performance
- เพิ่ม caching สำหรับ user data
- ใช้ session management
- เพิ่ม error retry logic

### 9. การทดสอบบน Mobile

#### 9.1 Mobile Browser
- ใช้ ngrok เพื่อ expose localhost
- อัปเดต callback URL เป็น ngrok URL
- ทดสอบบน mobile browser

#### 9.2 Mobile App
- ใช้ WebView หรือ Custom Tabs
- จัดการ deep linking
- ใช้ App-to-App authentication

### 10. การเชื่อมต่อกับระบบอื่น

#### 10.1 Database Integration
- เก็บข้อมูลผู้ใช้ใน Firestore
- สร้าง user profile
- จัดการ user preferences

#### 10.2 Third-party Services
- เชื่อมต่อกับ CRM
- ส่งข้อมูลไปยัง analytics
- เชื่อมต่อกับ payment gateway

---

## 🚀 Quick Start

1. **Clone repository และติดตั้ง dependencies**
```bash
npm install
```

2. **ตั้งค่า LINE_CONFIG ใน server.js**
```javascript
const LINE_CONFIG = {
  CHANNEL_ID: "YOUR_CHANNEL_ID",
  CHANNEL_SECRET: "YOUR_CHANNEL_SECRET",
  REDIRECT_URI: "http://localhost:3000/line-callback.html"
};
```

3. **เริ่มต้น server**
```bash
node server.js
```

4. **เปิดไฟล์ index-simple.html ในเบราว์เซอร์**

5. **คลิกปุ่ม "🟩 Sign in with LINE" และทดสอบ**

---

## 📞 Support

หากมีปัญหาหรือคำถาม:
1. ตรวจสอบ Console logs
2. ตรวจสอบ Network requests
3. ตรวจสอบ Firebase Console
4. ตรวจสอบ LINE Developers Console 