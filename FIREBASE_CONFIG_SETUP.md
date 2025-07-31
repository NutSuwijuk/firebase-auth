# 🔧 คู่มือการตั้งค่า Firebase Config

## ❌ ปัญหาที่พบ
```
API key not valid. Please pass a valid API key.
```

## ✅ วิธีแก้ไข

### ขั้นตอนที่ 1: ไปที่ Firebase Console
1. เปิด [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจคของคุณ (หรือสร้างใหม่)
3. ไปที่ **Project Settings** (ไอคอนเฟือง ⚙️)

### ขั้นตอนที่ 2: คัดลอก Firebase Config
1. ในหน้า **Project Settings** เลือกแท็บ **General**
2. เลื่อนลงไปหา **Your apps** section
3. ถ้ายังไม่มี Web app ให้คลิก **Add app** > **Web** (</>)
4. ตั้งชื่อ app เช่น "Firebase Auth Demo"
5. คัดลอก Firebase config ที่แสดง

### ขั้นตอนที่ 3: แทนที่ใน index.html
แทนที่ Firebase config ในไฟล์ `index.html`:

**❌ ตอนนี้ (ไม่ถูกต้อง):**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "basic-firebase-80425.firebaseapp.com",
    projectId: "basic-firebase-80425",
    storageBucket: "basic-firebase-80425.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop"
};
```

**✅ เปลี่ยนเป็น (ค่าจริงจาก Firebase Console):**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnopqrstuvwxyz"
};
```

### ขั้นตอนที่ 4: เปิดใช้งาน Authentication
1. ไปที่ **Authentication** ในเมนูด้านซ้าย
2. คลิก **Get started** (ถ้ายังไม่ได้เปิดใช้งาน)
3. ไปที่แท็บ **Sign-in method**
4. เปิดใช้งาน **Google** provider:
   - คลิก **Google**
   - เปิด **Enable**
   - ใส่ **Project support email**
   - คลิก **Save**

### ขั้นตอนที่ 5: เพิ่ม Authorized Domains
1. ไปที่ **Authentication** > **Settings**
2. ในส่วน **Authorized domains** เพิ่ม:
   - `localhost`
   - `127.0.0.1`

## 🧪 การทดสอบ
1. เปิดไฟล์ `index.html` ใน browser
2. เปิด Developer Console (F12)
3. คลิกปุ่ม "Sign in with Google"
4. ควรเปิด popup ให้เลือก Google account

## 🔍 การตรวจสอบ
รัน script ตรวจสอบ:
```bash
node check-firebase-setup.js
```

## 📝 หมายเหตุสำคัญ
- **API Key** ต้องเป็นค่าจริงจาก Firebase Console
- **Project ID** ต้องตรงกับโปรเจคที่สร้างใน Firebase Console
- **Auth Domain** ต้องเป็น `your-project-id.firebaseapp.com`
- ต้องเปิดใช้งาน **Authentication** ใน Firebase Console
- ต้องเปิดใช้งาน **Google** provider ใน Sign-in methods 