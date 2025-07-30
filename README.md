# Firebase Authentication with LINE Login

โปรเจคนี้เป็นระบบ Authentication ที่ใช้ Firebase Functions ร่วมกับ LINE Login พร้อมการวัดประสิทธิภาพ (Performance Metrics)

## ✨ ฟีเจอร์หลัก

- 🔐 LINE Login Integration
- 🚀 Firebase Cloud Functions
- 📊 Performance Metrics Tracking
- 🧪 Firebase Emulators Support
- 📈 Real-time Monitoring

## 🚀 การเริ่มต้นใช้งาน

### 1. การติดตั้ง Dependencies

```bash
# ติดตั้ง dependencies หลัก
npm install

# ติดตั้ง dependencies สำหรับ functions
cd functions
npm install
cd ..
```

### 2. การตั้งค่า Firebase

```bash
# ติดตั้ง Firebase CLI (ถ้ายังไม่มี)
npm install -g firebase-tools

# Login เข้า Firebase
firebase login

# ตั้งค่าโปรเจค
firebase use daring-calling-827
```

### 3. การเริ่มต้น Firebase Emulators

```bash
# เริ่มต้น emulators ทั้งหมด
npm run emulators

# หรือเริ่มต้นเฉพาะ functions
npm run emulators:functions

# หรือใช้ไฟล์ batch (Windows)
start-emulators.bat
```

### 4. การทดสอบ Functions

```bash
# ทดสอบ functions พร้อม performance metrics
npm run test:functions
```

## 📊 Performance Metrics ที่วัดได้

โค้ดนี้จะวัดและแสดงผลข้อมูลต่อไปนี้:

### 1. Invocations (จำนวนการเรียกใช้)
- นับจำนวนครั้งที่ฟังก์ชันถูกเรียก
- แสดงผลในรูปแบบ: `Total Invocations: X`

### 2. Execution Time (เวลาในการประมวลผล)
- วัดเวลาที่ใช้ในการทำงานของฟังก์ชัน
- แสดงผลในรูปแบบ: `Execution Time: XXXms`

### 3. Memory Usage (การใช้หน่วยความจำ)
- วัดการใช้หน่วยความจำของฟังก์ชัน
- แสดงผลในรูปแบบ: `Memory Used: ~X.XX MB`

### 4. Outbound Networking (ข้อมูลขาออก)
- วัดขนาดข้อมูลที่ส่งกลับไปยัง client
- แสดงผลในรูปแบบ: `Outbound Networking Size: XXX bytes`

### 5. 📊 Global Performance Summary
- สรุปผลการทำงานทั้งหมดหลังจากแต่ละการเรียกใช้
- แสดงสถิติเฉลี่ยและค่าใช้จ่ายโดยประมาณ
- แบ่งตามฟังก์ชัน (Function Breakdown)

## 🔧 การตั้งค่า

### ไฟล์ firebase.json
```json
{
  "functions": {
    "source": "functions"
  },
  "emulators": {
    "functions": {
      "port": 5001
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### Environment Variables
สร้างไฟล์ `.env` ในโฟลเดอร์ `functions/`:

```env
LINE_CHANNEL_ID=your_line_channel_id
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_REDIRECT_URI=http://127.0.0.1:5502/index.html
```

## 🧪 การทดสอบ

### 1. ทดสอบผ่าน Emulator UI
1. เปิด http://localhost:4000
2. ไปที่แท็บ "Functions"
3. เลือกฟังก์ชันที่ต้องการทดสอบ
4. ใส่ข้อมูลทดสอบและกด "Execute"

### 2. ทดสอบผ่าน Script
```bash
# รันสคริปต์ทดสอบอัตโนมัติ
npm run test:functions
```

### 3. ทดสอบผ่าน cURL
```bash
# ทดสอบ getLineAuthUrlHttp
curl -X POST http://localhost:5001/daring-calling-827/asia-southeast1/getLineAuthUrlHttp

# ทดสอบ processLineCallbackHttp
curl -X POST http://localhost:5001/daring-calling-827/asia-southeast1/processLineCallbackHttp \
  -H "Content-Type: application/json" \
  -d '{"code":"test_code","state":"test_state"}'

# ดู Performance Stats
curl -X POST http://localhost:5001/daring-calling-827/asia-southeast1/getPerformanceStatsHttp

# Reset Performance Metrics
curl -X POST http://localhost:5001/daring-calling-827/asia-southeast1/resetPerformanceMetricsHttp

## 📈 ตัวอย่างผลลัพธ์ Performance Metrics

เมื่อเรียกใช้ฟังก์ชัน คุณจะเห็น log แบบนี้:

```
=== Starting getLineAuthUrlHttp (Invocation #1) ===
=== Performance Metrics for getLineAuthUrlHttp ===
Total Invocations: 1
Execution Time: 45ms
Memory Used: ~0.12 MB
Peak Memory: ~15.67 MB
Outbound Networking Size: 234 bytes
==============================================

📊 GLOBAL PERFORMANCE SUMMARY
==============================================
⏱️  Uptime: 2.15 minutes
🔄 Total Invocations: 1
⚡ Total Execution Time: 45ms
💾 Total Memory Used: ~0.12 MB
📤 Total Outbound Data: 234 bytes

📈 AVERAGES:
⚡ Avg Execution Time: 45.00ms
💾 Avg Memory Used: ~0.12 MB
📤 Avg Outbound Data: 234 bytes

🔧 FUNCTION BREAKDOWN:

  📋 getLineAuthUrlHttp:
    🔄 Invocations: 1
    ⚡ Avg Time: 45.00ms
    💾 Avg Memory: ~0.12 MB
    📤 Avg Outbound: 234 bytes

💰 ESTIMATED COSTS (per 1000 invocations):
    ⚡ CPU-seconds: 45.00
    💾 GB-seconds: 0.0054
    📤 Outbound: 0.22 MB
==============================================
```

## 🚀 การ Deploy

```bash
# Deploy functions ทั้งหมด
npm run deploy:functions

# หรือ deploy เฉพาะฟังก์ชัน
firebase deploy --only functions:getLineAuthUrlHttp
```

## 📁 โครงสร้างไฟล์

```
firebase-auth/
├── functions/
│   ├── index.js              # Firebase Functions พร้อม Performance Metrics
│   ├── package.json
│   └── serviceAccountKey.json
├── test-functions.js         # สคริปต์ทดสอบ Functions
├── start-emulators.bat       # สคริปต์เริ่มต้น Emulators (Windows)
├── FIREBASE_EMULATORS_GUIDE.md # คู่มือการใช้งาน Emulators
├── firebase.json
├── package.json
└── README.md
```

## 🔍 การ Debug

### 1. ดู Logs แบบ Real-time
```bash
# ดู logs ใน Emulator UI
# เปิด http://localhost:4000 และไปที่แท็บ Functions

# หรือดู logs ใน terminal
firebase emulators:start --only functions --debug
```

### 2. ปัญหาที่พบบ่อย

**ปัญหา**: Functions ไม่เริ่มต้น
```bash
# ตรวจสอบ Node.js version
node --version

# ลบ node_modules และติดตั้งใหม่
cd functions
rm -rf node_modules package-lock.json
npm install
```

**ปัญหา**: Port ถูกใช้งานแล้ว
```bash
# เปลี่ยน port ใน firebase.json
{
  "emulators": {
    "functions": {
      "port": 5002
    }
  }
}
```

## 💰 การคำนวณค่าใช้จ่าย

จากข้อมูล Performance Metrics คุณสามารถประมาณค่าใช้จ่ายได้:

```
Invocations: 1000 calls
Execution Time: 200ms average = 0.2 seconds
Memory: 15MB average = 0.015 GB
Outbound: 500 bytes average

CPU-seconds = 1000 × 0.2 = 200 seconds
GB-seconds = 1000 × 0.2 × 0.015 = 3 GB-seconds
Outbound Networking = 1000 × 500 = 500,000 bytes = 0.5 MB
```

## 📚 เอกสารเพิ่มเติม

- [FIREBASE_EMULATORS_GUIDE.md](./FIREBASE_EMULATORS_GUIDE.md) - คู่มือการใช้งาน Firebase Emulators
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [LINE Login Documentation](https://developers.line.biz/en/docs/line-login/)

## 🤝 การมีส่วนร่วม

1. Fork โปรเจค
2. สร้าง Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📄 License

โปรเจคนี้อยู่ภายใต้ MIT License - ดูรายละเอียดในไฟล์ [LICENSE](LICENSE)