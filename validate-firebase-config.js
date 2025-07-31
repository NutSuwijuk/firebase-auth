#!/usr/bin/env node

/**
 * Firebase Config Validator
 * ตรวจสอบ Firebase config ว่าถูกต้องหรือไม่
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Firebase Config Validator');
console.log('============================\n');

// Check if index.html exists
const indexPath = path.join(__dirname, 'index.html');
if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found');
    process.exit(1);
}

// Read index.html
const htmlContent = fs.readFileSync(indexPath, 'utf8');

// Extract Firebase config
const firebaseConfigMatch = htmlContent.match(/const firebaseConfig = \{[\s\S]*?\};/);
if (!firebaseConfigMatch) {
    console.error('❌ ไม่พบ Firebase config ใน index.html');
    process.exit(1);
}

const configText = firebaseConfigMatch[0];
console.log('📋 พบ Firebase config:');
console.log(configText);
console.log('');

// Check for placeholder values
const placeholderPatterns = [
    { pattern: /AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/, name: 'API Key (placeholder)' },
    { pattern: /123456789012/, name: 'Messaging Sender ID (placeholder)' },
    { pattern: /abcdefghijklmnop/, name: 'App ID (placeholder)' }
];

let hasPlaceholders = false;
console.log('🔍 ตรวจสอบ placeholder values:');

placeholderPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(configText)) {
        console.log(`❌ ${name} - พบ placeholder value`);
        hasPlaceholders = true;
    } else {
        console.log(`✅ ${name} - ดูเหมือนจะเป็นค่าจริง`);
    }
});

// Check for valid patterns
console.log('\n🔍 ตรวจสอบรูปแบบข้อมูล:');

// API Key pattern (should start with AIzaSy and be 39 characters)
const apiKeyMatch = configText.match(/apiKey:\s*"([^"]+)"/);
if (apiKeyMatch) {
    const apiKey = apiKeyMatch[1];
    if (apiKey.startsWith('AIzaSy') && apiKey.length === 39) {
        console.log('✅ API Key - รูปแบบถูกต้อง');
    } else {
        console.log('❌ API Key - รูปแบบไม่ถูกต้อง (ควรขึ้นต้นด้วย AIzaSy และยาว 39 ตัวอักษร)');
        hasPlaceholders = true;
    }
}

// Project ID pattern
const projectIdMatch = configText.match(/projectId:\s*"([^"]+)"/);
if (projectIdMatch) {
    const projectId = projectIdMatch[1];
    if (projectId.includes('your-project') || projectId.includes('basic-firebase')) {
        console.log('⚠️  Project ID - อาจเป็น placeholder');
        hasPlaceholders = true;
    } else {
        console.log('✅ Project ID - ดูเหมือนจะเป็นค่าจริง');
    }
}

// Auth Domain pattern
const authDomainMatch = configText.match(/authDomain:\s*"([^"]+)"/);
if (authDomainMatch) {
    const authDomain = authDomainMatch[1];
    if (authDomain.includes('your-project') || authDomain.includes('basic-firebase')) {
        console.log('⚠️  Auth Domain - อาจเป็น placeholder');
        hasPlaceholders = true;
    } else {
        console.log('✅ Auth Domain - ดูเหมือนจะเป็นค่าจริง');
    }
}

// Summary
console.log('\n📋 สรุปการตรวจสอบ:');
console.log('==================');

if (hasPlaceholders) {
    console.log('❌ พบปัญหา:');
    console.log('   - Firebase config ยังใช้ placeholder values');
    console.log('   - ต้องแทนที่ด้วยค่าจริงจาก Firebase Console');
    console.log('');
    console.log('🔧 วิธีแก้ไข:');
    console.log('   1. ไปที่ Firebase Console > Project Settings > General');
    console.log('   2. คัดลอก Firebase config จาก Web app');
    console.log('   3. แทนที่ใน index.html');
    console.log('   4. เปิดใช้งาน Authentication > Sign-in method > Google');
    console.log('');
    console.log('📖 ดูคู่มือเพิ่มเติมใน: FIREBASE_CONFIG_SETUP.md');
} else {
    console.log('✅ Firebase config ดูถูกต้อง');
    console.log('📝 ตรวจสอบการตั้งค่าใน Firebase Console:');
    console.log('   - Authentication > Sign-in method > Google (เปิดใช้งาน)');
    console.log('   - Authentication > Settings > Authorized domains');
    console.log('');
    console.log('🧪 ทดสอบ: เปิด index.html และลองคลิกปุ่ม Google login');
}

console.log('\n💡 เคล็ดลับ:');
console.log('- API Key ต้องขึ้นต้นด้วย "AIzaSy"');
console.log('- Project ID ต้องตรงกับโปรเจคใน Firebase Console');
console.log('- Auth Domain ต้องเป็น "your-project-id.firebaseapp.com"');
console.log('- ต้องเปิดใช้งาน Authentication ใน Firebase Console'); 