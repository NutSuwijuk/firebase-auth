# 🔥 Firebase Authentication Flutter App

แอปพลิเคชัน Flutter สำหรับการเข้าสู่ระบบด้วย Firebase Authentication พร้อมรองรับ Google Sign In, Apple Sign In และ LINE Login

## 📱 คุณสมบัติ

- ✅ **Google Sign In** - เข้าสู่ระบบด้วยบัญชี Google
- ✅ **Apple Sign In** - เข้าสู่ระบบด้วย Apple ID (iOS เท่านั้น)
- ✅ **LINE Login** - เข้าสู่ระบบด้วยบัญชี LINE
- ✅ **Firebase Integration** - เชื่อมต่อกับ Firebase Authentication
- ✅ **Modern UI** - หน้าจอที่สวยงามและใช้งานง่าย
- ✅ **Error Handling** - จัดการข้อผิดพลาดอย่างเหมาะสม
- ✅ **Multi-platform** - รองรับทั้ง Android และ iOS

## 🚀 การติดตั้ง

### 1. ความต้องการของระบบ

- Flutter SDK 3.10.0 หรือใหม่กว่า
- Dart SDK 3.0.0 หรือใหม่กว่า
- Android Studio / VS Code
- Firebase Project
- Google Cloud Project (สำหรับ Google Sign In)
- Apple Developer Account (สำหรับ Apple Sign In)
- LINE Developers Account (สำหรับ LINE Login)

### 2. ติดตั้ง Dependencies

```bash
# Clone โปรเจค
git clone <your-repo-url>
cd firebase_auth_flutter

# ติดตั้ง dependencies
flutter pub get
```

### 3. การตั้งค่า Firebase

#### 3.1 สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. สร้างโปรเจคใหม่หรือเลือกโปรเจคที่มีอยู่
3. เปิดใช้งาน Authentication
4. เปิดใช้งาน Sign-in methods:
   - Google
   - Apple
   - LINE (Custom)

#### 3.2 ดาวน์โหลดไฟล์การตั้งค่า

- **Android**: ดาวน์โหลด `google-services.json` และวางใน `android/app/`
- **iOS**: ดาวน์โหลด `GoogleService-Info.plist` และวางใน `ios/Runner/`

#### 3.3 ตั้งค่า Cloud Functions

```bash
# ติดตั้ง Firebase CLI
npm install -g firebase-tools

# Login เข้า Firebase
firebase login

# ตั้งค่าโปรเจค
firebase use <your-project-id>

# Deploy Cloud Functions
firebase deploy --only functions
```

### 4. การตั้งค่า Platform-specific

#### Android

1. เปิดไฟล์ `android/app/build.gradle`
2. เปลี่ยน `applicationId` เป็นของโปรเจคคุณ
3. ตรวจสอบว่า `minSdkVersion` เป็น 21 หรือมากกว่า

#### iOS

1. เปิดไฟล์ `ios/Runner/Info.plist`
2. เปลี่ยน `REVERSED_CLIENT_ID` และ `LINE_CHANNEL_ID`
3. เพิ่ม Bundle ID ใน Apple Developer Console

## 🔧 การใช้งาน

### 1. รันแอป

```bash
# รันบน Android
flutter run

# รันบน iOS
flutter run -d ios

# รันบน Web
flutter run -d chrome
```

### 2. การทดสอบ

1. เปิดแอป
2. เลือกวิธีการเข้าสู่ระบบที่ต้องการ
3. ทำตามขั้นตอนการยืนยันตัวตน
4. ตรวจสอบข้อมูลผู้ใช้ที่แสดง

## 📁 โครงสร้างไฟล์

```
lib/
├── main.dart                 # ไฟล์หลักของแอป
├── screens/                  # หน้าจอต่างๆ
├── services/                 # บริการต่างๆ
├── models/                   # โมเดลข้อมูล
└── utils/                    # ฟังก์ชันช่วยเหลือ

android/
├── app/
│   ├── build.gradle         # การตั้งค่า Android
│   └── google-services.json # Firebase config

ios/
├── Runner/
│   ├── Info.plist           # การตั้งค่า iOS
│   └── GoogleService-Info.plist # Firebase config
```

## 🔐 การตั้งค่าความปลอดภัย

### 1. Google Sign In

- เปิดใช้งานใน Firebase Console
- เพิ่ม SHA-1 fingerprint ใน Google Cloud Console
- ตั้งค่า OAuth consent screen

### 2. Apple Sign In

- เปิดใช้งานใน Firebase Console
- ตั้งค่าใน Apple Developer Console
- เพิ่ม domain ใน authorized domains

### 3. LINE Login

- สร้าง LINE Channel
- ตั้งค่า Callback URL
- เปิดใช้งานใน Firebase Console

## 🐛 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. Google Sign In ไม่ทำงาน

```bash
# ตรวจสอบ SHA-1 fingerprint
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

#### 2. Apple Sign In ไม่ทำงาน

- ตรวจสอบว่าเปิดใช้งานใน Firebase Console
- ตรวจสอบ Bundle ID ใน Apple Developer Console
- ตรวจสอบการตั้งค่า URL schemes

#### 3. LINE Login ไม่ทำงาน

- ตรวจสอบ Cloud Functions deployment
- ตรวจสอบ Callback URL
- ตรวจสอบ Channel ID และ Secret

### Debug Mode

```dart
// เพิ่ม debug prints
print('Debug: ${variable}');

// ใช้ Flutter Inspector
flutter run --debug
```

## 📚 ทรัพยากรเพิ่มเติม

- [Firebase Flutter Documentation](https://firebase.flutter.dev/)
- [Google Sign In Flutter](https://pub.dev/packages/google_sign_in)
- [Apple Sign In Flutter](https://pub.dev/packages/sign_in_with_apple)
- [LINE Login Documentation](https://developers.line.biz/en/docs/line-login/)

## 🤝 การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. ตรวจสอบ [Issues](../../issues) ใน GitHub
2. สร้าง Issue ใหม่พร้อมรายละเอียด
3. ติดต่อทีมพัฒนา

## 📄 License

โปรเจคนี้อยู่ภายใต้ MIT License - ดูรายละเอียดใน [LICENSE](LICENSE) file

---

**หมายเหตุ**: โปรเจคนี้เป็นตัวอย่างการใช้งาน Firebase Authentication ใน Flutter กรุณาปรับแต่งตามความต้องการของโปรเจคคุณ 