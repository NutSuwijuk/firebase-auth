#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Firebase Cloud Functions for LINE Login...\n');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.error('❌ Firebase CLI is not installed. Please install it first:');
  console.error('npm install -g firebase-tools');
  process.exit(1);
}

// Check if user is logged in
try {
  execSync('firebase projects:list', { stdio: 'pipe' });
  console.log('✅ Firebase user is logged in');
} catch (error) {
  console.error('❌ Please login to Firebase first:');
  console.error('firebase login');
  process.exit(1);
}

// Check if .env file exists
const envPath = path.join(__dirname, 'functions', '.env');
if (!fs.existsSync(envPath)) {
  console.warn('⚠️  .env file not found in functions directory');
  console.log('📝 Creating .env file from template...');
  
  const envExamplePath = path.join(__dirname, 'functions', 'env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from template');
    console.log('📝 Please edit functions/.env with your actual LINE configuration');
  } else {
    console.error('❌ env.example file not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file found');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { cwd: path.join(__dirname, 'functions'), stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

// Deploy functions
console.log('\n🚀 Deploying Cloud Functions...');
try {
  execSync('firebase deploy --only functions', { stdio: 'inherit' });
  console.log('\n✅ Cloud Functions deployed successfully!');
} catch (error) {
  console.error('\n❌ Failed to deploy Cloud Functions');
  console.error('Check the error messages above for details');
  process.exit(1);
}

console.log('\n🎉 Deployment complete!');
console.log('\n📋 Next steps:');
console.log('1. Test LINE login in your web app');
console.log('2. Check Firebase Functions logs if needed: firebase functions:log');
console.log('3. Monitor usage in Firebase Console');

// Optional: Deploy web app as well
const deployWeb = process.argv.includes('--web');
if (deployWeb) {
  console.log('\n🌐 Deploying web app...');
  try {
    execSync('firebase deploy --only hosting', { stdio: 'inherit' });
    console.log('✅ Web app deployed successfully!');
  } catch (error) {
    console.error('❌ Failed to deploy web app');
  }
} 