# คู่มือการเปลี่ยนโปรเจค Firebase

## ภาพรวม
คู่มือนี้จะช่วยคุณเปลี่ยนโปรเจค Firebase จาก `basic-firebase-9e03e` เป็นโปรเจคใหม่

## ขั้นตอนการเปลี่ยนโปรเจค Firebase

### 1. สร้างโปรเจค Firebase ใหม่

#### 1.1 ไปที่ Firebase Console
- เปิด [Firebase Console](https://console.firebase.google.com/)
- คลิก "Create a project" หรือ "Add project"

#### 1.2 ตั้งชื่อโปรเจค
- ใส่ชื่อโปรเจคใหม่ (เช่น `my-new-firebase-project`)
- เลือก "Enable Google Analytics" (แนะนำ)
- คลิก "Create project"

#### 1.3 ตั้งค่า Authentication
- ไปที่ "Authentication" ในเมนูด้านซ้าย
- คลิก "Get started"
- เปิดใช้งาน Authentication providers ที่ต้องการ:
  - Email/Password
  - Google
  - LINE (ถ้าใช้)
  - Apple (ถ้าใช้)

### 2. ดาวน์โหลด Service Account Key ใหม่

#### 2.1 เข้าไปที่ Project Settings
- คลิกไอคอนเฟือง (⚙️) ข้าง "Project Overview"
- เลือก "Project settings"

#### 2.2 สร้าง Service Account
- ไปที่แท็บ "Service accounts"
- คลิก "Generate new private key"
- เลือก "Firebase Admin SDK"
- คลิก "Generate key"
- ดาวน์โหลดไฟล์ JSON

#### 2.3 แทนที่ไฟล์ serviceAccountKey.json
- เปลี่ยนชื่อไฟล์ที่ดาวน์โหลดมาเป็น `serviceAccountKey.json`
- แทนที่ไฟล์เดิมในโปรเจค

### 3. อัพเดทการตั้งค่าในโค้ด

#### 3.1 อัพเดท .firebaserc
```json
{
  "projects": {
    "default": "YOUR_NEW_PROJECT_ID"
  }
}
```

#### 3.2 อัพเดท Environment Variables (ถ้ามี)
สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-new-project-id
FIREBASE_DATABASE_URL=https://your-new-project-id-default-rtdb.firebaseio.com

# หรือใช้ Service Account Key แบบ JSON string
FIREBASE_ADMIN_KEY={"type":"service_account","project_id":"your-new-project-id",...}

# LINE Login Configuration (ถ้าใช้)
LINE_CHANNEL_ID=your-line-channel-id
LINE_CHANNEL_SECRET=your-line-channel-secret
LINE_REDIRECT_URI=http://127.0.0.1:5500/index.html

# JWT Secret
JWT_SECRET=your-jwt-secret-key
```

#### 3.3 อัพเดท server.js
ในไฟล์ `server.js` บรรทัดที่ 75:
```javascript
databaseURL: process.env.FIREBASE_DATABASE_URL || "https://YOUR_NEW_PROJECT_ID-default-rtdb.firebaseio.com"
```

### 4. ตั้งค่า LINE Login (ถ้าใช้)

#### 4.1 อัพเดท LINE Channel Settings
- ไปที่ [LINE Developers Console](https://developers.line.biz/)
- เลือก Channel ที่ใช้
- ไปที่ "Messaging API" > "Channel settings"
- อัพเดท "Callback URL" เป็น:
  ```
  https://YOUR_NEW_PROJECT_ID.web.app/line-callback.html
  ```

#### 4.2 อัพเดท Environment Variables
```env
LINE_REDIRECT_URI=https://YOUR_NEW_PROJECT_ID.web.app/index.html
```

### 5. ตั้งค่า Apple Sign-In (ถ้าใช้)

#### 5.1 อัพเดท Apple Developer Console
- ไปที่ [Apple Developer Console](https://developer.apple.com/)
- อัพเดท Bundle ID และ Return URLs

#### 5.2 อัพเดท Firebase Authentication
- เปิดใช้งาน Apple provider ใน Firebase Console
- อัพเดท Service ID และ Key ID

### 6. ทดสอบการเชื่อมต่อ

#### 6.1 รันเซิร์ฟเวอร์
```bash
npm start
```

#### 6.2 ทดสอบ Health Check
```bash
curl http://localhost:3000/api/health
```

#### 6.3 ทดสอบ Firebase Connection
- เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`
- ทดสอบการลงทะเบียน/เข้าสู่ระบบ

### 7. Deploy ไปยัง Firebase Hosting (ถ้าต้องการ)

#### 7.1 ติดตั้ง Firebase CLI
```bash
npm install -g firebase-tools
```

#### 7.2 Login และ Deploy
```bash
firebase login
firebase use YOUR_NEW_PROJECT_ID
firebase deploy
```

## การตรวจสอบความถูกต้อง

### 1. ตรวจสอบ Service Account
```javascript
// ทดสอบใน server.js
console.log('Firebase Project ID:', admin.app().options.projectId);
```

### 2. ตรวจสอบ LINE Configuration
```javascript
// ทดสอบใน server.js
console.log('LINE Channel ID:', LINE_CONFIG.CHANNEL_ID);
console.log('LINE Redirect URI:', LINE_CONFIG.REDIRECT_URI);
```

### 3. ตรวจสอบ Database URL
```javascript
// ทดสอบใน server.js
console.log('Firebase Database URL:', admin.app().options.databaseURL);
```

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. "Project not found" error
- ตรวจสอบ Project ID ใน `.firebaserc`
- ตรวจสอบ Service Account Key

#### 2. "Permission denied" error
- ตรวจสอบ Service Account permissions
- ตรวจสอบ Firebase Rules

#### 3. LINE Login ไม่ทำงาน
- ตรวจสอบ Channel ID และ Secret
- ตรวจสอบ Redirect URI
- ตรวจสอบ Callback URL ใน LINE Console

#### 4. Apple Sign-In ไม่ทำงาน
- ตรวจสอบ Bundle ID
- ตรวจสอบ Service ID
- ตรวจสอบ Key ID และ Private Key

## ไฟล์ที่ต้องอัพเดท

1. `serviceAccountKey.json` - Service Account Key ใหม่
2. `.firebaserc` - Project ID ใหม่
3. `.env` - Environment variables ใหม่
4. `server.js` - Database URL ใหม่
5. LINE Console settings (ถ้าใช้)
6. Apple Developer Console settings (ถ้าใช้)

## หมายเหตุสำคัญ

- **Backup ข้อมูลเก่า**: สำรองข้อมูลจากโปรเจคเก่าก่อนเปลี่ยน
- **Test thoroughly**: ทดสอบทุกฟีเจอร์หลังเปลี่ยนโปรเจค
- **Update documentation**: อัพเดทเอกสารที่เกี่ยวข้อง
- **Notify team**: แจ้งทีมงานเกี่ยวกับการเปลี่ยนแปลง

## คำสั่งที่มีประโยชน์

```bash
# ตรวจสอบ Firebase project ปัจจุบัน
firebase projects:list

# เปลี่ยน Firebase project
firebase use YOUR_NEW_PROJECT_ID

# ตรวจสอบการตั้งค่า
firebase projects:list

# Deploy ไปยัง project ใหม่
firebase deploy --project YOUR_NEW_PROJECT_ID
``` 