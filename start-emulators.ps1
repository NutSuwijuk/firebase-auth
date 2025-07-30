# start-emulators.ps1
# สคริปต์ PowerShell สำหรับเริ่มต้น Firebase Emulators

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firebase Emulators Starter (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "กำลังเริ่มต้น Firebase Emulators..." -ForegroundColor Yellow
Write-Host ""

Write-Host "ข้อมูลการตั้งค่า:" -ForegroundColor Green
Write-Host "- Functions Emulator: http://localhost:5001" -ForegroundColor White
Write-Host "- Emulator UI: http://localhost:4000" -ForegroundColor White
Write-Host ""

Write-Host "หมายเหตุ:" -ForegroundColor Green
Write-Host "- กด Ctrl+C เพื่อหยุด emulators" -ForegroundColor White
Write-Host "- ดู logs แบบ real-time ได้ที่ Emulator UI" -ForegroundColor White
Write-Host "- ทดสอบ performance metrics ได้จาก console logs" -ForegroundColor White
Write-Host ""

Write-Host "Performance Metrics ที่จะแสดง:" -ForegroundColor Magenta
Write-Host "✓ Invocations (จำนวนการเรียกใช้)" -ForegroundColor White
Write-Host "✓ Execution Time (เวลาในการประมวลผล)" -ForegroundColor White
Write-Host "✓ Memory Usage (การใช้หน่วยความจำ)" -ForegroundColor White
Write-Host "✓ Outbound Networking (ข้อมูลขาออก)" -ForegroundColor White
Write-Host ""

Write-Host "เริ่มต้น Emulators..." -ForegroundColor Yellow
Write-Host ""

try {
    firebase emulators:start
}
catch {
    Write-Host "เกิดข้อผิดพลาดในการเริ่มต้น Emulators:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "ตรวจสอบ:" -ForegroundColor Yellow
    Write-Host "1. ติดตั้ง Firebase CLI แล้วหรือยัง: npm install -g firebase-tools" -ForegroundColor White
    Write-Host "2. Login Firebase แล้วหรือยัง: firebase login" -ForegroundColor White
    Write-Host "3. ตั้งค่าโปรเจคแล้วหรือยัง: firebase use daring-calling-827" -ForegroundColor White
}

Write-Host ""
Write-Host "Emulators หยุดทำงานแล้ว" -ForegroundColor Yellow
Read-Host "กด Enter เพื่อปิดหน้าต่าง..." 