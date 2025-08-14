# การรัน Firebase Auth Server ในเครื่อง Local

คู่มือนี้จะอธิบายวิธีการแปลง Firebase Cloud Functions ให้เป็น Node.js server ที่สามารถรันได้ในเครื่อง local

## 🚀 การติดตั้งและรัน

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env` จาก `env.example`:
```bash
cp env.example .env
```

แก้ไขไฟล์ `.env` และใส่ค่าที่ถูกต้อง:
- `FIREBASE_ADMIN_KEY`: JSON string ของ Firebase service account
- `LINE_CHANNEL_ID`: LINE Channel ID ของคุณ
- `LINE_CHANNEL_SECRET`: LINE Channel Secret ของคุณ

### 3. รัน Server
```bash
# รันในโหมด development (auto-restart เมื่อมีการเปลี่ยนแปลง)
npm run dev

# รันในโหมด production
npm start
```

Server จะรันที่ `http://localhost:3000`

## 📡 Endpoints ที่มีอยู่

### Authentication Endpoints
- `POST /api/auth/register` - ลงทะเบียนผู้ใช้ใหม่
- `POST /api/auth/login` - เข้าสู่ระบบ
- `GET /api/auth/profile` - ดูข้อมูลผู้ใช้ (ต้องมี token)
- `PUT /api/auth/profile` - อัพเดทข้อมูลผู้ใช้ (ต้องมี token)
- `POST /api/auth/logout` - ออกจากระบบ

### LINE Login Endpoints
- `GET /api/auth/line/auth-url` - ได้ LINE authorization URL
- `POST /api/auth/line/login` - แลก code เป็น token
- **`POST /api/auth/line/process-login`** - Process LINE login ด้วย access token (แปลงมาจาก Firebase Function)
- `POST /api/auth/line/verify` - ตรวจสอบ LINE token
- `POST /api/auth/line/logout` - ออกจากระบบ LINE
- `GET /api/auth/line/callback` - จัดการ LINE callback

### Firebase Sync Endpoints
- `POST /api/auth/sync-user` - ซิงค์ข้อมูลผู้ใช้จาก Firebase
- `GET /api/auth/profile-by-firebase/:uid` - ดูข้อมูลผู้ใช้ตาม Firebase UID
- `PUT /api/auth/update-profile-by-firebase/:uid` - อัพเดทข้อมูลผู้ใช้ตาม Firebase UID

### Utility Endpoints
- `GET /api/health` - ตรวจสอบสถานะ server
- `GET /api/users` - ดูรายชื่อผู้ใช้ทั้งหมด
- `POST /api/auth/revoke-user` - ยกเลิก refresh tokens ของผู้ใช้

## 🔧 การแปลง Firebase Functions

### Firebase Function `processLineLogin` → Express Endpoint `/api/auth/line/process-login`

**เดิม (Firebase Functions):**
```javascript
exports.processLineLogin = onRequest(async (request, response) => {
  // ... LINE login logic
});
```

**ใหม่ (Express.js):**
```javascript
app.post('/api/auth/line/process-login', async (req, res) => {
  // ... LINE login logic (เหมือนเดิม)
});
```

### Helper Functions ที่แปลงมา
- `verifyLineAccessToken()` - ตรวจสอบ LINE access token
- `getLineProfile()` - ได้ข้อมูล LINE profile
- `createOrUpdateFirebaseUser()` - สร้างหรืออัพเดท Firebase user

## 🌐 การใช้งาน

### 1. ตรวจสอบสถานะ Server
```bash
curl http://localhost:3000/api/health
```

### 2. ทดสอบ LINE Login
```bash
curl -X POST http://localhost:3000/api/auth/line/process-login \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "your_line_access_token",
    "email": "user@example.com",
    "displayName": "User Name",
    "pictureUrl": "https://example.com/photo.jpg"
  }'
```

### 3. ทดสอบ Authentication
```bash
# ลงทะเบียน
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'

# เข้าสู่ระบบ
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## ⚠️ ข้อควรระวัง

1. **Firebase Admin SDK**: ต้องมี service account key ที่ถูกต้อง
2. **LINE Configuration**: ต้องมี LINE Channel ID และ Secret ที่ถูกต้อง
3. **Environment Variables**: อย่าลืมตั้งค่า `.env` file
4. **Security**: ใน production ควรเปลี่ยน JWT_SECRET และใช้ HTTPS

## 🐛 การแก้ไขปัญหา

### ปัญหา: Firebase Admin SDK ไม่สามารถ initialize ได้
**วิธีแก้:**
- ตรวจสอบว่าไฟล์ `.env` มี `FIREBASE_ADMIN_KEY` ที่ถูกต้อง
- หรือใส่ `serviceAccountKey.json` ในโฟลเดอร์ root

### ปัญหา: LINE API ไม่ตอบสนอง
**วิธีแก้:**
- ตรวจสอบ LINE_CHANNEL_ID และ LINE_CHANNEL_SECRET
- ตรวจสอบ LINE_REDIRECT_URI ว่าตรงกับที่ตั้งค่าใน LINE Developer Console

### ปัญหา: CORS Error
**วิธีแก้:**
- Server รองรับ CORS แล้ว
- ตรวจสอบว่า origin ที่เรียกใช้อยู่ใน allowedOrigins

## 📚 ข้อมูลเพิ่มเติม

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [LINE Login Documentation](https://developers.line.biz/en/docs/line-login/)
- [Express.js Documentation](https://expressjs.com/) 