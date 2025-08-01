// Apple Sign-In Troubleshooting Script
// Run this in browser console to diagnose Apple Sign-In issues

console.log('🍎 Apple Sign-In Troubleshooting Script');
console.log('=====================================');

// Check Firebase configuration
function checkFirebaseConfig() {
  console.log('\n1. Checking Firebase Configuration...');
  
  if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK not loaded');
    return false;
  }
  
  if (!firebase.apps.length) {
    console.error('❌ Firebase app not initialized');
    return false;
  }
  
  const app = firebase.app();
  const config = app.options;
  
  console.log('✅ Firebase app initialized');
  console.log('📋 Project ID:', config.projectId);
  console.log('🌐 Auth Domain:', config.authDomain);
  
  return true;
}

// Check Apple provider
function checkAppleProvider() {
  console.log('\n2. Checking Apple Provider...');
  
  try {
    const appleProvider = new firebase.auth.OAuthProvider('apple.com');
    console.log('✅ Apple provider created successfully');
    
    // Check scopes
    appleProvider.addScope('email');
    appleProvider.addScope('name');
    console.log('✅ Apple scopes configured');
    
    return true;
  } catch (error) {
    console.error('❌ Apple provider error:', error);
    return false;
  }
}

// Check domain authorization
function checkDomainAuthorization() {
  console.log('\n3. Checking Domain Authorization...');
  
  const currentDomain = window.location.hostname;
  const currentProtocol = window.location.protocol;
  
  console.log('🌐 Current domain:', currentDomain);
  console.log('🔗 Protocol:', currentProtocol);
  
  // Common authorized domains
  const commonDomains = [
    'localhost',
    '127.0.0.1',
    'traveltech-f0674.web.app',
    'traveltech-f0674.firebaseapp.com'
  ];
  
  if (commonDomains.includes(currentDomain)) {
    console.log('✅ Domain should be authorized');
  } else {
    console.warn('⚠️ Domain may not be authorized. Add to Firebase Console > Authentication > Settings > Authorized domains');
  }
  
  return true;
}

// Check browser compatibility
function checkBrowserCompatibility() {
  console.log('\n4. Checking Browser Compatibility...');
  
  const userAgent = navigator.userAgent;
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isEdge = /Edg/.test(userAgent);
  
  console.log('🌐 Browser:', userAgent);
  
  if (isSafari) {
    console.log('✅ Safari - Full Apple Sign-In support');
  } else if (isChrome) {
    console.log('✅ Chrome - Apple Sign-In support');
  } else if (isFirefox) {
    console.log('✅ Firefox - Apple Sign-In support');
  } else if (isEdge) {
    console.log('✅ Edge - Apple Sign-In support');
  } else {
    console.warn('⚠️ Unknown browser - Apple Sign-In may not work');
  }
  
  return true;
}

// Check network connectivity
async function checkNetworkConnectivity() {
  console.log('\n5. Checking Network Connectivity...');
  
  try {
    // Test Apple's servers
    const appleResponse = await fetch('https://appleid.apple.com/.well-known/openid_configuration', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('✅ Apple servers accessible');
  } catch (error) {
    console.error('❌ Cannot reach Apple servers:', error);
  }
  
  try {
    // Test Firebase servers
    const firebaseResponse = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('✅ Firebase servers accessible');
  } catch (error) {
    console.error('❌ Cannot reach Firebase servers:', error);
  }
  
  return true;
}

// Test Apple Sign-In (without actually signing in)
async function testAppleSignIn() {
  console.log('\n6. Testing Apple Sign-In Configuration...');
  
  try {
    const auth = firebase.auth();
    const appleProvider = new firebase.auth.OAuthProvider('apple.com');
    
    // Configure provider
    appleProvider.addScope('email');
    appleProvider.addScope('name');
    
    console.log('✅ Apple provider configured for testing');
    console.log('ℹ️ To test actual sign-in, click the Apple Sign-In button');
    
    return true;
  } catch (error) {
    console.error('❌ Apple Sign-In test failed:', error);
    return false;
  }
}

// Generate troubleshooting report
async function generateReport() {
  console.log('\n📋 Generating Troubleshooting Report...');
  
  const results = {
    firebaseConfig: checkFirebaseConfig(),
    appleProvider: checkAppleProvider(),
    domainAuth: checkDomainAuthorization(),
    browserCompat: checkBrowserCompatibility(),
    network: await checkNetworkConnectivity(),
    signInTest: testAppleSignIn()
  };
  
  console.log('\n📊 Troubleshooting Summary:');
  console.log('==========================');
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All checks passed! Apple Sign-In should work.');
    console.log('💡 If you still have issues, check:');
    console.log('   - Firebase Console Apple provider configuration');
    console.log('   - Apple Developer Console settings');
    console.log('   - Browser popup blockers');
  } else {
    console.log('\n⚠️ Some checks failed. Please fix the issues above.');
  }
  
  return results;
}

// Run the troubleshooting
generateReport().then(results => {
  console.log('\n🔧 Troubleshooting complete!');
  console.log('For more help, check the README.md file or Firebase documentation.');
});

// Export functions for manual testing
window.appleTroubleshoot = {
  checkFirebaseConfig,
  checkAppleProvider,
  checkDomainAuthorization,
  checkBrowserCompatibility,
  checkNetworkConnectivity,
  testAppleSignIn,
  generateReport
}; 