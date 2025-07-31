# Firebase Setup Guide for Google & Apple Login

## 🔧 การตั้งค่า Firebase Console

### 1. Firebase Configuration
1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจคของคุณ
3. ไปที่ **Project Settings** > **General**
4. ในส่วน **Your apps** เลือก Web app หรือสร้างใหม่
5. คัดลอก Firebase config และแทนที่ใน `index.html`:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

### 2. เปิดใช้งาน Authentication Providers

#### Google Sign-In
1. ไปที่ **Authentication** > **Sign-in method**
2. คลิก **Google** ในรายการ providers
3. เปิดใช้งาน **Enable**
4. ใส่ **Project support email**
5. บันทึกการตั้งค่า

#### Apple Sign-In
1. ไปที่ **Authentication** > **Sign-in method**
2. คลิก **Apple** ในรายการ providers
3. เปิดใช้งาน **Enable**
4. ใส่ **Apple Services ID** (ต้องสร้างใน Apple Developer Console)
5. ใส่ **Apple Team ID** และ **Apple Private Key**
6. บันทึกการตั้งค่า

### 3. Authorized Domains
1. ไปที่ **Authentication** > **Settings** > **Authorized domains**
2. เพิ่มโดเมนที่อนุญาต:
   - `localhost`
   - `127.0.0.1`
   - โดเมนจริงของคุณ (ถ้ามี)

### 4. Apple Developer Console Setup (สำหรับ Apple Sign-In)

#### สร้าง Apple Services ID
1. ไปที่ [Apple Developer Console](https://developer.apple.com/)
2. ไปที่ **Certificates, Identifiers & Profiles**
3. เลือก **Identifiers** > **Services IDs**
4. สร้าง Services ID ใหม่
5. เปิดใช้งาน **Sign In with Apple**
6. กำหนด **Return URLs** เป็น: `https://your-project.firebaseapp.com/__/auth/handler`

#### สร้าง Private Key
1. ไปที่ **Keys** ใน Apple Developer Console
2. สร้าง key ใหม่
3. เปิดใช้งาน **Sign In with Apple**
4. ดาวน์โหลด key file (.p8)
5. ใช้ข้อมูลใน Firebase Console

## 🚀 การทดสอบ

### 1. ทดสอบ Google Login
- คลิกปุ่ม "Sign in with Google"
- ควรเปิด popup ให้เลือก Google account
- หลังจาก login สำเร็จจะแสดงข้อมูลผู้ใช้

### 2. ทดสอบ Apple Login
- คลิกปุ่ม "Sign in with Apple"
- ควรเปิด popup ให้ login ด้วย Apple ID
- หลังจาก login สำเร็จจะแสดงข้อมูลผู้ใช้

## 🔍 การแก้ไขปัญหา

### Google Login ไม่ทำงาน
1. ตรวจสอบว่าเปิดใช้งาน Google provider ใน Firebase Console
2. ตรวจสอบ Authorized domains
3. ตรวจสอบ Firebase config ว่าถูกต้อง
4. เปิด Developer Console ดู error messages

### Apple Login ไม่ทำงาน
1. ตรวจสอบว่าเปิดใช้งาน Apple provider ใน Firebase Console
2. ตรวจสอบ Apple Services ID และ Private Key
3. ตรวจสอบ Return URLs ใน Apple Developer Console
4. Apple Sign-In ต้องใช้ HTTPS (ยกเว้น localhost)

### Popup Blocked
- ตรวจสอบว่า browser อนุญาต popup สำหรับเว็บไซต์นี้
- ลองใช้ incognito mode

## 📝 หมายเหตุ

- Google และ Apple login ใช้ Firebase Authentication มาตรฐาน
- LINE login ใช้ custom implementation ผ่าน Cloud Functions
- ต้องมี Firebase project ที่เปิดใช้งาน Authentication
- สำหรับ production ต้องใช้ HTTPS 