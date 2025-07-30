const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Starting cleanup and test process...\n');

// Function to run commands safely
function runCommand(command, description) {
  console.log(`📋 ${description}`);
  try {
    const result = execSync(command, { 
      cwd: path.join(__dirname, 'functions'),
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(`✅ ${description} - SUCCESS`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} - FAILED`);
    console.log(`Error: ${error.message}`);
    return false;
  }
}

// Cleanup steps
console.log('1️⃣ CLEANUP STEPS:');
console.log('==================');

// Remove node_modules and package-lock.json
if (fs.existsSync(path.join(__dirname, 'functions', 'node_modules'))) {
  console.log('🗑️ Removing node_modules...');
  fs.rmSync(path.join(__dirname, 'functions', 'node_modules'), { recursive: true, force: true });
}

if (fs.existsSync(path.join(__dirname, 'functions', 'package-lock.json'))) {
  console.log('🗑️ Removing package-lock.json...');
  fs.unlinkSync(path.join(__dirname, 'functions', 'package-lock.json'));
}

// Install dependencies
console.log('\n2️⃣ INSTALLATION STEPS:');
console.log('======================');

const installSuccess = runCommand('npm install', 'Installing dependencies');

if (!installSuccess) {
  console.log('\n❌ Installation failed. Please check the errors above.');
  process.exit(1);
}

// Lint check
console.log('\n3️⃣ CODE QUALITY CHECKS:');
console.log('========================');

const lintSuccess = runCommand('npm run lint', 'Running ESLint');

if (!lintSuccess) {
  console.log('\n⚠️ Linting issues found. Please fix them before deployment.');
  console.log('You can run: cd functions && npm run lint -- --fix');
} else {
  console.log('\n✅ Code quality check passed!');
}

// Test emulator (optional)
console.log('\n4️⃣ EMULATOR TEST (Optional):');
console.log('============================');
console.log('To test the emulator, run:');
console.log('firebase emulators:start --only functions');
console.log('Then test your functions at: http://localhost:5001');

console.log('\n5️⃣ DEPLOYMENT READY:');
console.log('====================');
console.log('If all checks passed, you can deploy with:');
console.log('firebase deploy --only functions');

console.log('\n🎉 Cleanup and test process completed!'); 