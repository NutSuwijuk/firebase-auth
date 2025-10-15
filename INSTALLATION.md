# 🚀 Installation Guide - Linked Accounts API

## 📋 Prerequisites

- Node.js (v16 หรือสูงกว่า)
- npm หรือ yarn
- Firebase project ที่มี service account key

## 🔧 Installation Steps

### 1. Install Dependencies

```bash
# Install all required packages
npm install
```

### 2. Environment Setup

สร้างไฟล์ `.env` ในโฟลเดอร์หลักและใส่ค่าต่อไปนี้:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=daring-calling-827
FIREBASE_DATABASE_URL=https://daring-calling-827.firebaseio.com

# JWT Secret (change this in production)
JWT_SECRET=your-secret-key-change-in-production

# Server Configuration
PORT=3000
NODE_ENV=development

# LINE Configuration
LINE_CHANNEL_ID=2007733529
LINE_CHANNEL_SECRET=4e3197d83a8d9836ae5794fda50b698a
LINE_REDIRECT_URI=http://127.0.0.1:5500/index.html
```

**หมายเหตุ**: ไฟล์ `.env` ควรอยู่ใน `.gitignore` เพื่อความปลอดภัย

### 3. Firebase Service Account

#### Option A: Service Account File (Recommended for development)
1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือก project ของคุณ
3. ไปที่ Project Settings > Service Accounts
4. คลิก "Generate New Private Key"
5. ดาวน์โหลดไฟล์ JSON
6. เปลี่ยนชื่อเป็น `serviceAccountKey.json`
7. วางในโฟลเดอร์หลักของโปรเจค

#### Option B: Environment Variables (Recommended for production)
```bash
FIREBASE_ADMIN_KEY={"type":"service_account",...}
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📦 Dependencies Installed

### Core Dependencies
- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **axios**: HTTP client
- **dotenv**: Environment variables loader
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT handling
- **uuid**: Unique ID generation
- **firebase-admin**: Firebase Admin SDK

### Development Dependencies
- **nodemon**: Auto-restart server during development

## 🔍 Troubleshooting

### Error: Cannot find module 'dotenv'
```bash
npm install dotenv
```

### Error: Cannot find module 'firebase-admin'
```bash
npm install firebase-admin
```

### Firebase Authentication Error
1. ตรวจสอบ service account key
2. ตรวจสอบ project ID
3. ตรวจสอบ environment variables

### Port Already in Use
```bash
# เปลี่ยน port ใน .env
PORT=3001
```

## 🧪 Testing

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Test Linked Accounts API
เปิดไฟล์ `test-linked-accounts.html` ใน browser

### 3. Test with cURL
```bash
# Test by UID
curl http://localhost:3000/api/auth/linked-accounts/test-uid

# Test by Email
curl http://localhost:3000/api/auth/linked-accounts-by-email/test@example.com
```

## 📁 File Structure After Installation

```
firebase-auth/
├── server.js                          # Main server
├── package.json                       # Dependencies
├── package-lock.json                  # Lock file
├── .env                               # Environment variables (create this)
├── serviceAccountKey.json             # Firebase service account (download this)
├── test-linked-accounts.html          # Test UI
├── LINKED_ACCOUNTS_API.md            # API documentation
├── example-responses.json             # Example responses
├── README_LINKED_ACCOUNTS.md         # Complete guide
├── INSTALLATION.md                    # This file
└── environment.txt                    # Environment template
```

## 🚀 Next Steps

1. **Test the API**: ใช้ไฟล์ `test-linked-accounts.html`
2. **Read Documentation**: ดู `LINKED_ACCOUNTS_API.md`
3. **Customize**: แก้ไข `server.js` ตามต้องการ
4. **Deploy**: เตรียมพร้อมสำหรับ production

## 🆘 Support

หากมีปัญหาการติดตั้ง:
1. ตรวจสอบ Node.js version
2. ลบ `node_modules` และ `package-lock.json`
3. รัน `npm install` อีกครั้ง
4. ตรวจสอบ environment variables
5. ตรวจสอบ Firebase service account

---

**Happy Installation! 🎉**

