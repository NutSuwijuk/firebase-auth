// test-functions.js
// สคริปต์สำหรับทดสอบ Firebase Functions และดู Performance Metrics

const axios = require('axios');

// การตั้งค่า
const BASE_URL = 'http://localhost:5001/daring-calling-827/asia-southeast1';

// ฟังก์ชันสำหรับทดสอบ getLineAuthUrlHttp
async function testGetLineAuthUrl() {
  console.log('\n=== ทดสอบ getLineAuthUrlHttp ===');
  console.log('เวลาเริ่มต้น:', new Date().toLocaleString('th-TH'));
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post(`${BASE_URL}/getLineAuthUrlHttp`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ สำเร็จ!');
    console.log('เวลาที่ใช้ในการเรียก API:', duration + 'ms');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

// ฟังก์ชันสำหรับทดสอบ processLineCallbackHttp
async function testProcessLineCallback() {
  console.log('\n=== ทดสอบ processLineCallbackHttp ===');
  console.log('เวลาเริ่มต้น:', new Date().toLocaleString('th-TH'));
  
  try {
    const startTime = Date.now();
    
    // ข้อมูลทดสอบ (จะทำให้เกิด error เพราะเป็นข้อมูลปลอม)
    const testData = {
      code: 'test_authorization_code_123',
      state: 'test_state_456'
    };
    
    const response = await axios.post(`${BASE_URL}/processLineCallbackHttp`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ สำเร็จ!');
    console.log('เวลาที่ใช้ในการเรียก API:', duration + 'ms');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด (คาดหวังได้เพราะใช้ข้อมูลปลอม):');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

// ฟังก์ชันสำหรับดู Performance Stats
async function testGetPerformanceStats() {
  console.log('\n=== ทดสอบ getPerformanceStatsHttp ===');
  console.log('เวลาเริ่มต้น:', new Date().toLocaleString('th-TH'));
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post(`${BASE_URL}/getPerformanceStatsHttp`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ สำเร็จ!');
    console.log('เวลาที่ใช้ในการเรียก API:', duration + 'ms');
    console.log('Response Status:', response.status);
    console.log('Performance Stats:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

// ฟังก์ชันสำหรับ Reset Performance Metrics
async function testResetPerformanceMetrics() {
  console.log('\n=== ทดสอบ resetPerformanceMetricsHttp ===');
  console.log('เวลาเริ่มต้น:', new Date().toLocaleString('th-TH'));
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post(`${BASE_URL}/resetPerformanceMetricsHttp`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ สำเร็จ!');
    console.log('เวลาที่ใช้ในการเรียก API:', duration + 'ms');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

// ฟังก์ชันสำหรับทดสอบหลายครั้งเพื่อดู performance metrics
async function stressTest() {
  console.log('\n=== Stress Test - ทดสอบหลายครั้ง ===');
  console.log('เวลาเริ่มต้น:', new Date().toLocaleString('th-TH'));
  
  const iterations = 5;
  const results = [];
  
  for (let i = 1; i <= iterations; i++) {
    console.log(`\n--- การทดสอบครั้งที่ ${i}/${iterations} ---`);
    
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${BASE_URL}/getLineAuthUrlHttp`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      results.push({
        iteration: i,
        success: true,
        duration: duration,
        status: response.status
      });
      
      console.log(`✅ สำเร็จ - เวลา: ${duration}ms`);
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      results.push({
        iteration: i,
        success: false,
        duration: duration,
        error: error.message
      });
      
      console.log(`❌ ล้มเหลว - เวลา: ${duration}ms - Error: ${error.message}`);
    }
    
    // รอสักครู่ระหว่างการทดสอบ
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // สรุปผลการทดสอบ
  console.log('\n=== สรุปผลการทดสอบ ===');
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  console.log(`จำนวนการทดสอบทั้งหมด: ${results.length}`);
  console.log(`สำเร็จ: ${successfulTests.length}`);
  console.log(`ล้มเหลว: ${failedTests.length}`);
  
  if (successfulTests.length > 0) {
    const avgDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length;
    const minDuration = Math.min(...successfulTests.map(r => r.duration));
    const maxDuration = Math.max(...successfulTests.map(r => r.duration));
    
    console.log(`\nสถิติเวลา (เฉพาะที่สำเร็จ):`);
    console.log(`- เฉลี่ย: ${avgDuration.toFixed(2)}ms`);
    console.log(`- ต่ำสุด: ${minDuration}ms`);
    console.log(`- สูงสุด: ${maxDuration}ms`);
  }
}

// ฟังก์ชันหลัก
async function main() {
  console.log('🚀 เริ่มต้นการทดสอบ Firebase Functions');
  console.log('=====================================');
  console.log('หมายเหตุ: ต้องเริ่มต้น Firebase Emulators ก่อน');
  console.log('คำสั่ง: firebase emulators:start');
  console.log('=====================================');
  
  // รอให้ user ยืนยัน
  console.log('\nกด Enter เพื่อเริ่มการทดสอบ...');
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  // ทดสอบฟังก์ชันต่างๆ
  await testGetLineAuthUrl();
  await testProcessLineCallback();
  await testGetPerformanceStats();
  await stressTest();
  await testResetPerformanceMetrics();
  await testGetPerformanceStats(); // ดู stats หลังจาก reset
  
  console.log('\n🎉 การทดสอบเสร็จสิ้น!');
  console.log('\nหมายเหตุ:');
  console.log('- ดู Performance Metrics ได้จาก console logs ของ emulator');
  console.log('- เปิด Emulator UI ที่ http://localhost:4000 เพื่อดู logs แบบ real-time');
  console.log('- ข้อมูลจะแสดงในรูปแบบ:');
  console.log('  === Performance Metrics for functionName ===');
  console.log('  Total Invocations: X');
  console.log('  Execution Time: XXXms');
  console.log('  Memory Used: ~X.XX MB');
  console.log('  Peak Memory: ~XX.XX MB');
  console.log('  Outbound Networking Size: XXX bytes');
  console.log('  ==============================================');
}

// เริ่มต้นการทำงาน
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testGetLineAuthUrl,
  testProcessLineCallback,
  testGetPerformanceStats,
  testResetPerformanceMetrics,
  stressTest
}; 