// deploy.js
// Script สำหรับ Deploy Cloud Function

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 เริ่มการ Deploy Cloud Function...');
console.log('=====================================');

// ฟังก์ชันรันคำสั่ง
function runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        console.log(`\n📋 รันคำสั่ง: ${command} ${args.join(' ')}`);
        console.log(`📁 Directory: ${cwd}`);
        
        const child = spawn(command, args, {
            cwd: cwd,
            stdio: 'inherit',
            shell: true
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ คำสั่งสำเร็จ (exit code: ${code})`);
                resolve();
            } else {
                console.log(`❌ คำสั่งล้มเหลว (exit code: ${code})`);
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });
        
        child.on('error', (error) => {
            console.log(`❌ ไม่สามารถรันคำสั่งได้: ${error.message}`);
            reject(error);
        });
    });
}

// ฟังก์ชันหลัก
async function deployCloudFunction() {
    try {
        // 1. ตรวจสอบ Firebase project
        console.log('\n🔍 ตรวจสอบ Firebase project...');
        await runCommand('firebase', ['use'], process.cwd());
        
        // 2. ตรวจสอบ syntax ของ Cloud Function
        console.log('\n🔍 ตรวจสอบ syntax ของ Cloud Function...');
        const functionsDir = path.join(process.cwd(), 'functions');
        await runCommand('node', ['-c', 'index.js'], functionsDir);
        console.log('✅ Syntax ถูกต้อง');
        
        // 3. ตรวจสอบ dependencies
        console.log('\n📦 ตรวจสอบ dependencies...');
        await runCommand('npm', ['list'], functionsDir);
        
        // 4. Deploy Cloud Function
        console.log('\n🚀 เริ่ม Deploy Cloud Function...');
        console.log('💡 กระบวนการนี้อาจใช้เวลาสักครู่...');
        await runCommand('firebase', ['deploy', '--only', 'functions'], process.cwd());
        
        // 5. แสดงผลลัพธ์
        console.log('\n🎉 Deploy สำเร็จ!');
        console.log('\n📋 ขั้นตอนถัดไป:');
        console.log('1. เปิด Firebase Console: https://console.firebase.google.com');
        console.log('2. เลือก project: daring-calling-827');
        console.log('3. ไปที่ Functions');
        console.log('4. ตรวจสอบฟังก์ชัน signInWithLine');
        console.log('5. ทดสอบ Cloud Function');
        
        console.log('\n🌐 URL ของ Cloud Function:');
        console.log('https://asia-southeast1-daring-calling-827.cloudfunctions.net/signInWithLine');
        
        console.log('\n🧪 การทดสอบ:');
        console.log('1. เปิดไฟล์ index.html ในเบราว์เซอร์');
        console.log('2. คลิกปุ่ม "🟩 Sign in with LINE"');
        console.log('3. ตรวจสอบ Console');
        
    } catch (error) {
        console.log('\n❌ เกิดข้อผิดพลาดในการ Deploy:');
        console.log('   ', error.message);
        
        console.log('\n💡 แนะนำการแก้ไขปัญหา:');
        console.log('1. ตรวจสอบว่า Firebase CLI ติดตั้งแล้ว');
        console.log('2. ตรวจสอบว่า login Firebase แล้ว: firebase login');
        console.log('3. ตรวจสอบ project: firebase use daring-calling-827');
        console.log('4. ตรวจสอบ syntax: node -c functions/index.js');
        console.log('5. ลองรันคำสั่งด้วยตนเอง: firebase deploy --only functions');
    }
}

// รันการ Deploy
deployCloudFunction().catch(console.error); 