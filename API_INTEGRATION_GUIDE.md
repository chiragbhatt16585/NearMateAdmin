# 🔌 NearMate API Integration Guide

## 🎯 Overview

This guide explains how to use the dedicated API integration user we've created for secure, isolated API access to the NearMate platform.

## 👤 API Integration User Details

### User Information
- **Email**: `api@nearmate.local`
- **Role**: `api_integration`
- **User ID**: `f6fb1821-46a3-4524-9ccb-8d4d3f069e1f`
- **Status**: Active

### API Key
- **Key**: `78b5e5feeb7b225ab5925e73376797c7`
- **Permissions**: 
  - `categories:read` - Read service categories
  - `pincodes:read` - Read pincode data
  - `partners:read` - Read partner information
  - `end-users:read` - Read end user data
  - `bookings:read` - Read booking information
  - `public:read` - Access public endpoints
- **Expires**: August 30, 2026 (1 year from creation)
- **Status**: Active

## 🔒 Security Benefits

1. **Isolated Access**: Separate from main admin account
2. **Limited Permissions**: Read-only access for safety
3. **Expiring Keys**: Automatic expiration for security
4. **Audit Trail**: All API calls are logged
5. **Role-Based Access**: Specific `api_integration` role

## 🌐 API Endpoints

### Base URL
```
http://localhost:4000/api/v1
```

### Available Endpoints

#### Categories
- `GET /categories` - List all service categories

#### Pincode Data
- `GET /pincode/lookup/:pincode` - Get pincode details
- `GET /pincode/states` - List all states
- `GET /pincode/cities/:state` - List cities in a state
- `GET /pincode/districts/:city` - List districts in a city

#### Partners
- `GET /partners` - List all partners

#### End Users
- `GET /end-users` - List all end users

#### Bookings
- `GET /bookings` - List all bookings

## 🔑 Authentication Methods

### Method 1: X-API-Key Header (Recommended)
```bash
curl -H "X-API-Key: 78b5e5feeb7b225ab5925e73376797c7" \
     http://localhost:4000/api/v1/categories
```

### Method 2: Authorization Header
```bash
curl -H "Authorization: Bearer 78b5e5feeb7b225ab5925e73376797c7" \
     http://localhost:4000/api/v1/categories
```

### Method 3: Query Parameter
```bash
curl "http://localhost:4000/api/v1/categories?api_key=78b5e5feeb7b225ab5925e73376797c7"
```

## 💻 Code Examples

### JavaScript/Node.js
```javascript
const API_KEY = '78b5e5feeb7b225ab5925e73376797c7';
const BASE_URL = 'http://localhost:4000/api/v1';

// Fetch categories
async function getCategories() {
  const response = await fetch(`${BASE_URL}/categories`, {
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
}

// Fetch pincode data
async function getPincodeData(pincode) {
  const response = await fetch(`${BASE_URL}/pincode/lookup/${pincode}`, {
    headers: {
      'X-API-Key': API_KEY
    }
  });
  return await response.json();
}

// Usage
getCategories().then(console.log);
getPincodeData('110001').then(console.log);
```

### Python
```python
import requests

API_KEY = '78b5e5feeb7b225ab5925e73376797c7'
BASE_URL = 'http://localhost:4000/api/v1'

headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

# Get categories
response = requests.get(f"{BASE_URL}/categories", headers=headers)
categories = response.json()

# Get pincode data
response = requests.get(f"{BASE_URL}/pincode/lookup/110001", headers=headers)
pincode_data = response.json()

print(categories)
print(pincode_data)
```

### cURL
```bash
# Get categories
curl -H "X-API-Key: 78b5e5feeb7b225ab5925e73376797c7" \
     http://localhost:4000/api/v1/categories

# Get pincode data
curl -H "X-API-Key: 78b5e5feeb7b225ab5925e73376797c7" \
     http://localhost:4000/api/v1/pincode/lookup/110001

# Get partners
curl -H "X-API-Key: 78b5e5feeb7b225ab5925e73376797c7" \
     http://localhost:4000/api/v1/partners
```

## 🧪 Testing

### Test Script
We've created a test script to verify the API integration:

```bash
# Make executable and run
chmod +x test_api_integration.sh
./test_api_integration.sh
```

### Manual Testing
You can test individual endpoints using the examples above or use the web dashboard at:
```
http://localhost:5174/api-integration
```

## 📊 Web Dashboard

The API Integration Dashboard provides:
- **Overview**: Complete guide and security benefits
- **Credentials**: Copy-paste ready API key and user details
- **Examples**: Ready-to-use code snippets
- **Testing**: Live API endpoint testing
- **Documentation**: Complete API reference

Access it at: `http://localhost:5174/api-integration`

## ⚠️ Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables in production**
3. **Rotate keys regularly**
4. **Monitor API usage for suspicious activity**
5. **Keep the API key secure and don't share publicly**
6. **This key has read-only access for safety**

## 🔄 API Key Management

### Viewing Keys
Access your API keys at: `http://localhost:5174/api-keys`

### Creating New Keys
1. Go to the API Key Management page
2. Click "Create New API Key"
3. Set name, permissions, and expiration
4. Copy the generated key immediately

### Regenerating Keys
- Use the regenerate function to create new keys
- Old keys become invalid immediately
- Update your integration code with the new key

## 📈 Monitoring & Usage

### Current Status
- ✅ API Server: Running on port 4000
- ✅ Web Dashboard: Running on port 5174
- ✅ API Integration User: Active
- ✅ API Key: Valid and working

### Available Tools
1. **API Integration Dashboard**: Complete guide and testing
2. **API Key Management**: Create and manage keys
3. **Test Script**: Automated API testing
4. **Swagger Docs**: API documentation at `/api/docs`

## 🚀 Getting Started

1. **Use the API Key**: `78b5e5feeb7b225ab5925e73376797c7`
2. **Test Endpoints**: Use the test script or dashboard
3. **Integrate**: Use the code examples in your application
4. **Monitor**: Check usage in the dashboard
5. **Secure**: Keep the key safe and rotate when needed

## 📞 Support

- **API Documentation**: Available at `/api/docs`
- **Web Dashboard**: `http://localhost:5174/api-integration`
- **Test Script**: `./test_api_integration.sh`
- **Logs**: Check server logs for debugging

---

**🎉 You're all set!** The API integration user is ready and working. Use the API key `78b5e5feeb7b225ab5925e73376797c7` for all your integration needs.
