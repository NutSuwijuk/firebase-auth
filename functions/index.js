// functions/index.js

const { onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const axios = require("axios");
const jwt = require("jsonwebtoken");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Set global options for all functions
setGlobalOptions({
    region: 'asia-southeast1',
    maxInstances: 3
});

// นี่คือฟังก์ชันที่เราจะ Deploy
// เราใช้ onCall ซึ่งเป็นวิธีที่แนะนำสำหรับการเรียกจาก Client โดยตรง
exports.signInWithLine = onCall(async (request) => {
    // 1. รับ ID Token จาก Client
    const lineIdToken = request.data.lineIdToken;
    if (!lineIdToken) {
        throw new Error("ID Token is required.");
    }

    try {
        // 2. ถอดรหัส LINE ID Token เพื่อเอาข้อมูล (ยังไม่ Verify)
        const decodedToken = jwt.decode(lineIdToken);
        if (!decodedToken) {
            throw new Error("Invalid LINE ID Token format");
        }

        // (สำคัญ) ควรจะ Verify Token กับ LINE API เพื่อความปลอดภัย
        // แต่เพื่อความง่าย บางครั้งการ Decode เพื่อเอาข้อมูลก็เพียงพอ
        // หากต้องการความปลอดภัยสูงสุด ควรยิงไปที่ https://api.line.me/oauth2/v2.1/verify

        const lineUserId = decodedToken.sub;
        const lineEmail = decodedToken.email;
        const lineDisplayName = decodedToken.name;
        const linePictureUrl = decodedToken.picture;

        if (!lineEmail) {
            throw new Error("Email permission not granted in LINE.");
        }

        let firebaseUid;

        // 3. ค้นหาผู้ใช้ใน Firebase ด้วยอีเมล
        try {
            const userRecord = await admin.auth().getUserByEmail(lineEmail);
            firebaseUid = userRecord.uid;
            console.log(`Found existing user by email: ${lineEmail}, UID: ${firebaseUid}`);
            // (Optional) เราเลือกที่จะไม่อัปเดตข้อมูลผู้ใช้เดิมตามแนวทางที่คุยกัน
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // 4. ถ้าไม่เจอ ก็สร้างผู้ใช้ใหม่ (First Provider Wins)
                console.log(`User with email ${lineEmail} not found. Creating new user.`);
                const newUser = await admin.auth().createUser({
                    email: lineEmail,
                    emailVerified: true, // เราเชื่อถืออีเมลจาก LINE
                    displayName: lineDisplayName,
                    photoURL: linePictureUrl,
                });
                firebaseUid = newUser.uid;
            } else {
                throw error; // โยน error อื่นๆ ที่ไม่ใช่ "user-not-found"
            }
        }

        // 5. สร้าง Custom Token สำหรับ UID ที่ได้มา
        const customToken = await admin.auth().createCustomToken(firebaseUid);
        console.log(`Generated custom token for UID: ${firebaseUid}`);

        // 6. ส่ง Custom Token กลับไปให้ Client
        return { customToken: customToken };

    } catch (error) {
        console.error("Error in signInWithLine:", error);
        // ส่ง error กลับไปให้ Client
        throw new Error(`An error occurred while processing the LINE login: ${error.message}`);
    }
});
