# 🔧 แก้ไขปัญหา IAM Permissions สำหรับ Firebase Functions

## ปัญหาที่พบ
```
Permission 'iam.serviceAccounts.signBlob' denied on resource (or it may not exist).
```

## สาเหตุ
Firebase Functions ไม่มีสิทธิ์ในการสร้าง custom token เนื่องจากขาด IAM permissions ที่จำเป็น

## วิธีแก้ไข

### 1. ตรวจสอบ Service Account
```bash
# ดู service account ที่ใช้โดย Cloud Functions
gcloud functions describe getLineAuthUrlHttp --region=asia-southeast1 --format="value(serviceAccountEmail)"
```

### 2. เพิ่ม IAM Permissions
```bash
# เพิ่ม Firebase Admin role ให้กับ service account
gcloud projects add-iam-policy-binding basic-firebase-80425 \
    --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
    --role="roles/firebase.admin"

# หรือเพิ่ม Service Account Token Creator role
gcloud projects add-iam-policy-binding basic-firebase-80425 \
    --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
    --role="roles/iam.serviceAccountTokenCreator"
```

### 3. ตรวจสอบ Firebase Project Settings
1. ไปที่ [Firebase Console](https://console.firebase.google.com/project/basic-firebase-80425)
2. เลือก Project Settings
3. ไปที่ Service accounts tab
4. ตรวจสอบว่า service account มีสิทธิ์ที่จำเป็น

### 4. Deploy Functions ใหม่
```bash
# Deploy functions ใหม่หลังจากแก้ไข permissions
firebase deploy --only functions
```

### 5. ตรวจสอบ Logs
```bash
# ดู logs ของ functions
firebase functions:log --only getLineAuthUrlHttp,processLineCallbackHttp
```

## การแก้ไขในโค้ด

### 1. ปรับปรุง Firebase Admin SDK Initialization
```javascript
// ใช้ default credentials
admin.initializeApp();
```

### 2. เพิ่ม Error Handling
```javascript
try {
  customToken = await admin.auth().createCustomToken(firebaseUid);
} catch (tokenError) {
  if (tokenError.message.includes('iam.serviceAccounts.signBlob')) {
    throw new Error('Firebase Functions lacks permission to create custom tokens');
  }
}
```

## ตรวจสอบการทำงาน
1. ทดสอบ LINE login ใหม่
2. ตรวจสอบ logs ใน Firebase Console
3. ตรวจสอบว่า custom token ถูกสร้างสำเร็จ

## หมายเหตุ
- การแก้ไข IAM permissions อาจใช้เวลาสักครู่ในการ propagate
- หากยังมีปัญหา ให้ลองรอ 5-10 นาทีแล้วทดสอบใหม่
- ตรวจสอบว่าใช้ Firebase project ที่ถูกต้อง 