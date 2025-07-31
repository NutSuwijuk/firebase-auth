#!/usr/bin/env node

/**
 * Firebase Setup Checker
 * ตรวจสอบการตั้งค่า Firebase สำหรับ Google และ Apple login
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Firebase Setup Checker');
console.log('========================\n');

// Check if index.html exists
const indexPath = path.join(__dirname, 'index.html');
if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found');
    process.exit(1);
}

// Read index.html
const htmlContent = fs.readFileSync(indexPath, 'utf8');

// Check Firebase config
console.log('1. ตรวจสอบ Firebase Configuration...');
const firebaseConfigMatch = htmlContent.match(/const firebaseConfig = \{[\s\S]*?\};/);
if (firebaseConfigMatch) {
    const config = firebaseConfigMatch[0];
    
    // Check for placeholder values
    const hasPlaceholders = config.includes('AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') || 
                           config.includes('123456789012') ||
                           config.includes('abcdefghijklmnop');
    
    if (hasPlaceholders) {
        console.log('⚠️  พบ placeholder values ใน Firebase config');
        console.log('   กรุณาแทนที่ด้วยค่า Firebase config จริงจาก Firebase Console');
        console.log('   ไปที่: Project Settings > General > Your apps');
    } else {
        console.log('✅ Firebase config ดูถูกต้อง');
    }
} else {
    console.log('❌ ไม่พบ Firebase config ใน index.html');
}

// Check for required imports
console.log('\n2. ตรวจสอบ Firebase Imports...');
const requiredImports = [
    'GoogleAuthProvider',
    'OAuthProvider',
    'signInWithPopup'
];

let allImportsFound = true;
requiredImports.forEach(importName => {
    if (htmlContent.includes(importName)) {
        console.log(`✅ ${importName} - พบ`);
    } else {
        console.log(`❌ ${importName} - ไม่พบ`);
        allImportsFound = false;
    }
});

// Check for event listeners
console.log('\n3. ตรวจสอบ Event Listeners...');
const eventListeners = [
    'googleLoginBtn',
    'appleLoginBtn'
];

eventListeners.forEach(btnId => {
    if (htmlContent.includes(btnId)) {
        console.log(`✅ ${btnId} - พบ`);
    } else {
        console.log(`❌ ${btnId} - ไม่พบ`);
    }
});

// Check for providers initialization
console.log('\n4. ตรวจสอบ Provider Initialization...');
if (htmlContent.includes('new GoogleAuthProvider()')) {
    console.log('✅ GoogleAuthProvider - ถูก initialize');
} else {
    console.log('❌ GoogleAuthProvider - ไม่ถูก initialize');
}

if (htmlContent.includes('new OAuthProvider(\'apple.com\')')) {
    console.log('✅ Apple OAuthProvider - ถูก initialize');
} else {
    console.log('❌ Apple OAuthProvider - ไม่ถูก initialize');
}

// Summary
console.log('\n📋 สรุปการตรวจสอบ:');
console.log('========================');

if (hasPlaceholders) {
    console.log('⚠️  ต้องแก้ไข:');
    console.log('   1. แทนที่ Firebase config ด้วยค่าจริง');
    console.log('   2. เปิดใช้งาน Google และ Apple providers ใน Firebase Console');
    console.log('   3. เพิ่ม authorized domains');
} else if (allImportsFound) {
    console.log('✅ โค้ดดูพร้อมใช้งาน');
    console.log('📝 ตรวจสอบการตั้งค่าใน Firebase Console:');
    console.log('   - Authentication > Sign-in method > Google (เปิดใช้งาน)');
    console.log('   - Authentication > Sign-in method > Apple (เปิดใช้งาน)');
    console.log('   - Authentication > Settings > Authorized domains');
} else {
    console.log('❌ มีปัญหาที่ต้องแก้ไขในโค้ด');
}

console.log('\n📖 ดูคู่มือการตั้งค่าเพิ่มเติมใน: FIREBASE_SETUP_GUIDE.md'); 