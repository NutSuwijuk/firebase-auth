# 🔗 Linked Accounts API Documentation

## Overview

Linked Accounts API เป็น endpoint สำหรับดึงข้อมูลว่าบัญชี Firebase นี้ผูกกับ social provider ไหนบ้าง โดยจะดึงข้อมูลจาก Firebase Auth และ Custom Claims

## Endpoints

### 1. Get Linked Accounts by Firebase UID
```
GET /api/auth/linked-accounts/:firebaseUid
```

### 2. Get Linked Accounts by Email
```
GET /api/auth/linked-accounts-by-email/:email
```

## Response Structure

### Success Response (200)

```json
{
  "success": true,
  "user": {
    "uid": "string",
    "email": "string",
    "displayName": "string",
    "photoURL": "string",
    "emailVerified": boolean,
    "createdAt": "string (ISO date)",
    "lastSignInAt": "string (ISO date)"
  },
  "linkedAccounts": {
    "providers": [
      {
        "providerId": "string",
        "name": "string",
        "icon": "string (emoji)",
        "color": "string (hex color)",
        "status": "active",
        "displayName": "string",
        "email": "string",
        "photoURL": "string",
        "uid": "string",
        "linkedAt": "string (ISO date)",
        "isPrimary": boolean,
        "statusMessage": "string (LINE specific)"
      }
    ],
    "stats": {
      "totalLinked": number,
      "primaryProvider": "string",
      "lastLinkedAt": "string (ISO date)",
      "emailVerified": boolean,
      "hasMultipleProviders": boolean
    },
    "summary": {
      "totalLinked": number,
      "primaryProvider": "string",
      "hasMultipleProviders": boolean,
      "emailVerified": boolean
    }
  },
  "availableProviders": [
    {
      "providerId": "string",
      "name": "string",
      "icon": "string (emoji)",
      "color": "string (hex color)",
      "status": "available",
      "canLink": true
    }
  ],
  "customClaims": {
    "hasCustomClaims": boolean,
    "claims": "object | null"
  },
  "metadata": {
    "lastUpdated": "string (ISO date)",
    "firebaseVersion": "string",
    "endpoint": "string"
  }
}
```

## Provider Types

### Supported Social Providers

| Provider ID | Display Name | Icon | Color | Description |
|-------------|--------------|------|-------|-------------|
| `google.com` | Google | 🔑 | #4285F4 | Google Sign-In |
| `apple.com` | Apple | 🍎 | #000000 | Apple Sign-In |
| `oidc.line` | LINE | 🟩 | #00C300 | LINE Login (OIDC) |
| `line.com` | LINE | 🟩 | #00C300 | LINE Login (Custom) |
| `facebook.com` | Facebook | 📘 | #1877F2 | Facebook Login |
| `twitter.com` | Twitter | 🐦 | #1DA1F2 | Twitter Login |
| `github.com` | GitHub | 🐙 | #333333 | GitHub OAuth |
| `microsoft.com` | Microsoft | 🪟 | #0078D4 | Microsoft Account |
| `yahoo.com` | Yahoo | 📧 | #720E9E | Yahoo OAuth |
| `password` | Email/Password | 📧 | #6C757D | Email/Password Auth |
| `phone` | Phone | 📱 | #28A745 | Phone Authentication |
| `anonymous` | Anonymous | 👤 | #6C757D | Anonymous Auth |

## Field Descriptions

### User Object
- **uid**: Firebase User UID
- **email**: User's email address
- **displayName**: User's display name
- **photoURL**: User's profile photo URL
- **emailVerified**: Whether email is verified
- **createdAt**: Account creation timestamp
- **lastSignInAt**: Last sign-in timestamp

### Provider Object
- **providerId**: Firebase provider identifier
- **name**: Human-readable provider name
- **icon**: Emoji icon for the provider
- **color**: Brand color in hex format
- **status**: Provider status (active/available)
- **displayName**: User's display name from this provider
- **email**: Email associated with this provider
- **photoURL**: Profile photo from this provider
- **uid**: Provider-specific user ID
- **linkedAt**: When this provider was linked
- **isPrimary**: Whether this is the primary login method
- **statusMessage**: LINE-specific status message

### Statistics Object
- **totalLinked**: Total number of linked providers
- **primaryProvider**: Provider ID of primary login method
- **lastLinkedAt**: Timestamp of most recent linking
- **emailVerified**: Whether user's email is verified
- **hasMultipleProviders**: Whether user has multiple linked accounts

### Available Providers
- **canLink**: Whether this provider can be linked
- **status**: Always "available" for unlinked providers

## Example Responses

### User with Google + LINE Accounts

```json
{
  "success": true,
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastSignInAt": "2024-01-15T10:30:00.000Z"
  },
  "linkedAccounts": {
    "providers": [
      {
        "providerId": "google.com",
        "name": "Google",
        "icon": "🔑",
        "color": "#4285F4",
        "status": "active",
        "displayName": "John Doe",
        "email": "user@gmail.com",
        "photoURL": "https://example.com/photo.jpg",
        "uid": "google123",
        "linkedAt": "2024-01-01T00:00:00.000Z",
        "isPrimary": true
      },
      {
        "providerId": "line.com",
        "name": "LINE",
        "icon": "🟩",
        "color": "#00C300",
        "status": "active",
        "displayName": "John Doe",
        "email": "user@example.com",
        "photoURL": "https://example.com/line-photo.jpg",
        "uid": "U1234567890",
        "linkedAt": "2024-01-10T15:45:00.000Z",
        "isPrimary": false,
        "statusMessage": "Hello World!"
      }
    ],
    "stats": {
      "totalLinked": 2,
      "primaryProvider": "google.com",
      "lastLinkedAt": "2024-01-10T15:45:00.000Z",
      "emailVerified": true,
      "hasMultipleProviders": true
    }
  },
  "availableProviders": [
    {
      "providerId": "apple.com",
      "name": "Apple",
      "icon": "🍎",
      "color": "#000000",
      "status": "available",
      "canLink": true
    }
  ]
}
```

### User with No Linked Accounts

```json
{
  "success": true,
  "user": {
    "uid": "user456",
    "email": "newuser@example.com",
    "displayName": "New User",
    "emailVerified": false,
    "createdAt": "2024-01-15T00:00:00.000Z",
    "lastSignInAt": "2024-01-15T00:00:00.000Z"
  },
  "linkedAccounts": {
    "providers": [],
    "stats": {
      "totalLinked": 0,
      "primaryProvider": null,
      "lastLinkedAt": null,
      "emailVerified": false,
      "hasMultipleProviders": false
    }
  },
  "availableProviders": [
    {
      "providerId": "google.com",
      "name": "Google",
      "icon": "🔑",
      "color": "#4285F4",
      "status": "available",
      "canLink": true
    },
    {
      "providerId": "line.com",
      "name": "LINE",
      "icon": "🟩",
      "color": "#00C300",
      "status": "available",
      "canLink": true
    }
  ]
}
```

## Error Responses

### User Not Found (404)
```json
{
  "success": false,
  "error": "User not found",
  "details": "No user record found for the given UID",
  "code": "auth/user-not-found",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Invalid UID (400)
```json
{
  "success": false,
  "error": "Invalid Firebase UID",
  "details": "The provided UID is not valid",
  "code": "auth/invalid-uid",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Failed to get linked accounts",
  "details": "Internal server error occurred",
  "code": "unknown",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Usage Examples

### JavaScript/Fetch
```javascript
// Get by UID
const response = await fetch('/api/auth/linked-accounts/user123');
const data = await response.json();

// Get by Email
const response = await fetch('/api/auth/linked-accounts-by-email/user%40example.com');
const data = await response.json();

// Check if user has multiple providers
if (data.linkedAccounts.stats.hasMultipleProviders) {
  console.log('User has multiple linked accounts');
}

// Get all linked provider names
const providerNames = data.linkedAccounts.providers.map(p => p.name);
console.log('Linked providers:', providerNames);
```

### cURL
```bash
# Get by UID
curl -X GET "http://localhost:3000/api/auth/linked-accounts/user123"

# Get by Email
curl -X GET "http://localhost:3000/api/auth/linked-accounts-by-email/user%40example.com"
```

## Testing

ใช้ไฟล์ `test-linked-accounts.html` เพื่อทดสอบ API:

1. เปิดไฟล์ใน browser
2. ใส่ Firebase UID หรือ Email
3. กดปุ่ม "Get by UID" หรือ "Get by Email"
4. ดูผลลัพธ์ที่ได้

## Notes

- **Primary Provider**: Provider ที่ใช้ login ล่าสุด
- **Custom Claims**: ข้อมูลเพิ่มเติมที่เก็บใน Firebase (เช่น LINE user ID)
- **Provider Data**: ข้อมูลจาก Firebase Auth providerData
- **Available Providers**: Providers ที่ยังไม่ได้ link และสามารถ link ได้
- **Status**: active = linked, available = can be linked

## Firebase Integration

API นี้ใช้ Firebase Admin SDK เพื่อ:
- ดึงข้อมูล user จาก Firebase Auth
- อ่าน custom claims
- ตรวจสอบ provider data
- จัดการ authentication state
