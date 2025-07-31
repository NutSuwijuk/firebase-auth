# Firebase Functions

Cloud Functions สำหรับ Firebase Auth project

## Functions ที่มีอยู่

### HTTP Functions
- `getLineAuthUrlHttp` - สร้าง LINE Authorization URL
- `processLineCallbackHttp` - ประมวลผล LINE OAuth callback

### LINE OAuth Integration
- LINE Login integration สำหรับ Firebase Auth
- สร้างหรืออัปเดต Firebase user จาก LINE profile
- สร้าง custom token สำหรับ Firebase authentication

## การใช้งาน

### Local Development
```bash
# Install dependencies
npm install

# Run emulator
npm run serve

# หรือ
firebase emulators:start --only functions
```

### Deploy
```bash
# Deploy functions
npm run deploy

# หรือ
firebase deploy --only functions
```

### View Logs
```bash
npm run logs

# หรือ
firebase functions:log
```

## การเรียกใช้ Functions

### LINE Authorization URL
```javascript
// สร้าง LINE Authorization URL
fetch('https://your-region-your-project.cloudfunctions.net/getLineAuthUrlHttp')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.href = data.authUrl;
    }
  });
```

### LINE Callback Processing
```javascript
// ประมวลผล LINE callback
fetch('https://your-region-your-project.cloudfunctions.net/processLineCallbackHttp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: 'authorization_code_from_line',
    state: 'state_parameter'
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    // ใช้ customToken เพื่อล็อกอิน Firebase
    firebase.auth().signInWithCustomToken(data.customToken);
  }
});
```

## Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ functions สำหรับ environment variables:

```env
# ตัวอย่าง
SENDGRID_API_KEY=your_sendgrid_api_key
MAILGUN_API_KEY=your_mailgun_api_key
``` 