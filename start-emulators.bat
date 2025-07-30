@echo off
echo ========================================
echo Firebase Emulators Starter
echo ========================================
echo.

echo กำลังเริ่มต้น Firebase Emulators...
echo.

echo ข้อมูลการตั้งค่า:
echo - Functions Emulator: http://localhost:5001
echo - Emulator UI: http://localhost:4000
echo.

echo หมายเหตุ:
echo - กด Ctrl+C เพื่อหยุด emulators
echo - ดู logs แบบ real-time ได้ที่ Emulator UI
echo - ทดสอบ performance metrics ได้จาก console logs
echo.

firebase emulators:start

echo.
echo Emulators หยุดทำงานแล้ว
pause 