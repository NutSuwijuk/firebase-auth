# 🔗 Linked Accounts API - Complete Guide

## 📋 Overview

Linked Accounts API เป็นระบบที่ออกแบบมาเพื่อดึงข้อมูลว่าบัญชี Firebase นี้ผูกกับ social provider ไหนบ้าง โดยจะดึงข้อมูลจาก Firebase Auth และ Custom Claims เพื่อให้ข้อมูลที่ครบถ้วนและใช้งานง่าย

## 🚀 Features

- ✅ **ดึงข้อมูล linked accounts** จาก Firebase UID หรือ Email
- ✅ **รองรับ social providers** หลากหลาย (Google, Apple, LINE, Facebook, etc.)
- ✅ **แสดงสถิติ** ของบัญชี (จำนวน providers, primary provider, etc.)
- ✅ **แสดง providers ที่สามารถ link ได้** ในอนาคต
- ✅ **รองรับ custom claims** สำหรับข้อมูลเพิ่มเติม
- ✅ **Error handling** ที่ครอบคลุม
- ✅ **UI สำหรับทดสอบ** ที่ใช้งานง่าย

## 📁 File Structure

```
firebase-auth/
├── server.js                          # Main server with new endpoints
├── test-linked-accounts.html          # Test UI for the API
├── LINKED_ACCOUNTS_API.md            # Detailed API documentation
├── example-responses.json             # Example response structures
└── README_LINKED_ACCOUNTS.md         # This file
```

## 🔧 Installation & Setup

### 1. Start the Server
```bash
# Start the backend server
node server.js
```

### 2. Access the Test UI
เปิดไฟล์ `test-linked-accounts.html` ใน browser หรือใช้ Live Server

### 3. Test the API
ใช้ Firebase UID หรือ Email ที่มีอยู่จริงเพื่อทดสอบ

## 📡 API Endpoints

### 1. Get Linked Accounts by UID
```
GET /api/auth/linked-accounts/:firebaseUid
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/auth/linked-accounts/abc123def456"
```

### 2. Get Linked Accounts by Email
```
GET /api/auth/linked-accounts-by-email/:email
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/auth/linked-accounts-by-email/user%40example.com"
```

## 📊 Response Structure

### Success Response
```json
{
  "success": true,
  "user": { /* User information */ },
  "linkedAccounts": {
    "providers": [ /* Array of linked providers */ ],
    "stats": { /* Account statistics */ },
    "summary": { /* Summary information */ }
  },
  "availableProviders": [ /* Providers that can be linked */ ],
  "customClaims": { /* Custom claims information */ },
  "metadata": { /* API metadata */ }
}
```

### Key Information
- **User**: ข้อมูลพื้นฐานของผู้ใช้
- **Linked Accounts**: บัญชีที่ผูกกับ social providers
- **Available Providers**: providers ที่สามารถ link ได้
- **Statistics**: สถิติของบัญชี
- **Custom Claims**: ข้อมูลเพิ่มเติมจาก Firebase

## 🎯 Use Cases

### 1. Account Management Dashboard
แสดงให้ผู้ใช้เห็นว่าบัญชีของตนผูกกับ social providers ไหนบ้าง

### 2. Social Login Options
แสดง providers ที่ผู้ใช้สามารถ link เพิ่มเติมได้

### 3. Account Security
ตรวจสอบว่าบัญชีมี multiple authentication methods หรือไม่

### 4. User Analytics
วิเคราะห์พฤติกรรมการใช้ social login ของผู้ใช้

## 🔍 Testing

### Using the Test UI
1. เปิด `test-linked-accounts.html`
2. ใส่ Firebase UID หรือ Email
3. กดปุ่ม "Get by UID" หรือ "Get by Email"
4. ดูผลลัพธ์ที่ได้

### Using cURL
```bash
# Test with UID
curl -X GET "http://localhost:3000/api/auth/linked-accounts/test-uid"

# Test with Email
curl -X GET "http://localhost:3000/api/auth/linked-accounts-by-email/test%40example.com"
```

### Using JavaScript
```javascript
// Get linked accounts
const response = await fetch('/api/auth/linked-accounts/user123');
const data = await response.json();

if (data.success) {
  console.log('Linked providers:', data.linkedAccounts.providers);
  console.log('Total linked:', data.linkedAccounts.stats.totalLinked);
}
```

## 🎨 UI Features

### Provider Cards
- **Linked Providers**: แสดงด้วยสีเขียวและสถานะ "Primary" หรือ "Linked"
- **Available Providers**: แสดงด้วยสีเทาและสถานะ "Available"

### Statistics Dashboard
- **Total Linked**: จำนวน providers ที่ link แล้ว
- **Multiple Providers**: มีหลาย providers หรือไม่
- **Email Verified**: อีเมลยืนยันแล้วหรือไม่
- **Primary Provider**: provider หลักที่ใช้

### Interactive Elements
- **Expandable Sections**: ดูข้อมูลเพิ่มเติมได้
- **Raw Data View**: ดู response JSON ทั้งหมด
- **Error Handling**: แสดงข้อผิดพลาดอย่างชัดเจน

## 🔧 Customization

### Adding New Providers
แก้ไข `providerMap` ใน `server.js`:

```javascript
const providerMap = {
  'new-provider.com': {
    name: 'New Provider',
    icon: '🆕',
    color: '#FF6B6B',
    status: 'active'
  }
  // ... existing providers
};
```

### Modifying Response Structure
แก้ไข `responseData` ใน endpoint เพื่อเพิ่มหรือลบ fields

### Custom Claims Integration
เพิ่ม custom claims ใน Firebase เพื่อเก็บข้อมูลเพิ่มเติมของแต่ละ provider

## 🚨 Error Handling

### Common Error Codes
- **404**: User not found
- **400**: Invalid UID or email
- **500**: Server error

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information",
  "code": "error-code",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📈 Performance Considerations

### Caching
- Firebase Admin SDK มี built-in caching
- Custom claims ถูก cache โดย Firebase

### Rate Limiting
- Firebase Admin SDK มี rate limiting
- ควรเพิ่ม rate limiting สำหรับ production

### Database Queries
- ใช้ Firebase Admin SDK เพื่อประสิทธิภาพสูงสุด
- ไม่มีการ query database เพิ่มเติม

## 🔒 Security

### Authentication
- ใช้ Firebase Admin SDK
- ตรวจสอบ UID และ email ที่ถูกต้อง

### Data Privacy
- ไม่ส่งข้อมูลที่ sensitive
- ใช้ custom claims สำหรับข้อมูลเพิ่มเติม

### Input Validation
- ตรวจสอบ UID format
- ตรวจสอบ email format
- Sanitize input data

## 🚀 Production Deployment

### Environment Variables
```bash
FIREBASE_ADMIN_KEY=your-service-account-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### Monitoring
- Log all API calls
- Monitor error rates
- Track response times

### Scaling
- ใช้ load balancer
- Implement caching layer
- Monitor Firebase quotas

## 📚 Additional Resources

### Documentation
- [LINKED_ACCOUNTS_API.md](LINKED_ACCOUNTS_API.md) - Detailed API documentation
- [example-responses.json](example-responses.json) - Example responses

### Firebase Resources
- [Firebase Admin SDK](https://firebase.google.com/docs/admin)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)

### Testing Tools
- [test-linked-accounts.html](test-linked-accounts.html) - Interactive test UI
- [Postman](https://www.postman.com/) - API testing
- [cURL](https://curl.se/) - Command line testing

## 🤝 Contributing

### Adding Features
1. Fork the repository
2. Create feature branch
3. Add tests
4. Submit pull request

### Reporting Issues
- ใช้ GitHub Issues
- อธิบายปัญหาอย่างชัดเจน
- แนบ error logs และ steps to reproduce

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

หากมีปัญหาหรือคำถาม:
1. ตรวจสอบ documentation ก่อน
2. ดู example responses
3. ทดสอบด้วย test UI
4. ส่ง issue ใน GitHub

---

**Happy Coding! 🎉**
