# TODO: Firebase Authentication Setup

## ✅ เสร็จแล้ว
- [x] เพิ่ม Firebase imports สำหรับ Google และ Apple authentication
- [x] เพิ่ม GoogleAuthProvider และ OAuthProvider initialization
- [x] เพิ่ม event listeners สำหรับ Google และ Apple login buttons
- [x] เพิ่ม error handling สำหรับ popup และ authentication errors
- [x] เพิ่ม redirect result handling
- [x] สร้างคู่มือการตั้งค่า Firebase (FIREBASE_SETUP_GUIDE.md)
- [x] สร้าง script ตรวจสอบการตั้งค่า (check-firebase-setup.js)

## 🔧 ต้องทำ
- [ ] แทนที่ Firebase config ด้วยค่าจริงจาก Firebase Console
- [ ] เปิดใช้งาน Google Sign-In ใน Firebase Console
- [ ] เปิดใช้งาน Apple Sign-In ใน Firebase Console
- [ ] เพิ่ม authorized domains ใน Firebase Console
- [ ] ทดสอบ Google login
- [ ] ทดสอบ Apple login

## 📋 ขั้นตอนการตั้งค่า Firebase Console

### 1. Firebase Configuration
- [ ] ไปที่ Firebase Console > Project Settings > General
- [ ] คัดลอก Firebase config จาก Web app
- [ ] แทนที่ใน index.html

### 2. Authentication Providers
- [ ] เปิดใช้งาน Google provider
- [ ] เปิดใช้งาน Apple provider (ต้องมี Apple Developer Account)
- [ ] ตั้งค่า authorized domains

### 3. Apple Developer Console (สำหรับ Apple Sign-In)
- [ ] สร้าง Apple Services ID
- [ ] สร้าง Private Key
- [ ] ตั้งค่า Return URLs

## 🧪 การทดสอบ
- [ ] ทดสอบ Google login ใน localhost
- [ ] ทดสอบ Apple login ใน localhost
- [ ] ตรวจสอบ error handling
- [ ] ตรวจสอบ user information display

## 📝 หมายเหตุ
- Google login ควรทำงานได้ทันทีหลังจากตั้งค่า Firebase Console
- Apple login ต้องมีการตั้งค่าเพิ่มเติมใน Apple Developer Console
- LINE login ยังคงใช้ custom implementation ผ่าน Cloud Functions 