# 🔗 Account Linking Guide - LINE + Google

## 📋 ภาพรวม

คู่มือนี้จะอธิบายวิธีการจัดการปัญหาบัญชีซ้ำ (Account Exists With Different Credential) เมื่อผู้ใช้พยายามเข้าสู่ระบบด้วย LINE ด้วย email เดียวกับที่เคยใช้ Google Sign-In มาก่อน

## 🎯 ปัญหาที่เกิดขึ้น

เมื่อผู้ใช้:
1. เข้าสู่ระบบด้วย Google ด้วย email: `user@gmail.com`
2. ออกจากระบบ
3. พยายามเข้าสู่ระบบด้วย LINE ด้วย email เดียวกัน: `user@gmail.com`

Firebase จะส่ง error: `auth/account-exists-with-different-credential` เพราะ Firebase มองว่า email เป็น identifier หลัก

## 🔧 วิธีแก้ปัญหา (Account Linking)

### ขั้นตอนการทำงาน

1. **ดักจับ Error**: ตรวจสอบ error code `auth/account-exists-with-different-credential`
2. **ตรวจสอบ Provider**: ใช้ `fetchSignInMethodsForEmail()` เพื่อดูว่า email นี้ใช้ provider อะไรบ้าง
3. **แจ้งผู้ใช้**: แสดงข้อความและปุ่มสำหรับการเชื่อมต่อบัญชี
4. **Account Linking**: เชื่อมต่อ LINE credential เข้ากับบัญชีเดิม

### โค้ดหลัก

```javascript
// ดักจับ error ใน LINE login
catch (firebaseError) {
    if (firebaseError.code === 'auth/account-exists-with-different-credential') {
        // ตรวจสอบ provider ที่ใช้ได้
        const providers = await fetchSignInMethodsForEmail(auth, loginData.user.email);
        
        // แสดงปุ่มสำหรับ account linking
        showAccountLinkingUI(providers, loginData);
        
        // เก็บข้อมูล pending link
        localStorage.setItem('pendingLineLink', JSON.stringify({
            user: loginData.user,
            customToken: loginData.customToken,
            lineProfile: loginData.lineProfile,
            idTokenData: loginData.idTokenData,
            availableProviders: providers
        }));
    }
}
```

## 🚀 การใช้งาน

### 1. ทดสอบด้วยไฟล์ `test-account-linking.html`

```bash
# เปิดไฟล์ในเบราว์เซอร์
open test-account-linking.html
```

### 2. ขั้นตอนการทดสอบ

1. **เข้าสู่ระบบด้วย Google**
   - กดปุ่ม "🔐 Sign in with Google"
   - เลือกบัญชี Google ที่ต้องการทดสอบ

2. **ออกจากระบบ**
   - กดปุ่ม "🚪 Sign Out"

3. **พยายามเข้าสู่ระบบด้วย LINE**
   - กดปุ่ม "🟩 Sign in with LINE"
   - ใช้ email เดียวกับ Google account

4. **ระบบจะแสดง Account Linking UI**
   - ข้อความแจ้งเตือนว่ามีบัญชีซ้ำ
   - ปุ่ม "🔗 Link LINE Account to Existing Account"
   - ปุ่ม "🔐 Sign in with Google First" (ถ้าเป็น Google provider)

5. **ทำการเชื่อมต่อบัญชี**
   - กดปุ่ม "🔐 Sign in with Google First"
   - ระบบจะเข้าสู่ระบบด้วย Google อีกครั้ง
   - จากนั้นจะเชื่อมต่อ LINE account โดยอัตโนมัติ

## 🔧 ฟังก์ชันหลัก

### 1. `handleGoogleSignInForLinking(lineLoginData)`

ฟังก์ชันสำหรับเข้าสู่ระบบด้วย Google เพื่อการเชื่อมต่อบัญชี

```javascript
async function handleGoogleSignInForLinking(lineLoginData) {
    // ตรวจสอบ provider
    const providers = await fetchSignInMethodsForEmail(auth, lineLoginData.user.email);
    
    // Sign in with Google
    const googleResult = await signInWithPopup(auth, googleProvider);
    
    // ตรวจสอบ email ตรงกัน
    if (googleResult.user.email !== lineLoginData.user.email) {
        throw new Error('Email mismatch');
    }
    
    // ดำเนินการ account linking
    return await handleAccountLinking(lineLoginData);
}
```

### 2. `handleAccountLinking(lineLoginData)`

ฟังก์ชันสำหรับเชื่อมต่อบัญชี LINE กับบัญชีเดิม

```javascript
async function handleAccountLinking(lineLoginData) {
    // ตรวจสอบผู้ใช้ปัจจุบัน
    const currentUser = auth.currentUser;
    
    // ขอ custom token จาก backend
    const linkResponse = await fetch('/api/auth/line/link-account', {
        method: 'POST',
        body: JSON.stringify({
            currentUserUid: currentUser.uid,
            lineUser: lineData.user,
            lineProfile: lineData.lineProfile
        })
    });
    
    // Link credential
    const lineCredential = OAuthProvider.credential('oidc.line', lineData.customToken);
    await currentUser.linkWithCredential(lineCredential);
}
```

### 3. `checkPendingLineLink()`

ฟังก์ชันสำหรับตรวจสอบและจัดการ pending LINE link

```javascript
async function checkPendingLineLink() {
    const pendingLineLink = localStorage.getItem('pendingLineLink');
    if (pendingLineLink) {
        const lineData = JSON.parse(pendingLineLink);
        
        // แสดง UI สำหรับ account linking
        showAccountLinkingUI(lineData.availableProviders, lineData);
    }
}
```

## 📁 ไฟล์ที่เกี่ยวข้อง

- `app-simple.js` - ไฟล์หลักที่มีฟังก์ชัน account linking
- `test-account-linking.html` - หน้าเว็บสำหรับทดสอบ
- `server.js` - Backend server สำหรับ LINE authentication
- `ACCOUNT_LINKING_GUIDE.md` - คู่มือนี้

## 🔍 การ Debug

### 1. ตรวจสอบ Console Logs

```javascript
// เปิด Developer Tools > Console
// ดู logs ที่ขึ้นต้นด้วย:
// 🔄 - กำลังดำเนินการ
// ✅ - สำเร็จ
// ❌ - ผิดพลาด
// ⚠️ - คำเตือน
```

### 2. ตรวจสอบ Local Storage

```javascript
// ใน Console พิมพ์:
localStorage.getItem('pendingLineLink')
localStorage.getItem('lineUser')
localStorage.getItem('lineCustomToken')
```

### 3. ตรวจสอบ Network Tab

ดู API calls ไปยัง:
- `http://localhost:3000/api/auth/line/auth-url`
- `http://localhost:3000/api/auth/line/login`
- `http://localhost:3000/api/auth/line/link-account`

## 🐛 ปัญหาที่พบบ่อย

### 1. "Backend is not available"

**สาเหตุ**: Backend server ไม่ได้รัน

**วิธีแก้**:
```bash
node server.js
```

### 2. "Popup blocked by browser"

**สาเหตุ**: Browser ปิดกั้น popup

**วิธีแก้**: อนุญาต popup สำหรับเว็บไซต์นี้

### 3. "Email mismatch"

**สาเหตุ**: Email ของ Google และ LINE ไม่ตรงกัน

**วิธีแก้**: ตรวจสอบว่าใช้ email เดียวกัน

### 4. "Firebase credential linking failed"

**สาเหตุ**: การสร้าง LINE credential ไม่ถูกต้อง

**วิธีแก้**: ตรวจสอบ custom token และ provider ID

## 📝 หมายเหตุสำคัญ

1. **Backend Required**: LINE login ต้องการ backend server ที่รันอยู่
2. **Email Verification**: ระบบจะตรวจสอบว่า email ตรงกันก่อนทำ account linking
3. **Provider Detection**: ใช้ `fetchSignInMethodsForEmail()` เพื่อตรวจสอบ provider ที่ใช้ได้
4. **Local Storage**: ข้อมูล pending link จะถูกเก็บใน localStorage และล้างเมื่อ logout
5. **Error Handling**: ทุกขั้นตอนมีการจัดการ error และแสดงข้อความที่เหมาะสม

## 🎉 ผลลัพธ์ที่คาดหวัง

หลังจากทำ account linking สำเร็จ:
- ผู้ใช้จะสามารถเข้าสู่ระบบด้วยทั้ง Google และ LINE
- ข้อมูลผู้ใช้จะถูกรวมกันในบัญชีเดียว
- Backend จะเก็บข้อมูลการเชื่อมต่อบัญชี
- Firebase จะมี provider หลายตัวสำหรับบัญชีเดียวกัน 