# 🔓 Unlink Provider Feature - Firebase Auth

## ภาพรวม (Overview)

ฟีเจอร์ Unlink Provider ช่วยให้ผู้ใช้สามารถยกเลิกการเชื่อมต่อ social provider (เช่น Google, Apple, LINE, Facebook) จากบัญชี Firebase Auth ของตนได้ โดยมีการป้องกันไม่ให้ผู้ใช้ unlink provider สุดท้ายที่เหลืออยู่

## 🏗️ สถาปัตยกรรม (Architecture)

ระบบนี้ใช้หลักการ **Hexagonal Architecture** (Clean Architecture) เพื่อแยก concerns และทำให้โค้ดง่ายต่อการทดสอบและบำรุงรักษา

### โครงสร้างไฟล์

```
├── server.js                    # Main server file with API endpoints
├── services/
│   └── authService.js          # Business logic layer
├── repositories/
│   └── firebaseRepository.js   # Data access layer
├── index.html                  # Main UI with unlink functionality
└── test-unlink-provider.html   # Test page for API testing
```

### Layer Responsibilities

1. **API Layer (server.js)**: จัดการ HTTP requests/responses และ validation
2. **Service Layer (authService.js)**: จัดการ business logic และ rules
3. **Repository Layer (firebaseRepository.js)**: จัดการการเข้าถึงข้อมูล Firebase

## 🚀 API Endpoints

### 1. ตรวจสอบว่าสามารถ unlink ได้หรือไม่
```http
GET /api/auth/can-unlink-provider/:firebaseUid/:providerId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "canUnlink": true,
    "reason": "SUCCESS",
    "message": "สามารถ unlink provider ได้",
    "totalProviders": 3,
    "remainingProviders": 2
  }
}
```

### 2. Unlink provider โดยใช้ Firebase UID
```http
POST /api/auth/unlink-provider
Content-Type: application/json

{
  "firebaseUid": "user-uid-here",
  "providerId": "google.com",
  "confirmUnlink": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "ยกเลิกการเชื่อมต่อ google.com สำเร็จ",
  "data": {
    "firebaseUid": "user-uid-here",
    "email": "user@example.com",
    "displayName": "User Name",
    "unlinkedProvider": "google.com",
    "remainingProviders": [
      {
        "providerId": "apple.com",
        "displayName": "User Name",
        "email": "user@example.com",
        "photoURL": "https://..."
      }
    ],
    "unlinkedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Unlink provider โดยใช้ email
```http
POST /api/auth/unlink-provider-by-email
Content-Type: application/json

{
  "email": "user@example.com",
  "providerId": "google.com",
  "confirmUnlink": true
}
```

## 🛡️ Business Rules & Validation

### 1. การป้องกันการ unlink provider สุดท้าย
- ไม่สามารถ unlink provider ได้หากเป็น provider เดียวที่เหลืออยู่
- ระบบจะตรวจสอบจำนวน providers ก่อนทำการ unlink

### 2. การตรวจสอบการมีอยู่ของ provider
- ตรวจสอบว่า provider ที่ต้องการ unlink มีอยู่จริงในบัญชี
- ตรวจสอบว่า Firebase UID หรือ email มีอยู่จริงในระบบ

### 3. การยืนยันการ unlink
- ต้องมีการยืนยัน (`confirmUnlink: true`) เพื่อป้องกันการ unlink โดยไม่ตั้งใจ

## 🎨 UI Features

### 1. Linked Providers Management Section
- แสดงรายการ providers ที่เชื่อมต่ออยู่
- แสดงสถานะของแต่ละ provider (เชื่อมต่อแล้ว/เป็น provider สุดท้าย)
- ปุ่ม unlink สำหรับแต่ละ provider

### 2. Confirmation Dialog
- แสดง dialog ยืนยันก่อนทำการ unlink
- ป้องกันการ unlink โดยไม่ตั้งใจ

### 3. Visual Indicators
- สีและไอคอนที่แตกต่างกันสำหรับแต่ละ provider
- สถานะที่ชัดเจนสำหรับ provider สุดท้าย

## 🧪 การทดสอบ (Testing)

### 1. ใช้ Test Page
เปิด `test-unlink-provider.html` ในเบราว์เซอร์เพื่อทดสอบ API endpoints

### 2. Manual Testing Steps
1. ล็อกอินด้วยหลาย providers (Google, Apple, LINE)
2. ไปที่หน้า main application
3. ดูในส่วน "จัดการ Linked Providers"
4. ทดสอบการ unlink provider ต่างๆ
5. ตรวจสอบว่าไม่สามารถ unlink provider สุดท้ายได้

### 3. API Testing
```bash
# ตรวจสอบ linked accounts
curl http://localhost:3000/api/auth/linked-accounts/USER_UID

# ตรวจสอบว่าสามารถ unlink ได้หรือไม่
curl http://localhost:3000/api/auth/can-unlink-provider/USER_UID/google.com

# Unlink provider
curl -X POST http://localhost:3000/api/auth/unlink-provider \
  -H "Content-Type: application/json" \
  -d '{"firebaseUid":"USER_UID","providerId":"google.com","confirmUnlink":true}'
```

## 🔧 การติดตั้งและใช้งาน

### 1. เริ่มต้น Server
```bash
npm start
# หรือ
node server.js
```

### 2. เปิดหน้าเว็บ
- Main application: `http://localhost:3000/index.html`
- Test page: `http://localhost:3000/test-unlink-provider.html`

### 3. ตรวจสอบ Console Logs
Server จะแสดง logs เกี่ยวกับการทำงานของ unlink provider

## 📋 Error Handling

### Common Error Codes
- `USER_NOT_FOUND`: ไม่พบผู้ใช้ในระบบ
- `PROVIDER_NOT_LINKED`: Provider ไม่ได้เชื่อมต่อกับบัญชี
- `CANNOT_UNLINK_LAST_PROVIDER`: ไม่สามารถ unlink provider สุดท้ายได้
- `CONFIRMATION_REQUIRED`: ต้องยืนยันการ unlink
- `MISSING_REQUIRED_FIELDS`: ข้อมูลที่จำเป็นไม่ครบถ้วน

### Error Response Format
```json
{
  "success": false,
  "error": "ข้อความแสดงข้อผิดพลาด",
  "details": "รายละเอียดเพิ่มเติม",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔒 Security Considerations

### 1. Authentication
- ต้องมี Firebase UID หรือ email ที่ถูกต้อง
- ตรวจสอบสิทธิ์การเข้าถึงบัญชี

### 2. Validation
- ตรวจสอบข้อมูล input อย่างเข้มงวด
- ป้องกันการ unlink โดยไม่ได้รับอนุญาต

### 3. Logging
- บันทึก logs การ unlink provider
- ติดตามการเปลี่ยนแปลงใน custom claims

## 🚀 Future Enhancements

### 1. Planned Features
- [ ] Bulk unlink multiple providers
- [ ] Unlink history tracking
- [ ] Email notifications for unlink events
- [ ] Admin panel for managing user providers

### 2. Performance Improvements
- [ ] Caching for provider data
- [ ] Batch operations for multiple users
- [ ] Rate limiting for unlink operations

## 📞 Support

หากมีปัญหาหรือข้อสงสัยเกี่ยวกับฟีเจอร์ unlink provider กรุณาติดต่อทีมพัฒนา

---

**หมายเหตุ**: ฟีเจอร์นี้ถูกพัฒนาตามหลักการ Clean Code และ Best Practices เพื่อให้ง่ายต่อการบำรุงรักษาและขยายความสามารถในอนาคต