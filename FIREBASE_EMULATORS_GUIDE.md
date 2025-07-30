# คู่มือการใช้งาน Firebase Emulators พร้อมการวัดประสิทธิภาพ

## การติดตั้ง Firebase CLI

ก่อนเริ่มใช้งาน Firebase Emulators คุณต้องติดตั้ง Firebase CLI:

```bash
npm install -g firebase-tools
```

## การเริ่มต้น Firebase Emulators

### 1. การเริ่มต้น Emulators ทั้งหมด

```bash
firebase emulators:start
```

คำสั่งนี้จะเริ่มต้น emulators ทั้งหมดที่กำหนดไว้ในไฟล์ `firebase.json`:
- Functions Emulator (สำหรับ Cloud Functions)
- Auth Emulator (สำหรับ Authentication)
- Firestore Emulator (สำหรับ Firestore Database)
- Storage Emulator (สำหรับ Cloud Storage)

### 2. การเริ่มต้น Emulators เฉพาะบางตัว

```bash
# เริ่มต้นเฉพาะ Functions Emulator
firebase emulators:start --only functions

# เริ่มต้น Functions และ Auth Emulators
firebase emulators:start --only functions,auth

# เริ่มต้น Functions พร้อมกำหนดพอร์ต
firebase emulators:start --only functions --port 5001
```

## การตั้งค่าไฟล์ firebase.json

ไฟล์ `firebase.json` ของคุณควรมีหน้าตาประมาณนี้:

```json
{
  "functions": {
    "source": "functions"
  },
  "emulators": {
    "functions": {
      "port": 5001
    },
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

## การใช้งาน Emulator UI

เมื่อเริ่มต้น emulators แล้ว คุณสามารถเข้าถึง Emulator UI ได้ที่:
- **URL**: http://localhost:4000
- **ฟีเจอร์**: 
  - ดู logs ของ functions
  - ทดสอบ functions
  - ดูข้อมูลใน Firestore
  - จัดการ Authentication

## การวัดประสิทธิภาพ (Performance Metrics)

โค้ดที่เราเพิ่มเข้าไปจะวัดและแสดงผลข้อมูลต่อไปนี้:

### 📊 Global Performance Summary

หลังจากแต่ละการเรียกใช้ฟังก์ชัน ระบบจะแสดงสรุปผลการทำงานทั้งหมด:

```
📊 GLOBAL PERFORMANCE SUMMARY
==============================================
⏱️  Uptime: 15.30 minutes
🔄 Total Invocations: 25
⚡ Total Execution Time: 1250ms
💾 Total Memory Used: ~3.45 MB
📤 Total Outbound Data: 12500 bytes

📈 AVERAGES:
⚡ Avg Execution Time: 50.00ms
💾 Avg Memory Used: ~0.14 MB
📤 Avg Outbound Data: 500 bytes

🔧 FUNCTION BREAKDOWN:

  📋 getLineAuthUrlHttp:
    🔄 Invocations: 15
    ⚡ Avg Time: 25.33ms
    💾 Avg Memory: ~0.08 MB
    📤 Avg Outbound: 234 bytes

  📋 processLineCallbackHttp:
    🔄 Invocations: 10
    ⚡ Avg Time: 85.50ms
    💾 Avg Memory: ~0.22 MB
    📤 Avg Outbound: 850 bytes

💰 ESTIMATED COSTS (per 1000 invocations):
    ⚡ CPU-seconds: 50.00
    💾 GB-seconds: 0.0073
    📤 Outbound: 0.48 MB
==============================================
```

### 1. Invocations (จำนวนการเรียกใช้)
```javascript
// นับจำนวนครั้งที่ฟังก์ชันถูกเรียก
invocationCount.getLineAuthUrlHttp++;
console.log(`Total Invocations: ${invocationCount.getLineAuthUrlHttp}`);
```

### 2. Execution Time (เวลาในการประมวลผล)
```javascript
const startTime = Date.now();
// ... โค้ด Logic ...
const endTime = Date.now();
const executionTime = endTime - startTime;
console.log(`Execution Time: ${executionTime}ms`);
```

### 3. Memory Usage (การใช้หน่วยความจำ)
```javascript
const startMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
// ... โค้ด Logic ...
const endMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
const memoryUsed = endMemory - startMemory;
console.log(`Memory Used: ~${memoryUsed.toFixed(2)} MB`);
```

### 4. Outbound Networking (ข้อมูลขาออก)
```javascript
const responseString = JSON.stringify(responseData);
const responseSize = Buffer.from(responseString).length;
console.log(`Outbound Networking Size: ${responseSize} bytes`);
```

### 5. ฟังก์ชันเพิ่มเติมสำหรับจัดการ Performance Metrics

#### getPerformanceStatsHttp
- **URL**: `/getPerformanceStatsHttp`
- **Method**: POST
- **Description**: ดึงข้อมูล Performance Stats ทั้งหมด
- **Response**: ข้อมูลสถิติการทำงานทั้งหมด

#### resetPerformanceMetricsHttp
- **URL**: `/resetPerformanceMetricsHttp`
- **Method**: POST
- **Description**: รีเซ็ต Performance Metrics ทั้งหมด
- **Response**: ยืนยันการรีเซ็ตสำเร็จ

## ตัวอย่างผลลัพธ์ที่ได้

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
```

## การทดสอบ Functions

### 1. ทดสอบผ่าน Emulator UI
1. เปิด http://localhost:4000
2. ไปที่แท็บ "Functions"
3. เลือกฟังก์ชันที่ต้องการทดสอบ
4. ใส่ข้อมูลทดสอบและกด "Execute"

### 2. ทดสอบผ่าน cURL
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
```

### 3. ทดสอบผ่าน Postman
- **URL**: http://localhost:5001/daring-calling-827/asia-southeast1/getLineAuthUrlHttp
- **Method**: POST
- **Headers**: Content-Type: application/json

## การ Debug และ Troubleshooting

### 1. ดู Logs
```bash
# ดู logs แบบ real-time
firebase emulators:start --only functions --debug

# ดู logs ใน Emulator UI
# เปิด http://localhost:4000 และไปที่แท็บ Functions
```

### 2. ปัญหาที่พบบ่อย

**ปัญหา**: Functions ไม่เริ่มต้น
```bash
# ตรวจสอบว่า Node.js version ถูกต้อง
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

**ปัญหา**: CORS Error
```javascript
// ตรวจสอบ CORS settings ในโค้ด
function handleCORS(request, response) {
  const origin = request.headers.origin;
  if (origin && (origin.includes("localhost") || origin.includes("127.0.0.1"))) {
    response.set("Access-Control-Allow-Origin", origin);
  }
}
```

## การ Deploy ไปยัง Production

เมื่อทดสอบเสร็จแล้ว คุณสามารถ deploy ไปยัง Firebase Production ได้:

```bash
# Deploy functions ทั้งหมด
firebase deploy --only functions

# Deploy เฉพาะฟังก์ชันที่ต้องการ
firebase deploy --only functions:getLineAuthUrlHttp
```

## คำแนะนำเพิ่มเติม

1. **ใช้ Environment Variables**: อย่าลืมตั้งค่า environment variables สำหรับ production
2. **Monitor Performance**: ใช้ Firebase Console เพื่อดู performance metrics จริง
3. **Error Handling**: เพิ่ม error handling ที่ครอบคลุม
4. **Security**: ตรวจสอบ security rules และ authentication

## การคำนวณค่าใช้จ่าย

จากข้อมูลที่วัดได้ คุณสามารถประมาณค่าใช้จ่ายได้:

- **Invocations**: จำนวนครั้งที่ฟังก์ชันถูกเรียก
- **CPU-seconds**: ประมาณจาก Execution Time
- **GB-seconds**: ประมาณจาก Memory Usage
- **Outbound Networking**: ขนาดข้อมูลที่ส่งออก

ตัวอย่างการคำนวณ:
```
Invocations: 1000 calls
Execution Time: 200ms average = 0.2 seconds
Memory: 15MB average = 0.015 GB
Outbound: 500 bytes average

CPU-seconds = 1000 × 0.2 = 200 seconds
GB-seconds = 1000 × 0.2 × 0.015 = 3 GB-seconds
Outbound Networking = 1000 × 500 = 500,000 bytes = 0.5 MB
``` 