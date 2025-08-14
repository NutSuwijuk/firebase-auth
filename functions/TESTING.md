# Cloud Functions Testing Guide

## 🧪 การทดสอบก่อน Deploy

### 1. ทดสอบฟังก์ชันพื้นฐาน
```bash
npm run test
```
ทดสอบ:
- การสร้าง LINE authorization URL
- การตรวจสอบ access token (mock)
- การดึงข้อมูล LINE profile (mock)
- การสร้าง/อัปเดต Firebase user
- การสร้าง Firebase custom token

### 2. ทดสอบ HTTP Endpoints
```bash
npm run test:endpoints
```
ทดสอบ:
- CORS headers
- getLineAuthUrlHttp endpoint
- processLineCallbackHttp endpoint
- Error handling

### 3. ทดสอบทั้งหมด
```bash
npm run test:all
```

## 🚀 การทดสอบด้วย Firebase Emulator

### 1. เริ่มต้น Emulator
```bash
npm run serve
```

### 2. ทดสอบ Endpoints ด้วย Emulator
```bash
npm run test:endpoints
```

### 3. ทดสอบด้วย Postman/curl

#### ทดสอบ getLineAuthUrlHttp
```bash
curl -X GET "http://localhost:5001/basic-firebase-80425/asia-southeast1/getLineAuthUrlHttp"
```

#### ทดสอบ processLineCallbackHttp
```bash
curl -X POST "http://localhost:5001/basic-firebase-80425/asia-southeast1/processLineCallbackHttp" \
  -H "Content-Type: application/json" \
  -d '{"code":"test_code","state":"test_state"}'
```

## 📋 Checklist ก่อน Deploy

- [ ] ฟังก์ชันพื้นฐานทำงานถูกต้อง (`npm run test`)
- [ ] HTTP endpoints ทำงานถูกต้อง (`npm run test:endpoints`)
- [ ] CORS headers ถูกต้อง
- [ ] Error handling ทำงานถูกต้อง
- [ ] Firebase Admin SDK เชื่อมต่อได้
- [ ] LINE OAuth configuration ถูกต้อง

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### 1. Firebase Admin SDK Error
```bash
Error: Failed to determine project ID
```
**แก้ไข**: ตรวจสอบว่าได้ตั้งค่า Firebase project ID ใน emulator

### 2. CORS Error
```bash
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**แก้ไข**: ตรวจสอบ CORS configuration ใน `handleCORS` function

### 3. LINE API Error
```bash
LINE login failed: Request failed with status code 400
```
**แก้ไข**: ตรวจสอบ LINE configuration และ credentials

## 📝 การ Monitor หลัง Deploy

### 1. ดู Logs
```bash
npm run logs
```

### 2. ดู Logs แบบ Real-time
```bash
firebase functions:log --tail
```

### 3. ดู Logs ใน Firebase Console
- ไปที่ Firebase Console > Functions > Logs

## 🎯 ขั้นตอนการ Deploy

1. **ทดสอบใน Local**
   ```bash
   npm run test:all
   npm run serve
   npm run test:endpoints
   ```

2. **Deploy to Firebase**
   ```bash
   npm run deploy
   ```

3. **ทดสอบใน Production**
   - ทดสอบ endpoints ที่ deploy แล้ว
   - ตรวจสอบ logs
   - ทดสอบกับ LINE OAuth จริง

## 📚 ข้อมูลเพิ่มเติม

- [Firebase Functions Testing](https://firebase.google.com/docs/functions/test)
- [Firebase Emulator](https://firebase.google.com/docs/emulator-suite)
- [LINE Login API](https://developers.line.biz/en/docs/line-login/) 