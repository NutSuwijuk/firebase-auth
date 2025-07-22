# 🟩 LINE Login Troubleshooting Guide

## 📋 ภาพรวม

คู่มือนี้จะช่วยคุณแก้ไขปัญหาต่างๆ ที่อาจเกิดขึ้นเมื่อใช้ LINE login ในแอปพลิเคชัน

## 🚨 ปัญหาที่พบบ่อย

### 1. ❌ "LINE login was cancelled by user"

**อาการ**: ข้อความ error นี้ปรากฏเมื่อผู้ใช้ปิด popup window ของ LINE login ก่อนที่จะเสร็จสิ้น

**สาเหตุ**:
- ผู้ใช้ปิด popup window ระหว่างกระบวนการ authorization
- Popup ถูกปิดโดย browser หรือระบบ
- ผู้ใช้กดปุ่ม Cancel ในหน้า LINE authorization

**วิธีแก้**:
1. **สำหรับผู้ใช้**:
   - อย่าปิด popup window จนกว่าจะเห็นข้อความสำเร็จ
   - ตรวจสอบว่า popup blocker ถูกปิด
   - ลองใหม่อีกครั้ง

2. **สำหรับ Developer**:
   - ตรวจสอบ popup blocker settings
   - ตรวจสอบ browser console สำหรับ error อื่นๆ
   - ใช้ไฟล์ `test-line-error-handling.html` เพื่อทดสอบ

**โค้ดที่เกี่ยวข้อง**:
```javascript
// ใน app-simple.js บรรทัด 350-360
if (popup.closed) {
    console.log('🔄 Popup window was closed by user');
    reject(new Error('LINE login was cancelled by user'));
}
```

### 2. 🚫 "Popup blocked by browser"

**อาการ**: Popup ไม่เปิดขึ้นมา หรือถูกปิดทันที

**สาเหตุ**:
- Browser ปิดกั้น popup
- Popup blocker extension ทำงาน
- Security settings ของ browser

**วิธีแก้**:
1. **อนุญาต popup สำหรับเว็บไซต์นี้**:
   - Chrome: คลิกไอคอน popup blocker ใน address bar
   - Firefox: คลิกไอคอน shield ใน address bar
   - Safari: ไปที่ Preferences > Websites > Pop-up Windows

2. **ปิด popup blocker extension**:
   - AdBlock, uBlock Origin, หรือ extension อื่นๆ
   - เพิ่มเว็บไซต์ใน whitelist

3. **ตรวจสอบ browser settings**:
   - อนุญาต popup สำหรับ localhost
   - ตรวจสอบ security settings

### 3. 🔌 "Backend server not available"

**อาการ**: ข้อความ error เกี่ยวกับ backend server

**สาเหตุ**:
- Backend server ไม่ได้รัน
- Port 3000 ถูกใช้งานโดยโปรแกรมอื่น
- Network connectivity issues

**วิธีแก้**:
1. **เริ่มต้น backend server**:
   ```bash
   node server.js
   ```

2. **ตรวจสอบ port 3000**:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # macOS/Linux
   lsof -i :3000
   ```

3. **ตรวจสอบ backend health**:
   ```bash
   curl http://localhost:3000/api/health
   ```

### 4. ⏰ "LINE login timeout"

**อาการ**: ข้อความ timeout หลังจากรอ 10 นาที

**สาเหตุ**:
- ผู้ใช้ไม่ได้ดำเนินการใน popup
- Network issues
- LINE server issues

**วิธีแก้**:
1. **ลองใหม่อีกครั้ง**:
   - ปิด popup และลองใหม่
   - ตรวจสอบ network connection

2. **ตรวจสอบ LINE server status**:
   - ตรวจสอบ LINE Developer Console
   - ตรวจสอบ LINE API status

### 5. 🔐 "Account exists with different credential"

**อาการ**: ข้อความ error เมื่อพยายามใช้ email เดียวกับ Google account

**สาเหตุ**:
- มีบัญชี Firebase อยู่แล้วด้วย email เดียวกัน
- ใช้ provider ต่างกัน (Google vs LINE)

**วิธีแก้**:
1. **ใช้ Account Linking**:
   - ระบบจะแสดงปุ่มสำหรับเชื่อมต่อบัญชี
   - กดปุ่ม "Sign in with Google First"
   - จากนั้นเชื่อมต่อ LINE account

2. **ตรวจสอบ Firebase Console**:
   - ดูว่ามี user อยู่แล้วหรือไม่
   - ตรวจสอบ provider settings

## 🧪 การทดสอบ

### 1. ใช้ไฟล์ทดสอบ

```bash
# เปิดไฟล์ทดสอบ error handling
open test-line-error-handling.html

# เปิดไฟล์ทดสอบ account linking
open test-account-linking.html
```

### 2. ทดสอบตามสถานการณ์

1. **ทดสอบ Popup Blocked**:
   - เปิด popup blocker
   - ลอง LINE login
   - ตรวจสอบ error message

2. **ทดสอบ User Cancellation**:
   - เริ่ม LINE login
   - ปิด popup ทันที
   - ตรวจสอบ error message

3. **ทดสอบ Backend Unavailable**:
   - ปิด backend server
   - ลอง LINE login
   - ตรวจสอบ error message

4. **ทดสอบ Normal Flow**:
   - เริ่ม backend server
   - ทำ LINE login ปกติ
   - ตรวจสอบการทำงาน

### 3. ตรวจสอบ Console Logs

เปิด Developer Tools > Console และดู logs:

```javascript
// Logs ที่ควรเห็น:
🔄 Starting LINE login process...
📡 Getting LINE authorization URL...
✅ Got authorization URL
🪟 Opening popup window...
🪟 Popup opened, waiting for authorization...
✅ LINE authorization successful, processing login...
✅ LINE login successful
```

## 🔍 การ Debug

### 1. ตรวจสอบ Network Tab

เปิด Developer Tools > Network และดู API calls:

- `GET /api/auth/line/auth-url` - ขอ authorization URL
- `POST /api/auth/line/login` - แลกเปลี่ยน code เป็น token
- `POST /api/auth/line/link-account` - เชื่อมต่อบัญชี (ถ้ามี)

### 2. ตรวจสอบ Local Storage

```javascript
// ใน Console พิมพ์:
localStorage.getItem('pendingLineLink')
localStorage.getItem('lineUser')
localStorage.getItem('lineCustomToken')
```

### 3. ตรวจสอบ Backend Logs

ดู logs ใน terminal ที่รัน `node server.js`:

```bash
# ควรเห็น logs เช่น:
Processing LINE login request
LINE authorization successful
Firebase custom token created
```

## 🛠️ การแก้ไขปัญหา

### 1. ปัญหา Popup

```javascript
// ตรวจสอบ popup settings
const popup = window.open(
    authUrl,
    'lineLogin',
    'width=500,height=600,scrollbars=yes,resizable=yes,location=yes,status=yes'
);

// ตรวจสอบว่า popup เปิดสำเร็จ
if (!popup || popup.closed) {
    throw new Error('Popup blocked by browser');
}
```

### 2. ปัญหา Backend

```javascript
// ตรวจสอบ backend health
async function checkBackendHealth() {
    try {
        const response = await fetch('http://localhost:3000/api/health');
        return response.ok;
    } catch (error) {
        return false;
    }
}
```

### 3. ปัญหา Account Linking

```javascript
// ตรวจสอบ provider ที่ใช้ได้
const providers = await fetchSignInMethodsForEmail(auth, email);
console.log('Available providers:', providers);
```

## 📝 หมายเหตุสำคัญ

1. **Backend Required**: LINE login ต้องการ backend server ที่รันอยู่
2. **Popup Settings**: ต้องอนุญาต popup สำหรับเว็บไซต์นี้
3. **Network**: ต้องมีการเชื่อมต่ออินเทอร์เน็ต
4. **LINE Configuration**: ต้องตั้งค่า LINE Channel ID และ Secret ถูกต้อง
5. **Firebase Configuration**: ต้องตั้งค่า Firebase project ถูกต้อง

## 🆘 การขอความช่วยเหลือ

หากยังมีปัญหา ให้ตรวจสอบ:

1. **Console Logs**: ดู error messages ใน browser console
2. **Network Tab**: ตรวจสอบ API calls ที่ล้มเหลว
3. **Backend Logs**: ดู logs ใน terminal
4. **LINE Developer Console**: ตรวจสอบ LINE app settings
5. **Firebase Console**: ตรวจสอบ Firebase project settings

## 📞 ติดต่อ

หากต้องการความช่วยเหลือเพิ่มเติม:
- ตรวจสอบไฟล์ `ACCOUNT_LINKING_GUIDE.md`
- ใช้ไฟล์ `test-line-error-handling.html` เพื่อทดสอบ
- ตรวจสอบ logs และ error messages ที่แสดง 