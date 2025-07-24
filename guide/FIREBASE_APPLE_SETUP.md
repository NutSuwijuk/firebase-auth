# 🍎 Firebase Authentication Setup สำหรับ Apple ID

## 📋 ข้อกำหนดเบื้องต้น
- Firebase project: `basic-firebase-9e03e`
- Apple Developer Account (เสียเงิน $99/ปี)
- Domain ที่มี SSL certificate (HTTPS)
- iOS App หรือ Web App ที่ต้องการใช้ Apple Sign In

## 🚀 ขั้นตอนการตั้งค่าแบบละเอียด

### 1. ตั้งค่า Apple Developer Account

#### 1.1 สร้าง App ID ใน Apple Developer Console
1. เข้าไปที่ [Apple Developer Console](https://developer.apple.com/account/)
2. เลือก **Certificates, Identifiers & Profiles**
3. คลิก **Identifiers** > **App IDs**
4. คลิก **+** เพื่อสร้าง App ID ใหม่
5. เลือก **App** และคลิก **Continue**
6. กรอกข้อมูล:
   - **Description**: ชื่อแอปของคุณ (เช่น "My Firebase App")
   - **Bundle ID**: `com.yourcompany.yourapp` (ต้องตรงกับในแอป)
7. เลือก **Sign In with Apple** ในส่วน Capabilities
8. คลิก **Continue** และ **Register**

#### 1.2 สร้าง Service ID สำหรับ Web
1. ใน Apple Developer Console เลือก **Identifiers** > **Services IDs**
2. คลิก **+** เพื่อสร้าง Service ID ใหม่
3. กรอกข้อมูล:
   - **Description**: "Firebase Apple Sign In"
   - **Identifier**: `com.yourcompany.firebase-apple-signin`
4. เลือก **Sign In with Apple** และคลิก **Configure**
5. เลือก **Primary App ID** ที่สร้างไว้ในขั้นตอนที่ 1
6. กรอก **Domains and Subdomains**:
   - `yourdomain.com`
   - `www.yourdomain.com`
   - `localhost` (สำหรับการทดสอบ)
7. กรอก **Return URLs**:
   - `https://yourdomain.com/__/auth/handler`
   - `http://localhost:3000/__/auth/handler` (สำหรับการทดสอบ)
8. คลิก **Save** และ **Continue**

#### 1.3 สร้าง Private Key
1. ใน Apple Developer Console เลือก **Keys**
2. คลิก **+** เพื่อสร้าง key ใหม่
3. กรอกข้อมูล:
   - **Key Name**: "Firebase Apple Sign In Key"
   - เลือก **Sign In with Apple**
4. คลิก **Configure** และเลือก **Primary App ID**
5. คลิก **Save** และ **Continue**
6. **ดาวน์โหลดไฟล์ .p8** (สำคัญมาก! จะดาวน์โหลดได้ครั้งเดียว)
7. บันทึก **Key ID** และ **Team ID**

### 2. ตั้งค่า Firebase Console

#### 2.1 เปิดใช้งาน Apple Provider
1. เข้าไปที่ [Firebase Console](https://console.firebase.google.com/project/basic-firebase-9e03e)
2. เลือก **Authentication** > **Sign-in method**
3. คลิกที่ **Apple** provider
4. คลิก **Enable**
5. กรอกข้อมูล:
   - **Services ID**: `com.yourcompany.firebase-apple-signin`
   - **Apple Team ID**: Team ID จาก Apple Developer Console
   - **Key ID**: Key ID จาก Apple Developer Console
   - **Private Key**: เนื้อหาของไฟล์ .p8 ที่ดาวน์โหลดมา
6. คลิก **Save**

#### 2.2 เพิ่ม Authorized Domains
1. ไปที่ **Authentication** > **Settings**
2. เลื่อนลงไปที่ **Authorized domains**
3. คลิก **Add domain**
4. เพิ่มโดเมน:
   - `yourdomain.com`
   - `www.yourdomain.com`
   - `localhost` (สำหรับการทดสอบ)
   - `basic-firebase-9e03e.firebaseapp.com`

### 3. ตั้งค่าโค้ด JavaScript

#### 3.1 อัปเดตไฟล์ app.js
```javascript
// เพิ่ม Apple Auth Provider
import { OAuthProvider } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// สร้าง Apple Provider
const appleProvider = new OAuthProvider('apple.com');

// ตั้งค่า Apple Provider
appleProvider.addScope('email');
appleProvider.addScope('name');

// เพิ่มปุ่ม Apple Sign In ใน HTML
const appleLoginBtn = document.getElementById('appleLoginBtn');
if (appleLoginBtn) {
  appleLoginBtn.addEventListener('click', async () => {
    try {
      console.log('🍎 Attempting Apple sign in...');
      const result = await signInWithPopup(auth, appleProvider);
      console.log('✅ Apple sign in successful:', result.user);
    } catch (error) {
      console.error('❌ Apple sign in error:', error);
      showError(error);
    }
  });
}
```

#### 3.2 อัปเดต HTML
```html
<!-- เพิ่มปุ่ม Apple Sign In -->
<button id="appleLoginBtn" class="login-btn apple-btn">
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
  เข้าสู่ระบบด้วย Apple
</button>
```

#### 3.3 เพิ่ม CSS สำหรับปุ่ม Apple
```css
.apple-btn {
  background-color: #000;
  color: #fff;
  border: 1px solid #000;
}

.apple-btn:hover {
  background-color: #333;
  border-color: #333;
}

.apple-btn svg {
  margin-right: 8px;
}
```

### 4. การทดสอบ

#### 4.1 ทดสอบบน Localhost
1. เปิดไฟล์ HTML ในเบราว์เซอร์
2. คลิกปุ่ม "เข้าสู่ระบบด้วย Apple"
3. ควรจะเห็น Apple Sign In popup
4. กรอก Apple ID และรหัสผ่าน
5. ตรวจสอบว่าล็อกอินสำเร็จ

#### 4.2 ทดสอบบน Production
1. อัปโหลดไฟล์ไปยังเซิร์ฟเวอร์ที่มี HTTPS
2. ตรวจสอบว่าโดเมนอยู่ใน Authorized Domains
3. ทดสอบการล็อกอินด้วย Apple ID จริง

## 🔍 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### Error: `auth/unauthorized-domain`
```
Firebase: Error (auth/unauthorized-domain)
```

**วิธีแก้:**
1. ไปที่ Firebase Console > Authentication > Settings
2. เพิ่มโดเมนของคุณใน "Authorized domains"
3. รอสักครู่ให้การเปลี่ยนแปลงมีผล

#### Error: `auth/invalid-credential`
```
Firebase: Error (auth/invalid-credential)
```

**วิธีแก้:**
1. ตรวจสอบ Services ID, Team ID, Key ID ใน Firebase Console
2. ตรวจสอบว่า Private Key ถูกต้อง
3. ตรวจสอบว่า App ID เปิดใช้งาน Sign In with Apple

#### Error: `auth/popup-blocked`
```
Firebase: Error (auth/popup-blocked)
```

**วิธีแก้:**
1. อนุญาต popup สำหรับโดเมนของคุณในเบราว์เซอร์
2. ตรวจสอบว่า ad blocker ไม่ได้บล็อก popup
3. ลองใช้ incognito/private mode

#### Error: `auth/operation-not-allowed`
```
Firebase: Error (auth/operation-not-allowed)
```

**วิธีแก้:**
1. ตรวจสอบว่า Apple provider เปิดใช้งานใน Firebase Console
2. ตรวจสอบการตั้งค่า Services ID และ Private Key

## 📊 Checklist การตรวจสอบ

- [ ] Apple Developer Account พร้อมใช้งาน
- [ ] App ID สร้างแล้วและเปิดใช้งาน Sign In with Apple
- [ ] Service ID สร้างแล้วและตั้งค่าโดเมนถูกต้อง
- [ ] Private Key (.p8) ดาวน์โหลดและบันทึกแล้ว
- [ ] Team ID และ Key ID บันทึกแล้ว
- [ ] Apple provider เปิดใช้งานใน Firebase Console
- [ ] Services ID, Team ID, Key ID, Private Key ตั้งค่าใน Firebase ถูกต้อง
- [ ] Authorized domains เพิ่มโดเมนของคุณแล้ว
- [ ] โค้ด JavaScript อัปเดตแล้ว
- [ ] HTML มีปุ่ม Apple Sign In
- [ ] ทดสอบบน localhost สำเร็จ
- [ ] ทดสอบบน production สำเร็จ

## 🔗 ลิงก์ที่เป็นประโยชน์

- [Firebase Console](https://console.firebase.google.com/project/basic-firebase-9e03e)
- [Apple Developer Console](https://developer.apple.com/account/)
- [Firebase Apple Auth Documentation](https://firebase.google.com/docs/auth/web/apple)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)

## 💰 ต้นทุน

- **Apple Developer Account**: $99/ปี
- **Domain with SSL**: ขึ้นอยู่กับผู้ให้บริการ
- **Firebase**: ฟรีสำหรับการใช้งานพื้นฐาน

## ⚠️ ข้อควรระวัง

1. **Private Key (.p8)**: ดาวน์โหลดได้ครั้งเดียว ต้องเก็บไว้อย่างปลอดภัย
2. **Domain Requirements**: ต้องใช้ HTTPS ใน production
3. **Apple Review**: แอปที่ใช้ Apple Sign In อาจต้องผ่าน Apple review
4. **User Experience**: ผู้ใช้ต้องมี Apple ID และเปิดใช้งาน 2FA

## 📞 การสนับสนุน

หากพบปัญหา:

1. ตรวจสอบ browser console สำหรับข้อความ error ที่ละเอียด
2. ตรวจสอบว่าได้ทำตามขั้นตอนทั้งหมดแล้ว
3. ทดสอบกับ localhost ก่อน
4. ตรวจสอบ Firebase Console สำหรับข้อความ error
5. ตรวจสอบว่าโดเมนอยู่ใน authorized domains list
6. ตรวจสอบการตั้งค่าใน Apple Developer Console 