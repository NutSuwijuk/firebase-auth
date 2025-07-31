#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Fixing IAM Permissions for Firebase Functions...');
console.log('Project: basic-firebase-80425');
console.log('');

try {
    // Get the service account email for the functions
    console.log('📋 Getting service account email...');
    const serviceAccountEmail = execSync(
        'gcloud functions describe getLineAuthUrlHttp --region=asia-southeast1 --format="value(serviceAccountEmail)"',
        { encoding: 'utf8' }
    ).trim();
    
    console.log(`Service Account: ${serviceAccountEmail}`);
    console.log('');

    // Add Firebase Admin role
    console.log('🔑 Adding Firebase Admin role...');
    execSync(
        `gcloud projects add-iam-policy-binding basic-firebase-80425 --member="serviceAccount:${serviceAccountEmail}" --role="roles/firebase.admin"`,
        { stdio: 'inherit' }
    );

    // Add Service Account Token Creator role
    console.log('🔑 Adding Service Account Token Creator role...');
    execSync(
        `gcloud projects add-iam-policy-binding basic-firebase-80425 --member="serviceAccount:${serviceAccountEmail}" --role="roles/iam.serviceAccountTokenCreator"`,
        { stdio: 'inherit' }
    );

    console.log('');
    console.log('✅ IAM permissions updated successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Wait 5-10 minutes for permissions to propagate');
    console.log('2. Deploy functions again: node deploy-functions.js');
    console.log('3. Test LINE login in your application');
    console.log('');
    console.log('⚠️  Note: If you still get permission errors, you may need to:');
    console.log('- Check Firebase Console > Project Settings > Service accounts');
    console.log('- Ensure the service account has the correct permissions');
    console.log('- Contact Firebase support if issues persist');

} catch (error) {
    console.error('❌ Failed to fix IAM permissions:', error.message);
    console.log('');
    console.log('🔧 Manual steps:');
    console.log('1. Go to Firebase Console > Project Settings > Service accounts');
    console.log('2. Find your service account and ensure it has Firebase Admin role');
    console.log('3. Or run these commands manually:');
    console.log('   gcloud projects add-iam-policy-binding basic-firebase-80425 \\');
    console.log('       --member="serviceAccount:YOUR_SERVICE_ACCOUNT" \\');
    console.log('       --role="roles/firebase.admin"');
    console.log('');
    console.log('4. Deploy functions again after fixing permissions');
    process.exit(1);
} 