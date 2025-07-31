#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('�� Deploying Firebase Functions...');
console.log('Project: basic-firebase-80425');
console.log('Region: asia-southeast1');
console.log('');

try {
    // Check if we're in the right directory
    if (!fs.existsSync('functions/index.js')) {
        throw new Error('functions/index.js not found. Please run this script from the project root.');
    }

    // Check Firebase project
    console.log('📋 Checking Firebase project...');
    const projectCheck = execSync('firebase use', { encoding: 'utf8' });
    console.log(projectCheck);

    // Deploy functions
    console.log('📦 Deploying functions...');
    const deployOutput = execSync('firebase deploy --only functions', { 
        encoding: 'utf8',
        stdio: 'inherit'
    });

    console.log('');
    console.log('✅ Functions deployed successfully!');
    console.log('');
    console.log('🔗 Function URLs:');
    console.log('- LINE Auth URL: https://asia-southeast1-basic-firebase-80425.cloudfunctions.net/getLineAuthUrlHttp');
    console.log('- LINE Callback: https://asia-southeast1-basic-firebase-80425.cloudfunctions.net/processLineCallbackHttp');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Test LINE login in your application');
    console.log('2. Check Firebase Console for function logs');
    console.log('3. If you still get IAM errors, follow the guide in IAM_PERMISSIONS_FIX.md');

} catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure you have Firebase CLI installed: npm install -g firebase-tools');
    console.log('2. Make sure you\'re logged in: firebase login');
    console.log('3. Check your Firebase project: firebase use');
    console.log('4. If IAM errors persist, check IAM_PERMISSIONS_FIX.md');
    process.exit(1);
} 