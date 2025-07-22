# 🍎 Apple Sign In - Quick Start Guide

## ⚡ ขั้นตอนด่วน (5 นาที)

### 1. ตรวจสอบข้อกำหนด
- ✅ Apple Developer Account ($99/ปี)
- ✅ Domain with HTTPS
- ✅ Firebase project

### 2. Apple Developer Console (2 นาที)

#### สร้าง App ID
1. [Apple Developer Console](https://developer.apple.com/account/) → Certificates, Identifiers & Profiles
2. Identifiers → App IDs → + 
3. เลือก **App** → Continue
4. กรอก:
   - Description: `My App`
   - Bundle ID: `com.yourcompany.yourapp`
   - ✅ **Sign In with Apple** (สำคัญ!)
5. Continue → Register

#### สร้าง Service ID
1. Identifiers → Services IDs → +
2. กรอก:
   - Description: `Web Sign In`
   - Identifier: `com.yourcompany.web-signin`
3. ✅ Sign In with Apple → Configure
4. เลือก Primary App ID จากขั้นตอนที่ 1
5. Domains: `yourdomain.com`, `localhost`
6. Return URLs: `https://yourdomain.com/__/auth/handler`, `http://localhost:3000/__/auth/handler`
7. Save → Continue

#### สร้าง Private Key
1. Keys → +
2. Key Name: `Apple Sign In Key`
3. ✅ Sign In with Apple → Configure → เลือก App ID
4. Save → Continue
5. **⚠️ ดาวน์โหลด .p8 file** (ครั้งเดียว!)
6. บันทึก **Key ID** และ **Team ID**

### 3. Firebase Console (2 นาที)

#### เปิดใช้งาน Apple Provider
1. [Firebase Console](https://console.firebase.google.com/project/basic-firebase-9e03e) → Authentication → Sign-in method
2. Apple → Enable
3. กรอก:
   - Services ID: `com.yourcompany.web-signin`
   - Apple Team ID: (จากขั้นตอนที่ 2)
   - Key ID: (จากขั้นตอนที่ 2)
   - Private Key: (เนื้อหาไฟล์ .p8)
4. Save

#### เพิ่ม Authorized Domains
1. Authentication → Settings → Authorized domains
2. Add domain:
   - `yourdomain.com`
   - `localhost`
   - `basic-firebase-9e03e.firebaseapp.com`

### 4. ทดสอบ (1 นาที)

#### ทดสอบบน Localhost
```bash
# เปิดไฟล์ทดสอบ
open apple-signin-test.html
```

#### ทดสอบบน Production
1. อัปโหลดไฟล์ไปยังเซิร์ฟเวอร์ HTTPS
2. เปิดเว็บไซต์
3. คลิกปุ่ม "🍎 Sign in with Apple"

## 🔧 โค้ดที่ต้องมี

### HTML
```html
<button id="appleLoginBtn" class="apple-btn">
    🍎 Sign in with Apple
</button>
```

### JavaScript
```javascript
// Initialize Apple provider
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Apple Sign In
appleLoginBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, appleProvider);
        console.log('Success:', result.user);
    } catch (error) {
        console.error('Error:', error);
    }
});
```

## 🚨 ปัญหาที่พบบ่อย

| Error | วิธีแก้ |
|-------|---------|
| `auth/unauthorized-domain` | เพิ่มโดเมนใน Firebase Console |
| `auth/invalid-credential` | ตรวจสอบ Services ID, Team ID, Key ID |
| `auth/popup-blocked` | อนุญาต popup ในเบราว์เซอร์ |
| `auth/operation-not-allowed` | เปิดใช้งาน Apple provider ใน Firebase |

## 📁 ไฟล์ที่เกี่ยวข้อง

- `APPLE_SETUP_SIMPLE.md` - คู่มือละเอียด
- `apple-signin-test.html` - ไฟล์ทดสอบ
- `index-simple.html` - หน้าเว็บหลัก
- `app-simple.js` - โค้ด JavaScript

## ✅ Checklist

- [ ] Apple Developer Account
- [ ] App ID + Sign In with Apple
- [ ] Service ID + Domains
- [ ] Private Key (.p8)
- [ ] Firebase Apple Provider
- [ ] Authorized Domains
- [ ] ทดสอบ Localhost
- [ ] ทดสอบ Production

## 💰 ต้นทุน

- **Apple Developer Account**: $99/ปี
- **Domain + SSL**: ขึ้นอยู่กับผู้ให้บริการ
- **Firebase**: ฟรี (พื้นฐาน)

---

**🎯 เป้าหมาย**: ใช้ Apple Sign In ในเว็บแอปพลิเคชันได้ภายใน 5 นาที!

**📖 คู่มือละเอียด**: ดูไฟล์ `APPLE_SETUP_SIMPLE.md` 