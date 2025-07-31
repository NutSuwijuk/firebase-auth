# 🔧 LINE Login Troubleshooting Guide

## ปัญหาที่พบบ่อย

### 1. IAM Permissions Error
```
Permission 'iam.serviceAccounts.signBlob' denied on resource (or it may not exist).
```

**สาเหตุ:** Firebase Functions ไม่มีสิทธิ์ในการสร้าง custom token

**วิธีแก้ไข:**
```bash
# วิธีที่ 1: ใช้ script อัตโนมัติ
node fix-iam-permissions.js

# วิธีที่ 2: แก้ไขด้วยตนเอง
# 1. ดู service account
gcloud functions describe getLineAuthUrlHttp --region=asia-southeast1 --format="value(serviceAccountEmail)"

# 2. เพิ่ม Firebase Admin role
gcloud projects add-iam-policy-binding basic-firebase-80425 \
    --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
    --role="roles/firebase.admin"

# 3. เพิ่ม Service Account Token Creator role
gcloud projects add-iam-policy-binding basic-firebase-80425 \
    --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
    --role="roles/iam.serviceAccountTokenCreator"
```

### 2. Functions Not Deployed
```
Failed to fetch: https://asia-southeast1-basic-firebase-80425.cloudfunctions.net/getLineAuthUrlHttp
```

**วิธีแก้ไข:**
```bash
# Deploy functions
node deploy-functions.js

# หรือ
firebase deploy --only functions
```

### 3. LINE OAuth Configuration Issues

**ตรวจสอบ LINE Console:**
1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. เลือก Channel ของคุณ
3. ตรวจสอบ Callback URL: `http://127.0.0.1:5502/index.html`
4. ตรวจสอบ Channel ID และ Channel Secret

**ตรวจสอบ Firebase Functions:**
1. ตรวจสอบ LINE_CONFIG ใน `functions/index.js`
2. ตรวจสอบว่า Channel ID และ Channel Secret ถูกต้อง

### 4. CORS Issues
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**วิธีแก้ไข:**
- ตรวจสอบ `handleCORS` function ใน `functions/index.js`
- เพิ่ม domain ของคุณใน `allowedOrigins` array

## ขั้นตอนการแก้ไขปัญหา

### Step 1: ตรวจสอบการตั้งค่า
```bash
# ตรวจสอบ Firebase project
firebase use

# ตรวจสอบ functions ที่ deploy แล้ว
firebase functions:list
```

### Step 2: แก้ไข IAM Permissions
```bash
# ใช้ script อัตโนมัติ
node fix-iam-permissions.js

# รอ 5-10 นาทีให้ permissions propagate
```

### Step 3: Deploy Functions ใหม่
```bash
# Deploy functions
node deploy-functions.js
```

### Step 4: ทดสอบ
1. เปิด `index.html` ใน browser
2. คลิก "Sign in with LINE"
3. ตรวจสอบ console logs
4. ตรวจสอบ Firebase Functions logs

## การตรวจสอบ Logs

### Firebase Functions Logs
```bash
# ดู logs ทั้งหมด
firebase functions:log

# ดู logs เฉพาะ LINE functions
firebase functions:log --only getLineAuthUrlHttp,processLineCallbackHttp
```

### Browser Console
1. เปิด Developer Tools (F12)
2. ไปที่ Console tab
3. ดู error messages และ logs

## การตั้งค่า LINE OAuth

### 1. LINE Developers Console
- **Callback URL:** `http://127.0.0.1:5502/index.html`
- **Scope:** `profile openid email`
- **Bot link:** ไม่จำเป็นสำหรับ OAuth

### 2. Firebase Functions Configuration
```javascript
const LINE_CONFIG = {
  CHANNEL_ID: "YOUR_CHANNEL_ID",
  CHANNEL_SECRET: "YOUR_CHANNEL_SECRET",
  REDIRECT_URI: "http://127.0.0.1:5502/index.html",
  // ... other config
};
```

## การทดสอบ

### 1. ทดสอบ LINE Authorization URL
```bash
curl https://asia-southeast1-basic-firebase-80425.cloudfunctions.net/getLineAuthUrlHttp
```

### 2. ทดสอบ LINE Callback
- ใช้ authorization code จาก LINE
- ส่ง POST request ไปยัง processLineCallbackHttp

### 3. ทดสอบ Firebase Authentication
- ตรวจสอบว่า custom token ถูกสร้างสำเร็จ
- ตรวจสอบว่า user ถูกสร้างใน Firebase Auth

## หมายเหตุสำคัญ

1. **Permissions Propagation:** การแก้ไข IAM permissions อาจใช้เวลาสักครู่
2. **LINE OAuth:** ต้องขอ permission `email` เพื่อให้ได้ email address
3. **CORS:** ตรวจสอบว่า domain ถูกต้องใน allowedOrigins
4. **Firebase Project:** ตรวจสอบว่าใช้ project `basic-firebase-80425`

## ติดต่อ Support

หากยังมีปัญหา:
1. ตรวจสอบ Firebase Console > Functions > Logs
2. ตรวจสอบ LINE Developers Console > Logs
3. ตรวจสอบ browser console logs
4. ติดต่อ Firebase Support หรือ LINE Support 