# NearMate API Documentation

## Base URL
```
http://localhost:4000/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Login to get token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@nearmate.local",
  "password": "admin123"
}
```

Response:
```json
{
  "user": {
    "id": "db4121a6-707b-4289-83d9-5df53886a00a",
    "email": "admin@nearmate.local",
    "name": "Administrator",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Mobile App OTP Authentication

#### Request OTP for mobile number
```http
POST /auth/request-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

Response:
```json
{
  "message": "OTP sent successfully",
  "mobile": "+919876543210",
  "userType": "end-user",
  "expiresIn": 300  // OTP expires in 5 minutes
}
```

#### Verify OTP for new user registration
```http
POST /auth/verify-otp-register
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user",
  "userData": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "dateOfBirth": "1995-09-17",  // optional
    "gender": "male"               // optional
  }
}
```

Response:
```json
{
  "user": {
    "id": "new-user-uuid",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "mobile": "+919876543210",
    "status": "active",
    "createdAt": "2025-08-21T12:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "User registered successfully"
}
```

#### Verify OTP for existing user login
```http
POST /auth/verify-otp-login
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user"
}
```

Response:
```json
{
  "user": {
    "id": "existing-user-uuid",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "mobile": "+919876543210",
    "status": "active",
    "createdAt": "2025-08-21T12:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

#### Admin: List recent OTPs (for manual copy)
```http
GET /auth/otps?limit=10
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "otps": [
    {
      "id": "otp-uuid",
      "mobile": "+919876543210",
      "otp": "123456",
      "userType": "end-user",
      "isUsed": false,
      "expiresAt": "2025-08-21T12:05:00.000Z",
      "createdAt": "2025-08-21T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "pages": 1 }
}
```

#### Admin: Clear expired OTPs
```http
DELETE /auth/otps/expired
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "message": "Expired OTPs cleared successfully",
  "deletedCount": 5
}
```

#### Check phone number registration status
```http
POST /auth/check-phone-registration
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

Response (if phone is NOT registered):
```json
{
  "isRegistered": false,
  "message": "Phone number is available for registration"
}
```

Response (if phone is ALREADY registered):
```json
{
  "isRegistered": true,
  "existingUser": {
    "id": "existing-user-uuid",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "+919876543210",
    "status": "active",
    "createdAt": "2025-08-21T12:00:00.000Z"
  },
  "message": "Phone number is already registered"
}
```

#### Check phone number registration status (GET method)
```http
GET /auth/check-phone/+919876543210/end-user
```

Response: Same as POST method above.

**Note**: Use this endpoint before requesting OTP to check if a phone number is already registered. This prevents unnecessary OTP generation and provides better user experience.

## OTP Authentication Flow

### For New Users (Registration)
1. **Check Phone Registration**: First check if phone is already registered via `/auth/check-phone-registration`
2. **Request OTP**: If phone is available, send mobile number to `/auth/request-otp`
3. **User enters OTP**: User receives OTP via SMS (or admin copies from web interface)
4. **Verify & Register**: Send OTP + user data to `/auth/verify-otp-register`
5. **User Created**: New user account created with mobile as primary identifier
6. **Login Token**: Access token returned for immediate app access

### For Existing Users (Login)
1. **Check Phone Registration**: First check if phone is registered via `/auth/check-phone-registration`
2. **Request OTP**: If phone exists, send mobile number to `/auth/request-otp`
3. **User enters OTP**: User receives OTP via SMS (or admin copies from web interface)
4. **Verify & Login**: Send OTP to `/auth/verify-otp-login`
5. **User Authenticated**: Existing user account found and verified
6. **Login Token**: Access token returned for app access

### Enhanced Mobile App Flow with Phone Validation

The new phone validation endpoints allow you to create a better user experience by checking phone registration status before proceeding with OTP flows.

#### API Flow Summary

1. **Check Phone Registration**: Use `/auth/check-phone-registration` to check if a phone number is already registered
2. **Request OTP**: Based on the result, request OTP for either login or registration
3. **Verify OTP**: Complete the authentication process

#### Implementation Notes

- Use the phone validation endpoint before requesting OTPs
- Handle different user flows based on registration status
- Implement proper error handling for each step
- The phone validation response will tell you if the user exists and provide existing user details

### React Native OTP Flow

### React Native OTP Flow

The React Native implementation follows the same API flow as described above. Use the documented endpoints to implement OTP authentication in your React Native app.

### Flutter OTP Flow

The Flutter implementation follows the same API flow as described above. Use the documented endpoints to implement OTP authentication in your Flutter app.
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'mobile': mobile,
        'otp': otp,
        'userType': userType,
        'userData': userData,
      }),
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'OTP verification failed');
    }
  }
  
  // Verify OTP for login
  static Future<Map<String, dynamic>> verifyOTPLogin(
    String mobile, 
    String otp, 
    String userType
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/verify-otp-login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'mobile': mobile,
        'otp': otp,
        'userType': userType,
      }),
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['message'] ?? 'OTP verification failed');
    }
  }
}
```

### Admin Web Interface for OTP Management
```javascript
// Admin OTP Management Component
const OTPManagement = () => {
  const [otps, setOtps] = useState([]);
  const [loading, setLoading] = useState(false);
  
### Admin Web Interface for OTP Management

The admin web interface provides functionality to view, copy, and manage OTPs. Use the documented endpoints to implement OTP management in your admin panel.
```

## Endpoints

### Authentication

#### Login to get token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@nearmate.local",
  "password": "admin123"
}
```

#### Request OTP for mobile number
```http
POST /auth/request-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Verify OTP for new user registration
```http
POST /auth/verify-otp-register
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user",
  "userData": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "dateOfBirth": "1995-09-17",  // optional
    "gender": "male"               // optional
  }
}
```

#### Verify OTP for existing user login
```http
POST /auth/verify-otp-login
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user"
}
```

#### Check phone number registration status
```http
POST /auth/check-phone-registration
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Check phone number registration status (GET method)
```http
GET /auth/check-phone/+919876543210/end-user
```

#### Admin: List recent OTPs (for manual copy)
```http
GET /auth/otps?limit=10
Authorization: Bearer <admin_token>
```

#### Admin: Clear expired OTPs
```http
DELETE /auth/otps/expired
Authorization: Bearer <admin_token>
```

### 0. End Users (Customers)

#### Create end user
```http
POST /end-users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "dateOfBirth": "1995-09-17",   // optional (YYYY-MM-DD)
  "gender": "male"               // optional (male|female|other)
}
```

Response:
```json
{
  "id": "<uuid>",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "status": "active",
  "createdAt": "2025-08-21T12:00:00.000Z",
  "updatedAt": "2025-08-21T12:00:00.000Z",
  "addresses": [],
  "bookings": [],
  "reviews": []
}
```

**Note**: For mobile app users, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp`
2. Verify OTP and register via `/auth/verify-otp-register`

This ensures secure mobile-based registration without requiring admin tokens.

#### List end users
```http
GET /end-users?search=rahul&page=1&limit=20
Authorization: Bearer <token>
```

Response:
```json
{
  "users": [
    {
      "id": "<uuid>",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+919876543210",
      "status": "active",
      "createdAt": "2025-08-21T12:00:00.000Z",
      "updatedAt": "2025-08-21T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

#### Get end user by ID
```http
GET /end-users/{id}
Authorization: Bearer <token>
```

#### Update end user
```http
PATCH /end-users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul K Sharma",
  "status": "active"
}
```

#### Delete end user
```http
DELETE /end-users/{id}
Authorization: Bearer <token>
```

### 1. Categories

#### Get all categories
```http
GET /categories
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "6cd1ed55-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "plumber",
    "label": "Plumber",
    "icon": "🛠️",
    "tone": "#E9EEF9",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  },
  {
    "id": "6cd21805-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "electrician",
    "label": "Electrician",
    "icon": "🔌",
    "tone": "#F4ECF7",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  }
]
```

### 2. Partners (Service Providers)

#### Get all partners
```http
GET /partners?search=john
Authorization: Bearer <token>
```

Query Parameters:
- `search` (optional): Search by name, email, or phone

Response:
```json
[
  {
    "id": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "name": "John Doe",
    "phone": "9990001111",
    "email": "john@example.com",
    "loginId": "JD000001",
    "status": "active",
    "serviceRadiusKm": 5,
    "isAvailable": true,
    "pricingType": "hourly",
    "priceMin": 200,
    "priceMax": 500,
    "plan": "Gold",
    "planStatus": "active",
    "boostActive": false,
    "boostStart": null,
    "boostEnd": null,
    "createdAt": "2025-08-19T13:50:12.704Z",
    "updatedAt": "2025-08-19T13:51:28.540Z",
    "categories": [
      {
        "id": "d054520d-db57-48ac-a05d-61f26757d905",
        "serviceCategory": {
          "id": "6cd220a7-7d03-11f0-9cdd-0ea6e67bf632",
          "key": "carpenter",
          "label": "Carpenter",
          "icon": "🪚"
        }
      }
    ],
    "kycs": [
      {
        "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
        "idType": "Aadhar Card",
        "idNumber": "XXXXXXXXX",
        "docUrl": "https://example.com/doc.pdf",
        "status": "verified",
        "createdAt": "2025-08-19T13:50:12.714Z"
      }
    ],
    "bank": {
      "id": "02643418-8d12-443c-930f-46eea5044ebc",
      "accountName": "John Doe",
      "accountNo": "1234567890",
      "ifsc": "HDFC0001234",
      "bankName": "HDFC Bank"
    }
  }
]
```

#### Get partner by ID
```http
GET /partners/{id}
Authorization: Bearer <token>
```

#### Create new partner
```http
POST /partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Partner",
  "phone": "9876543210",
  "email": "new@example.com",
  "categoryKeys": ["plumber", "electrician"],
  "serviceRadiusKm": 10,
  "isAvailable": true,
  "pricingType": "hourly",
  "priceMin": 150,
  "priceMax": 400,
  "plan": "Basic",
  "planStatus": "active",
  "boostActive": false,
  "boostStart": "2025-08-20T10:00:00Z",
  "boostEnd": "2025-08-20T18:00:00Z",
  "bank": {
    "accountName": "New Partner",
    "accountNo": "0987654321",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank"
  }
}
```

**Note**: For mobile app partners, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp` with `userType: "partner"`
2. Verify OTP and register via `/auth/verify-otp-register` with partner data

This ensures secure mobile-based registration without requiring admin tokens.

#### Update partner
```http
PATCH /partners/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isAvailable": false,
  "pricingType": "fixed",
  "priceMin": 200,
  "priceMax": 300
}
```

#### Delete partner
```http
DELETE /partners/{id}
Authorization: Bearer <token>
```

### 3. Partner KYC Management

#### Get partner's KYC documents
```http
GET /partners/{id}/kyc
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
    "partnerId": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "idType": "Aadhar Card",
    "idNumber": "XXXXXXXXX",
    "docUrl": "https://example.com/doc.pdf",
    "status": "verified",
    "createdAt": "2025-08-19T13:50:12.714Z",
    "updatedAt": "2025-08-19T13:50:12.714Z"
  }
]
```

#### Add new KYC document
```http
POST /partners/{id}/kyc
Authorization: Bearer <token>
Content-Type: application/json

{
  "idType": "Pan Card",
  "idNumber": "ABCDE1234F",
  "docUrl": "https://example.com/pan.pdf",
  "status": "pending"
}
```

#### Update KYC document
```http
PATCH /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified"
}
```

#### Delete KYC document
```http
DELETE /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
```

### 4. Users (Staff/Admin)

#### Get all users
```http
GET /users
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "db4121a6-707b-4289-83d9-5df53886a00a",
    "email": "admin@nearmate.local",
    "name": "Administrator",
    "role": "admin",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.690Z",
    "updatedAt": "2025-08-19T13:50:12.690Z"
  }
]
```

#### Get user by ID
```http
GET /users/{id}
Authorization: Bearer <token>
```

#### Create new user
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "staff@nearmate.local",
  "name": "Staff Member",
  "password": "password123",
  "role": "staff"
}
```

#### Update user
```http
PATCH /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Staff Name",
  "role": "admin"
}
```

#### Delete user
```http
DELETE /users/{id}
Authorization: Bearer <token>
```

### 5. Items

#### Get all items
```http
GET /items
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "item-id-1",
    "name": "Item Name",
    "description": "Item description",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.000Z",
    "updatedAt": "2025-08-19T13:50:12.000Z"
  }
]
```

#### Create item
```http
POST /items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Item",
  "description": "New item description"
}
```

#### Update item
```http
PATCH /items/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Item Name",
  "status": "inactive"
}
```

#### Delete item
```http
DELETE /items/{id}
Authorization: Bearer <token>
```

## Data Models

### Partner
```typescript
interface Partner {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loginId?: string;
  status: string;
  serviceRadiusKm: number;
  isAvailable: boolean;
  pricingType?: string;
  priceMin?: number;
  priceMax?: number;
  plan?: string;
  planStatus?: string;
  boostActive: boolean;
  boostStart?: Date;
  boostEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: PartnerCategory[];
  kycs: PartnerKyc[];
  bank?: PartnerBank;
}
```

### PartnerKyc
```typescript
interface PartnerKyc {
  id: string;
  partnerId: string;
  idType?: string;
  idNumber?: string;
  docUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### PartnerBank
```typescript
interface PartnerBank {
  id: string;
  partnerId: string;
  accountName?: string;
  accountNo?: string;
  ifsc?: string;
  bankName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ServiceCategory
```typescript
interface ServiceCategory {
  id: string;
  key: string;
  label: string;
  icon?: string;
  tone?: string;
  popular: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### OTPCode
```typescript
interface OTPCode {
  id: string;
  mobile: string;
  otp: string;
  userType: 'end-user' | 'partner';
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Name is required",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Partner not found",
  "error": "Not Found"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Email or phone already exists",
  "error": "Conflict"
}
```

## Frontend Integration Examples

### React/JavaScript
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  }
  throw new Error('Login failed');
};

// Get partners with auth
const getPartners = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to fetch partners');
};

// Create partner
const createPartner = async (partnerData) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(partnerData)
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to create partner');
};
```

### Mobile App (React Native)
```javascript
// API base configuration
const API_BASE = 'http://localhost:4000/api/v1';

// API client with auth
const apiClient = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired, redirect to login
      await AsyncStorage.removeItem('accessToken');
      // Navigate to login screen
      return;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
  
  // Partner methods
  partners: {
    list: (search) => apiClient.request(`/partners${search ? `?search=${search}` : ''}`),
    get: (id) => apiClient.request(`/partners/${id}`),
    create: (data) => apiClient.request('/partners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiClient.request(`/partners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiClient.request(`/partners/${id}`, { method: 'DELETE' })
  },
  
  // KYC methods
  kyc: {
    list: (partnerId) => apiClient.request(`/partners/${partnerId}/kyc`),
    create: (partnerId, data) => apiClient.request(`/partners/${partnerId}/kyc`, { method: 'POST', body: JSON.stringify(data) }),
    update: (partnerId, kycId, data) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (partnerId, kycId) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'DELETE' })
  }
};

// Usage
const loadPartners = async () => {
  try {
    const partners = await apiClient.partners.list();
    setPartners(partners);
  } catch (error) {
    console.error('Failed to load partners:', error);
  }
};
```

### Enhanced OTP Flow with Phone Validation

The new phone validation endpoints allow you to create a better user experience by checking phone registration status before proceeding with OTP flows.

#### Complete Mobile App Flow
```javascript
// Enhanced OTP Service with Phone Validation
class EnhancedOTPService {
  constructor() {
    this.API_BASE = 'http://localhost:4000/api/v1';
  }

  // Step 1: Check phone registration status
  async checkPhoneRegistration(mobile, userType) {
    const response = await fetch(`${this.API_BASE}/auth/check-phone-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check phone registration');
    }
    
    return response.json();
  }

  // Step 2: Request OTP based on phone status
  async requestOTP(mobile, userType, purpose = 'login') {
    const response = await fetch(`${this.API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType, purpose })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }
    
    return response.json();
  }

  // Step 3: Complete authentication
  async completeAuthentication(mobile, otp, userType, userData = null) {
    try {
      // Try login first
      const loginResult = await this.verifyOTPLogin(mobile, otp, userType);
      return { ...loginResult, isNewUser: false };
    } catch (error) {
      if (error.message.includes('User not found') && userData) {
        // User doesn't exist, proceed with registration
        const registerResult = await this.verifyOTPRegister(mobile, otp, userType, userData);
        return { ...registerResult, isNewUser: true };
      }
      throw error;
    }
  }

  // Helper methods
  async verifyOTPRegister(mobile, otp, userType, userData) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType, userData })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }

  async verifyOTPLogin(mobile, otp, userType) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }
}

// Usage in React Native
const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [userType, setUserType] = useState('end-user');
  const [flowType, setFlowType] = useState('checking'); // 'checking', 'login', 'registration'
  const [existingUser, setExistingUser] = useState(null);
  
  const otpService = new EnhancedOTPService();

  const handlePhoneValidation = async () => {
    try {
      setFlowType('checking');
      
      // Step 1: Check phone registration status
      const phoneCheck = await otpService.checkPhoneRegistration(mobile, userType);
      
      if (phoneCheck.isRegistered) {
        // Phone exists - show login flow
        setFlowType('login');
        setExistingUser(phoneCheck.existingUser);
        // Request OTP for login
        await otpService.requestOTP(mobile, userType, 'login');
      } else {
        // Phone is new - show registration flow
        setFlowType('registration');
        // Request OTP for registration
        await otpService.requestOTP(mobile, userType, 'register');
      }
      
      setIsOTPSent(true);
    } catch (error) {
      Alert.alert('Error', error.message);
      setFlowType('checking');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (flowType === 'login') {
        // Existing user login
        const result = await otpService.verifyOTPLogin(mobile, otp, userType);
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        // Navigate to main app
      } else {
        // New user registration - show registration form
        setShowRegistrationForm(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const result = await otpService.verifyOTPRegister(mobile, otp, userType, userData);
      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      // Navigate to main app
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      
      <Picker
        selectedValue={userType}
        onValueChange={setUserType}
      >
        <Picker.Item label="End User" value="end-user" />
        <Picker.Item label="Partner" value="partner" />
      </Picker>

      {flowType === 'checking' && (
        <Button title="Check Phone Number" onPress={handlePhoneValidation} />
      )}

      {flowType === 'login' && existingUser && (
        <View style={styles.existingUserInfo}>
          <Text>Welcome back, {existingUser.name}!</Text>
          <Text>Email: {existingUser.email}</Text>
          <Text>Status: {existingUser.status}</Text>
        </View>
      )}

      {isOTPSent && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOTP} />
        </>
      )}
    </View>
  );
};
```

### OTP Security Features
- OTP expires in 5 minutes
- OTP can only be used once
- Rate limiting prevents OTP spam
- Admin can view all OTPs for manual copy during development
- OTPs are automatically cleaned up after expiration
- Phone validation prevents duplicate registrations
- Enhanced security with pre-registration phone checks

## Endpoints

### Authentication

#### Login to get token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@nearmate.local",
  "password": "admin123"
}
```

#### Request OTP for mobile number
```http
POST /auth/request-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Verify OTP for new user registration
```http
POST /auth/verify-otp-register
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user",
  "userData": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "dateOfBirth": "1995-09-17",  // optional
    "gender": "male"               // optional
  }
}
```

#### Verify OTP for existing user login
```http
POST /auth/verify-otp-login
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user"
}
```

#### Check phone number registration status
```http
POST /auth/check-phone-registration
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Check phone number registration status (GET method)
```http
GET /auth/check-phone/+919876543210/end-user
```

#### Admin: List recent OTPs (for manual copy)
```http
GET /auth/otps?limit=10
Authorization: Bearer <admin_token>
```

#### Admin: Clear expired OTPs
```http
DELETE /auth/otps/expired
Authorization: Bearer <admin_token>
```

### 0. End Users (Customers)

#### Create end user
```http
POST /end-users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "dateOfBirth": "1995-09-17",   // optional (YYYY-MM-DD)
  "gender": "male"               // optional (male|female|other)
}
```

Response:
```json
{
  "id": "<uuid>",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "status": "active",
  "createdAt": "2025-08-21T12:00:00.000Z",
  "updatedAt": "2025-08-21T12:00:00.000Z",
  "addresses": [],
  "bookings": [],
  "reviews": []
}
```

**Note**: For mobile app users, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp`
2. Verify OTP and register via `/auth/verify-otp-register`

This ensures secure mobile-based registration without requiring admin tokens.

#### List end users
```http
GET /end-users?search=rahul&page=1&limit=20
Authorization: Bearer <token>
```

Response:
```json
{
  "users": [
    {
      "id": "<uuid>",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+919876543210",
      "status": "active",
      "createdAt": "2025-08-21T12:00:00.000Z",
      "updatedAt": "2025-08-21T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

#### Get end user by ID
```http
GET /end-users/{id}
Authorization: Bearer <token>
```

#### Update end user
```http
PATCH /end-users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul K Sharma",
  "status": "active"
}
```

#### Delete end user
```http
DELETE /end-users/{id}
Authorization: Bearer <token>
```

### 1. Categories

#### Get all categories
```http
GET /categories
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "6cd1ed55-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "plumber",
    "label": "Plumber",
    "icon": "🛠️",
    "tone": "#E9EEF9",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  },
  {
    "id": "6cd21805-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "electrician",
    "label": "Electrician",
    "icon": "🔌",
    "tone": "#F4ECF7",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  }
]
```

### 2. Partners (Service Providers)

#### Get all partners
```http
GET /partners?search=john
Authorization: Bearer <token>
```

Query Parameters:
- `search` (optional): Search by name, email, or phone

Response:
```json
[
  {
    "id": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "name": "John Doe",
    "phone": "9990001111",
    "email": "john@example.com",
    "loginId": "JD000001",
    "status": "active",
    "serviceRadiusKm": 5,
    "isAvailable": true,
    "pricingType": "hourly",
    "priceMin": 200,
    "priceMax": 500,
    "plan": "Gold",
    "planStatus": "active",
    "boostActive": false,
    "boostStart": null,
    "boostEnd": null,
    "createdAt": "2025-08-19T13:50:12.704Z",
    "updatedAt": "2025-08-19T13:51:28.540Z",
    "categories": [
      {
        "id": "d054520d-db57-48ac-a05d-61f26757d905",
        "serviceCategory": {
          "id": "6cd220a7-7d03-11f0-9cdd-0ea6e67bf632",
          "key": "carpenter",
          "label": "Carpenter",
          "icon": "🪚"
        }
      }
    ],
    "kycs": [
      {
        "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
        "idType": "Aadhar Card",
        "idNumber": "XXXXXXXXX",
        "docUrl": "https://example.com/doc.pdf",
        "status": "verified",
        "createdAt": "2025-08-19T13:50:12.714Z"
      }
    ],
    "bank": {
      "id": "02643418-8d12-443c-930f-46eea5044ebc",
      "accountName": "John Doe",
      "accountNo": "1234567890",
      "ifsc": "HDFC0001234",
      "bankName": "HDFC Bank"
    }
  }
]
```

#### Get partner by ID
```http
GET /partners/{id}
Authorization: Bearer <token>
```

#### Create new partner
```http
POST /partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Partner",
  "phone": "9876543210",
  "email": "new@example.com",
  "categoryKeys": ["plumber", "electrician"],
  "serviceRadiusKm": 10,
  "isAvailable": true,
  "pricingType": "hourly",
  "priceMin": 150,
  "priceMax": 400,
  "plan": "Basic",
  "planStatus": "active",
  "boostActive": false,
  "boostStart": "2025-08-20T10:00:00Z",
  "boostEnd": "2025-08-20T18:00:00Z",
  "bank": {
    "accountName": "New Partner",
    "accountNo": "0987654321",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank"
  }
}
```

**Note**: For mobile app partners, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp` with `userType: "partner"`
2. Verify OTP and register via `/auth/verify-otp-register` with partner data

This ensures secure mobile-based registration without requiring admin tokens.

#### Update partner
```http
PATCH /partners/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isAvailable": false,
  "pricingType": "fixed",
  "priceMin": 200,
  "priceMax": 300
}
```

#### Delete partner
```http
DELETE /partners/{id}
Authorization: Bearer <token>
```

### 3. Partner KYC Management

#### Get partner's KYC documents
```http
GET /partners/{id}/kyc
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
    "partnerId": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "idType": "Aadhar Card",
    "idNumber": "XXXXXXXXX",
    "docUrl": "https://example.com/doc.pdf",
    "status": "verified",
    "createdAt": "2025-08-19T13:50:12.714Z",
    "updatedAt": "2025-08-19T13:50:12.714Z"
  }
]
```

#### Add new KYC document
```http
POST /partners/{id}/kyc
Authorization: Bearer <token>
Content-Type: application/json

{
  "idType": "Pan Card",
  "idNumber": "ABCDE1234F",
  "docUrl": "https://example.com/pan.pdf",
  "status": "pending"
}
```

#### Update KYC document
```http
PATCH /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified"
}
```

#### Delete KYC document
```http
DELETE /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
```

### 4. Users (Staff/Admin)

#### Get all users
```http
GET /users
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "db4121a6-707b-4289-83d9-5df53886a00a",
    "email": "admin@nearmate.local",
    "name": "Administrator",
    "role": "admin",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.690Z",
    "updatedAt": "2025-08-19T13:50:12.690Z"
  }
]
```

#### Get user by ID
```http
GET /users/{id}
Authorization: Bearer <token>
```

#### Create new user
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "staff@nearmate.local",
  "name": "Staff Member",
  "password": "password123",
  "role": "staff"
}
```

#### Update user
```http
PATCH /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Staff Name",
  "role": "admin"
}
```

#### Delete user
```http
DELETE /users/{id}
Authorization: Bearer <token>
```

### 5. Items

#### Get all items
```http
GET /items
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "item-id-1",
    "name": "Item Name",
    "description": "Item description",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.000Z",
    "updatedAt": "2025-08-19T13:50:12.000Z"
  }
]
```

#### Create item
```http
POST /items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Item",
  "description": "New item description"
}
```

#### Update item
```http
PATCH /items/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Item Name",
  "status": "inactive"
}
```

#### Delete item
```http
DELETE /items/{id}
Authorization: Bearer <token>
```

## Data Models

### Partner
```typescript
interface Partner {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loginId?: string;
  status: string;
  serviceRadiusKm: number;
  isAvailable: boolean;
  pricingType?: string;
  priceMin?: number;
  priceMax?: number;
  plan?: string;
  planStatus?: string;
  boostActive: boolean;
  boostStart?: Date;
  boostEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: PartnerCategory[];
  kycs: PartnerKyc[];
  bank?: PartnerBank;
}
```

### PartnerKyc
```typescript
interface PartnerKyc {
  id: string;
  partnerId: string;
  idType?: string;
  idNumber?: string;
  docUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### PartnerBank
```typescript
interface PartnerBank {
  id: string;
  partnerId: string;
  accountName?: string;
  accountNo?: string;
  ifsc?: string;
  bankName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ServiceCategory
```typescript
interface ServiceCategory {
  id: string;
  key: string;
  label: string;
  icon?: string;
  tone?: string;
  popular: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### OTPCode
```typescript
interface OTPCode {
  id: string;
  mobile: string;
  otp: string;
  userType: 'end-user' | 'partner';
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Name is required",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Partner not found",
  "error": "Not Found"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Email or phone already exists",
  "error": "Conflict"
}
```

## Frontend Integration Examples

### React/JavaScript
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  }
  throw new Error('Login failed');
};

// Get partners with auth
const getPartners = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to fetch partners');
};

// Create partner
const createPartner = async (partnerData) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(partnerData)
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to create partner');
};
```

### Mobile App (React Native)
```javascript
// API base configuration
const API_BASE = 'http://localhost:4000/api/v1';

// API client with auth
const apiClient = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired, redirect to login
      await AsyncStorage.removeItem('accessToken');
      // Navigate to login screen
      return;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
  
  // Partner methods
  partners: {
    list: (search) => apiClient.request(`/partners${search ? `?search=${search}` : ''}`),
    get: (id) => apiClient.request(`/partners/${id}`),
    create: (data) => apiClient.request('/partners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiClient.request(`/partners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiClient.request(`/partners/${id}`, { method: 'DELETE' })
  },
  
  // KYC methods
  kyc: {
    list: (partnerId) => apiClient.request(`/partners/${partnerId}/kyc`),
    create: (partnerId, data) => apiClient.request(`/partners/${partnerId}/kyc`, { method: 'POST', body: JSON.stringify(data) }),
    update: (partnerId, kycId, data) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (partnerId, kycId) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'DELETE' })
  }
};

// Usage
const loadPartners = async () => {
  try {
    const partners = await apiClient.partners.list();
    setPartners(partners);
  } catch (error) {
    console.error('Failed to load partners:', error);
  }
};
```

### Enhanced OTP Flow with Phone Validation

The new phone validation endpoints allow you to create a better user experience by checking phone registration status before proceeding with OTP flows.

#### Complete Mobile App Flow
```javascript
// Enhanced OTP Service with Phone Validation
class EnhancedOTPService {
  constructor() {
    this.API_BASE = 'http://localhost:4000/api/v1';
  }

  // Step 1: Check phone registration status
  async checkPhoneRegistration(mobile, userType) {
    const response = await fetch(`${this.API_BASE}/auth/check-phone-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check phone registration');
    }
    
    return response.json();
  }

  // Step 2: Request OTP based on phone status
  async requestOTP(mobile, userType, purpose = 'login') {
    const response = await fetch(`${this.API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType, purpose })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }
    
    return response.json();
  }

  // Step 3: Complete authentication
  async completeAuthentication(mobile, otp, userType, userData = null) {
    try {
      // Try login first
      const loginResult = await this.verifyOTPLogin(mobile, otp, userType);
      return { ...loginResult, isNewUser: false };
    } catch (error) {
      if (error.message.includes('User not found') && userData) {
        // User doesn't exist, proceed with registration
        const registerResult = await this.verifyOTPRegister(mobile, otp, userType, userData);
        return { ...registerResult, isNewUser: true };
      }
      throw error;
    }
  }

  // Helper methods
  async verifyOTPRegister(mobile, otp, userType, userData) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType, userData })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }

  async verifyOTPLogin(mobile, otp, userType) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }
}

// Usage in React Native
const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [userType, setUserType] = useState('end-user');
  const [flowType, setFlowType] = useState('checking'); // 'checking', 'login', 'registration'
  const [existingUser, setExistingUser] = useState(null);
  
  const otpService = new EnhancedOTPService();

  const handlePhoneValidation = async () => {
    try {
      setFlowType('checking');
      
      // Step 1: Check phone registration status
      const phoneCheck = await otpService.checkPhoneRegistration(mobile, userType);
      
      if (phoneCheck.isRegistered) {
        // Phone exists - show login flow
        setFlowType('login');
        setExistingUser(phoneCheck.existingUser);
        // Request OTP for login
        await otpService.requestOTP(mobile, userType, 'login');
      } else {
        // Phone is new - show registration flow
        setFlowType('registration');
        // Request OTP for registration
        await otpService.requestOTP(mobile, userType, 'register');
      }
      
      setIsOTPSent(true);
    } catch (error) {
      Alert.alert('Error', error.message);
      setFlowType('checking');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (flowType === 'login') {
        // Existing user login
        const result = await otpService.verifyOTPLogin(mobile, otp, userType);
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        // Navigate to main app
      } else {
        // New user registration - show registration form
        setShowRegistrationForm(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const result = await otpService.verifyOTPRegister(mobile, otp, userType, userData);
      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      // Navigate to main app
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      
      <Picker
        selectedValue={userType}
        onValueChange={setUserType}
      >
        <Picker.Item label="End User" value="end-user" />
        <Picker.Item label="Partner" value="partner" />
      </Picker>

      {flowType === 'checking' && (
        <Button title="Check Phone Number" onPress={handlePhoneValidation} />
      )}

      {flowType === 'login' && existingUser && (
        <View style={styles.existingUserInfo}>
          <Text>Welcome back, {existingUser.name}!</Text>
          <Text>Email: {existingUser.email}</Text>
          <Text>Status: {existingUser.status}</Text>
        </View>
      )}

      {isOTPSent && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOTP} />
        </>
      )}
    </View>
  );
};
```

### OTP Security Features
- OTP expires in 5 minutes
- OTP can only be used once
- Rate limiting prevents OTP spam
- Admin can view all OTPs for manual copy during development
- OTPs are automatically cleaned up after expiration
- Phone validation prevents duplicate registrations
- Enhanced security with pre-registration phone checks

## Endpoints

### Authentication

#### Login to get token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@nearmate.local",
  "password": "admin123"
}
```

#### Request OTP for mobile number
```http
POST /auth/request-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Verify OTP for new user registration
```http
POST /auth/verify-otp-register
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user",
  "userData": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "dateOfBirth": "1995-09-17",  // optional
    "gender": "male"               // optional
  }
}
```

#### Verify OTP for existing user login
```http
POST /auth/verify-otp-login
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user"
}
```

#### Check phone number registration status
```http
POST /auth/check-phone-registration
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Check phone number registration status (GET method)
```http
GET /auth/check-phone/+919876543210/end-user
```

#### Admin: List recent OTPs (for manual copy)
```http
GET /auth/otps?limit=10
Authorization: Bearer <admin_token>
```

#### Admin: Clear expired OTPs
```http
DELETE /auth/otps/expired
Authorization: Bearer <admin_token>
```

### 0. End Users (Customers)

#### Create end user
```http
POST /end-users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "dateOfBirth": "1995-09-17",   // optional (YYYY-MM-DD)
  "gender": "male"               // optional (male|female|other)
}
```

Response:
```json
{
  "id": "<uuid>",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "status": "active",
  "createdAt": "2025-08-21T12:00:00.000Z",
  "updatedAt": "2025-08-21T12:00:00.000Z",
  "addresses": [],
  "bookings": [],
  "reviews": []
}
```

**Note**: For mobile app users, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp`
2. Verify OTP and register via `/auth/verify-otp-register`

This ensures secure mobile-based registration without requiring admin tokens.

#### List end users
```http
GET /end-users?search=rahul&page=1&limit=20
Authorization: Bearer <token>
```

Response:
```json
{
  "users": [
    {
      "id": "<uuid>",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+919876543210",
      "status": "active",
      "createdAt": "2025-08-21T12:00:00.000Z",
      "updatedAt": "2025-08-21T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

#### Get end user by ID
```http
GET /end-users/{id}
Authorization: Bearer <token>
```

#### Update end user
```http
PATCH /end-users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul K Sharma",
  "status": "active"
}
```

#### Delete end user
```http
DELETE /end-users/{id}
Authorization: Bearer <token>
```

### 1. Categories

#### Get all categories
```http
GET /categories
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "6cd1ed55-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "plumber",
    "label": "Plumber",
    "icon": "🛠️",
    "tone": "#E9EEF9",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  },
  {
    "id": "6cd21805-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "electrician",
    "label": "Electrician",
    "icon": "🔌",
    "tone": "#F4ECF7",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  }
]
```

### 2. Partners (Service Providers)

#### Get all partners
```http
GET /partners?search=john
Authorization: Bearer <token>
```

Query Parameters:
- `search` (optional): Search by name, email, or phone

Response:
```json
[
  {
    "id": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "name": "John Doe",
    "phone": "9990001111",
    "email": "john@example.com",
    "loginId": "JD000001",
    "status": "active",
    "serviceRadiusKm": 5,
    "isAvailable": true,
    "pricingType": "hourly",
    "priceMin": 200,
    "priceMax": 500,
    "plan": "Gold",
    "planStatus": "active",
    "boostActive": false,
    "boostStart": null,
    "boostEnd": null,
    "createdAt": "2025-08-19T13:50:12.704Z",
    "updatedAt": "2025-08-19T13:51:28.540Z",
    "categories": [
      {
        "id": "d054520d-db57-48ac-a05d-61f26757d905",
        "serviceCategory": {
          "id": "6cd220a7-7d03-11f0-9cdd-0ea6e67bf632",
          "key": "carpenter",
          "label": "Carpenter",
          "icon": "🪚"
        }
      }
    ],
    "kycs": [
      {
        "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
        "idType": "Aadhar Card",
        "idNumber": "XXXXXXXXX",
        "docUrl": "https://example.com/doc.pdf",
        "status": "verified",
        "createdAt": "2025-08-19T13:50:12.714Z"
      }
    ],
    "bank": {
      "id": "02643418-8d12-443c-930f-46eea5044ebc",
      "accountName": "John Doe",
      "accountNo": "1234567890",
      "ifsc": "HDFC0001234",
      "bankName": "HDFC Bank"
    }
  }
]
```

#### Get partner by ID
```http
GET /partners/{id}
Authorization: Bearer <token>
```

#### Create new partner
```http
POST /partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Partner",
  "phone": "9876543210",
  "email": "new@example.com",
  "categoryKeys": ["plumber", "electrician"],
  "serviceRadiusKm": 10,
  "isAvailable": true,
  "pricingType": "hourly",
  "priceMin": 150,
  "priceMax": 400,
  "plan": "Basic",
  "planStatus": "active",
  "boostActive": false,
  "boostStart": "2025-08-20T10:00:00Z",
  "boostEnd": "2025-08-20T18:00:00Z",
  "bank": {
    "accountName": "New Partner",
    "accountNo": "0987654321",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank"
  }
}
```

**Note**: For mobile app partners, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp` with `userType: "partner"`
2. Verify OTP and register via `/auth/verify-otp-register` with partner data

This ensures secure mobile-based registration without requiring admin tokens.

#### Update partner
```http
PATCH /partners/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isAvailable": false,
  "pricingType": "fixed",
  "priceMin": 200,
  "priceMax": 300
}
```

#### Delete partner
```http
DELETE /partners/{id}
Authorization: Bearer <token>
```

### 3. Partner KYC Management

#### Get partner's KYC documents
```http
GET /partners/{id}/kyc
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
    "partnerId": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "idType": "Aadhar Card",
    "idNumber": "XXXXXXXXX",
    "docUrl": "https://example.com/doc.pdf",
    "status": "verified",
    "createdAt": "2025-08-19T13:50:12.714Z",
    "updatedAt": "2025-08-19T13:50:12.714Z"
  }
]
```

#### Add new KYC document
```http
POST /partners/{id}/kyc
Authorization: Bearer <token>
Content-Type: application/json

{
  "idType": "Pan Card",
  "idNumber": "ABCDE1234F",
  "docUrl": "https://example.com/pan.pdf",
  "status": "pending"
}
```

#### Update KYC document
```http
PATCH /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified"
}
```

#### Delete KYC document
```http
DELETE /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
```

### 4. Users (Staff/Admin)

#### Get all users
```http
GET /users
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "db4121a6-707b-4289-83d9-5df53886a00a",
    "email": "admin@nearmate.local",
    "name": "Administrator",
    "role": "admin",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.690Z",
    "updatedAt": "2025-08-19T13:50:12.690Z"
  }
]
```

#### Get user by ID
```http
GET /users/{id}
Authorization: Bearer <token>
```

#### Create new user
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "staff@nearmate.local",
  "name": "Staff Member",
  "password": "password123",
  "role": "staff"
}
```

#### Update user
```http
PATCH /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Staff Name",
  "role": "admin"
}
```

#### Delete user
```http
DELETE /users/{id}
Authorization: Bearer <token>
```

### 5. Items

#### Get all items
```http
GET /items
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "item-id-1",
    "name": "Item Name",
    "description": "Item description",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.000Z",
    "updatedAt": "2025-08-19T13:50:12.000Z"
  }
]
```

#### Create item
```http
POST /items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Item",
  "description": "New item description"
}
```

#### Update item
```http
PATCH /items/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Item Name",
  "status": "inactive"
}
```

#### Delete item
```http
DELETE /items/{id}
Authorization: Bearer <token>
```

## Data Models

### Partner
```typescript
interface Partner {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loginId?: string;
  status: string;
  serviceRadiusKm: number;
  isAvailable: boolean;
  pricingType?: string;
  priceMin?: number;
  priceMax?: number;
  plan?: string;
  planStatus?: string;
  boostActive: boolean;
  boostStart?: Date;
  boostEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: PartnerCategory[];
  kycs: PartnerKyc[];
  bank?: PartnerBank;
}
```

### PartnerKyc
```typescript
interface PartnerKyc {
  id: string;
  partnerId: string;
  idType?: string;
  idNumber?: string;
  docUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### PartnerBank
```typescript
interface PartnerBank {
  id: string;
  partnerId: string;
  accountName?: string;
  accountNo?: string;
  ifsc?: string;
  bankName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ServiceCategory
```typescript
interface ServiceCategory {
  id: string;
  key: string;
  label: string;
  icon?: string;
  tone?: string;
  popular: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### OTPCode
```typescript
interface OTPCode {
  id: string;
  mobile: string;
  otp: string;
  userType: 'end-user' | 'partner';
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Name is required",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Partner not found",
  "error": "Not Found"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Email or phone already exists",
  "error": "Conflict"
}
```

## Frontend Integration Examples

### React/JavaScript
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  }
  throw new Error('Login failed');
};

// Get partners with auth
const getPartners = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to fetch partners');
};

// Create partner
const createPartner = async (partnerData) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(partnerData)
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to create partner');
};
```

### Mobile App (React Native)
```javascript
// API base configuration
const API_BASE = 'http://localhost:4000/api/v1';

// API client with auth
const apiClient = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired, redirect to login
      await AsyncStorage.removeItem('accessToken');
      // Navigate to login screen
      return;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
  
  // Partner methods
  partners: {
    list: (search) => apiClient.request(`/partners${search ? `?search=${search}` : ''}`),
    get: (id) => apiClient.request(`/partners/${id}`),
    create: (data) => apiClient.request('/partners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiClient.request(`/partners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiClient.request(`/partners/${id}`, { method: 'DELETE' })
  },
  
  // KYC methods
  kyc: {
    list: (partnerId) => apiClient.request(`/partners/${partnerId}/kyc`),
    create: (partnerId, data) => apiClient.request(`/partners/${partnerId}/kyc`, { method: 'POST', body: JSON.stringify(data) }),
    update: (partnerId, kycId, data) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (partnerId, kycId) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'DELETE' })
  }
};

// Usage
const loadPartners = async () => {
  try {
    const partners = await apiClient.partners.list();
    setPartners(partners);
  } catch (error) {
    console.error('Failed to load partners:', error);
  }
};
```

### Enhanced OTP Flow with Phone Validation

The new phone validation endpoints allow you to create a better user experience by checking phone registration status before proceeding with OTP flows.

#### Complete Mobile App Flow
```javascript
// Enhanced OTP Service with Phone Validation
class EnhancedOTPService {
  constructor() {
    this.API_BASE = 'http://localhost:4000/api/v1';
  }

  // Step 1: Check phone registration status
  async checkPhoneRegistration(mobile, userType) {
    const response = await fetch(`${this.API_BASE}/auth/check-phone-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check phone registration');
    }
    
    return response.json();
  }

  // Step 2: Request OTP based on phone status
  async requestOTP(mobile, userType, purpose = 'login') {
    const response = await fetch(`${this.API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType, purpose })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }
    
    return response.json();
  }

  // Step 3: Complete authentication
  async completeAuthentication(mobile, otp, userType, userData = null) {
    try {
      // Try login first
      const loginResult = await this.verifyOTPLogin(mobile, otp, userType);
      return { ...loginResult, isNewUser: false };
    } catch (error) {
      if (error.message.includes('User not found') && userData) {
        // User doesn't exist, proceed with registration
        const registerResult = await this.verifyOTPRegister(mobile, otp, userType, userData);
        return { ...registerResult, isNewUser: true };
      }
      throw error;
    }
  }

  // Helper methods
  async verifyOTPRegister(mobile, otp, userType, userData) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType, userData })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }

  async verifyOTPLogin(mobile, otp, userType) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }
}

// Usage in React Native
const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [userType, setUserType] = useState('end-user');
  const [flowType, setFlowType] = useState('checking'); // 'checking', 'login', 'registration'
  const [existingUser, setExistingUser] = useState(null);
  
  const otpService = new EnhancedOTPService();

  const handlePhoneValidation = async () => {
    try {
      setFlowType('checking');
      
      // Step 1: Check phone registration status
      const phoneCheck = await otpService.checkPhoneRegistration(mobile, userType);
      
      if (phoneCheck.isRegistered) {
        // Phone exists - show login flow
        setFlowType('login');
        setExistingUser(phoneCheck.existingUser);
        // Request OTP for login
        await otpService.requestOTP(mobile, userType, 'login');
      } else {
        // Phone is new - show registration flow
        setFlowType('registration');
        // Request OTP for registration
        await otpService.requestOTP(mobile, userType, 'register');
      }
      
      setIsOTPSent(true);
    } catch (error) {
      Alert.alert('Error', error.message);
      setFlowType('checking');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (flowType === 'login') {
        // Existing user login
        const result = await otpService.verifyOTPLogin(mobile, otp, userType);
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        // Navigate to main app
      } else {
        // New user registration - show registration form
        setShowRegistrationForm(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const result = await otpService.verifyOTPRegister(mobile, otp, userType, userData);
      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      // Navigate to main app
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      
      <Picker
        selectedValue={userType}
        onValueChange={setUserType}
      >
        <Picker.Item label="End User" value="end-user" />
        <Picker.Item label="Partner" value="partner" />
      </Picker>

      {flowType === 'checking' && (
        <Button title="Check Phone Number" onPress={handlePhoneValidation} />
      )}

      {flowType === 'login' && existingUser && (
        <View style={styles.existingUserInfo}>
          <Text>Welcome back, {existingUser.name}!</Text>
          <Text>Email: {existingUser.email}</Text>
          <Text>Status: {existingUser.status}</Text>
        </View>
      )}

      {isOTPSent && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOTP} />
        </>
      )}
    </View>
  );
};
```

### OTP Security Features
- OTP expires in 5 minutes
- OTP can only be used once
- Rate limiting prevents OTP spam
- Admin can view all OTPs for manual copy during development
- OTPs are automatically cleaned up after expiration
- Phone validation prevents duplicate registrations
- Enhanced security with pre-registration phone checks

## Endpoints

### Authentication

#### Login to get token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@nearmate.local",
  "password": "admin123"
}
```

#### Request OTP for mobile number
```http
POST /auth/request-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Verify OTP for new user registration
```http
POST /auth/verify-otp-register
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user",
  "userData": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "dateOfBirth": "1995-09-17",  // optional
    "gender": "male"               // optional
  }
}
```

#### Verify OTP for existing user login
```http
POST /auth/verify-otp-login
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user"
}
```

#### Check phone number registration status
```http
POST /auth/check-phone-registration
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Check phone number registration status (GET method)
```http
GET /auth/check-phone/+919876543210/end-user
```

#### Admin: List recent OTPs (for manual copy)
```http
GET /auth/otps?limit=10
Authorization: Bearer <admin_token>
```

#### Admin: Clear expired OTPs
```http
DELETE /auth/otps/expired
Authorization: Bearer <admin_token>
```

### 0. End Users (Customers)

#### Create end user
```http
POST /end-users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "dateOfBirth": "1995-09-17",   // optional (YYYY-MM-DD)
  "gender": "male"               // optional (male|female|other)
}
```

Response:
```json
{
  "id": "<uuid>",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "status": "active",
  "createdAt": "2025-08-21T12:00:00.000Z",
  "updatedAt": "2025-08-21T12:00:00.000Z",
  "addresses": [],
  "bookings": [],
  "reviews": []
}
```

**Note**: For mobile app users, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp`
2. Verify OTP and register via `/auth/verify-otp-register`

This ensures secure mobile-based registration without requiring admin tokens.

#### List end users
```http
GET /end-users?search=rahul&page=1&limit=20
Authorization: Bearer <token>
```

Response:
```json
{
  "users": [
    {
      "id": "<uuid>",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+919876543210",
      "status": "active",
      "createdAt": "2025-08-21T12:00:00.000Z",
      "updatedAt": "2025-08-21T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

#### Get end user by ID
```http
GET /end-users/{id}
Authorization: Bearer <token>
```

#### Update end user
```http
PATCH /end-users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul K Sharma",
  "status": "active"
}
```

#### Delete end user
```http
DELETE /end-users/{id}
Authorization: Bearer <token>
```

### 1. Categories

#### Get all categories
```http
GET /categories
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "6cd1ed55-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "plumber",
    "label": "Plumber",
    "icon": "🛠️",
    "tone": "#E9EEF9",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  },
  {
    "id": "6cd21805-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "electrician",
    "label": "Electrician",
    "icon": "🔌",
    "tone": "#F4ECF7",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  }
]
```

### 2. Partners (Service Providers)

#### Get all partners
```http
GET /partners?search=john
Authorization: Bearer <token>
```

Query Parameters:
- `search` (optional): Search by name, email, or phone

Response:
```json
[
  {
    "id": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "name": "John Doe",
    "phone": "9990001111",
    "email": "john@example.com",
    "loginId": "JD000001",
    "status": "active",
    "serviceRadiusKm": 5,
    "isAvailable": true,
    "pricingType": "hourly",
    "priceMin": 200,
    "priceMax": 500,
    "plan": "Gold",
    "planStatus": "active",
    "boostActive": false,
    "boostStart": null,
    "boostEnd": null,
    "createdAt": "2025-08-19T13:50:12.704Z",
    "updatedAt": "2025-08-19T13:51:28.540Z",
    "categories": [
      {
        "id": "d054520d-db57-48ac-a05d-61f26757d905",
        "serviceCategory": {
          "id": "6cd220a7-7d03-11f0-9cdd-0ea6e67bf632",
          "key": "carpenter",
          "label": "Carpenter",
          "icon": "🪚"
        }
      }
    ],
    "kycs": [
      {
        "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
        "idType": "Aadhar Card",
        "idNumber": "XXXXXXXXX",
        "docUrl": "https://example.com/doc.pdf",
        "status": "verified",
        "createdAt": "2025-08-19T13:50:12.714Z"
      }
    ],
    "bank": {
      "id": "02643418-8d12-443c-930f-46eea5044ebc",
      "accountName": "John Doe",
      "accountNo": "1234567890",
      "ifsc": "HDFC0001234",
      "bankName": "HDFC Bank"
    }
  }
]
```

#### Get partner by ID
```http
GET /partners/{id}
Authorization: Bearer <token>
```

#### Create new partner
```http
POST /partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Partner",
  "phone": "9876543210",
  "email": "new@example.com",
  "categoryKeys": ["plumber", "electrician"],
  "serviceRadiusKm": 10,
  "isAvailable": true,
  "pricingType": "hourly",
  "priceMin": 150,
  "priceMax": 400,
  "plan": "Basic",
  "planStatus": "active",
  "boostActive": false,
  "boostStart": "2025-08-20T10:00:00Z",
  "boostEnd": "2025-08-20T18:00:00Z",
  "bank": {
    "accountName": "New Partner",
    "accountNo": "0987654321",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank"
  }
}
```

**Note**: For mobile app partners, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp` with `userType: "partner"`
2. Verify OTP and register via `/auth/verify-otp-register` with partner data

This ensures secure mobile-based registration without requiring admin tokens.

#### Update partner
```http
PATCH /partners/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isAvailable": false,
  "pricingType": "fixed",
  "priceMin": 200,
  "priceMax": 300
}
```

#### Delete partner
```http
DELETE /partners/{id}
Authorization: Bearer <token>
```

### 3. Partner KYC Management

#### Get partner's KYC documents
```http
GET /partners/{id}/kyc
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
    "partnerId": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "idType": "Aadhar Card",
    "idNumber": "XXXXXXXXX",
    "docUrl": "https://example.com/doc.pdf",
    "status": "verified",
    "createdAt": "2025-08-19T13:50:12.714Z",
    "updatedAt": "2025-08-19T13:50:12.714Z"
  }
]
```

#### Add new KYC document
```http
POST /partners/{id}/kyc
Authorization: Bearer <token>
Content-Type: application/json

{
  "idType": "Pan Card",
  "idNumber": "ABCDE1234F",
  "docUrl": "https://example.com/pan.pdf",
  "status": "pending"
}
```

#### Update KYC document
```http
PATCH /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified"
}
```

#### Delete KYC document
```http
DELETE /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
```

### 4. Users (Staff/Admin)

#### Get all users
```http
GET /users
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "db4121a6-707b-4289-83d9-5df53886a00a",
    "email": "admin@nearmate.local",
    "name": "Administrator",
    "role": "admin",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.690Z",
    "updatedAt": "2025-08-19T13:50:12.690Z"
  }
]
```

#### Get user by ID
```http
GET /users/{id}
Authorization: Bearer <token>
```

#### Create new user
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "staff@nearmate.local",
  "name": "Staff Member",
  "password": "password123",
  "role": "staff"
}
```

#### Update user
```http
PATCH /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Staff Name",
  "role": "admin"
}
```

#### Delete user
```http
DELETE /users/{id}
Authorization: Bearer <token>
```

### 5. Items

#### Get all items
```http
GET /items
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "item-id-1",
    "name": "Item Name",
    "description": "Item description",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.000Z",
    "updatedAt": "2025-08-19T13:50:12.000Z"
  }
]
```

#### Create item
```http
POST /items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Item",
  "description": "New item description"
}
```

#### Update item
```http
PATCH /items/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Item Name",
  "status": "inactive"
}
```

#### Delete item
```http
DELETE /items/{id}
Authorization: Bearer <token>
```

## Data Models

### Partner
```typescript
interface Partner {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loginId?: string;
  status: string;
  serviceRadiusKm: number;
  isAvailable: boolean;
  pricingType?: string;
  priceMin?: number;
  priceMax?: number;
  plan?: string;
  planStatus?: string;
  boostActive: boolean;
  boostStart?: Date;
  boostEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: PartnerCategory[];
  kycs: PartnerKyc[];
  bank?: PartnerBank;
}
```

### PartnerKyc
```typescript
interface PartnerKyc {
  id: string;
  partnerId: string;
  idType?: string;
  idNumber?: string;
  docUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### PartnerBank
```typescript
interface PartnerBank {
  id: string;
  partnerId: string;
  accountName?: string;
  accountNo?: string;
  ifsc?: string;
  bankName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ServiceCategory
```typescript
interface ServiceCategory {
  id: string;
  key: string;
  label: string;
  icon?: string;
  tone?: string;
  popular: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### OTPCode
```typescript
interface OTPCode {
  id: string;
  mobile: string;
  otp: string;
  userType: 'end-user' | 'partner';
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Name is required",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Partner not found",
  "error": "Not Found"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Email or phone already exists",
  "error": "Conflict"
}
```

## Frontend Integration Examples

### React/JavaScript
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  }
  throw new Error('Login failed');
};

// Get partners with auth
const getPartners = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to fetch partners');
};

// Create partner
const createPartner = async (partnerData) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(partnerData)
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to create partner');
};
```

### Mobile App (React Native)
```javascript
// API base configuration
const API_BASE = 'http://localhost:4000/api/v1';

// API client with auth
const apiClient = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired, redirect to login
      await AsyncStorage.removeItem('accessToken');
      // Navigate to login screen
      return;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
  
  // Partner methods
  partners: {
    list: (search) => apiClient.request(`/partners${search ? `?search=${search}` : ''}`),
    get: (id) => apiClient.request(`/partners/${id}`),
    create: (data) => apiClient.request('/partners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiClient.request(`/partners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiClient.request(`/partners/${id}`, { method: 'DELETE' })
  },
  
  // KYC methods
  kyc: {
    list: (partnerId) => apiClient.request(`/partners/${partnerId}/kyc`),
    create: (partnerId, data) => apiClient.request(`/partners/${partnerId}/kyc`, { method: 'POST', body: JSON.stringify(data) }),
    update: (partnerId, kycId, data) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (partnerId, kycId) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'DELETE' })
  }
};

// Usage
const loadPartners = async () => {
  try {
    const partners = await apiClient.partners.list();
    setPartners(partners);
  } catch (error) {
    console.error('Failed to load partners:', error);
  }
};
```

### Enhanced OTP Flow with Phone Validation

The new phone validation endpoints allow you to create a better user experience by checking phone registration status before proceeding with OTP flows.

#### Complete Mobile App Flow
```javascript
// Enhanced OTP Service with Phone Validation
class EnhancedOTPService {
  constructor() {
    this.API_BASE = 'http://localhost:4000/api/v1';
  }

  // Step 1: Check phone registration status
  async checkPhoneRegistration(mobile, userType) {
    const response = await fetch(`${this.API_BASE}/auth/check-phone-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check phone registration');
    }
    
    return response.json();
  }

  // Step 2: Request OTP based on phone status
  async requestOTP(mobile, userType, purpose = 'login') {
    const response = await fetch(`${this.API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType, purpose })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }
    
    return response.json();
  }

  // Step 3: Complete authentication
  async completeAuthentication(mobile, otp, userType, userData = null) {
    try {
      // Try login first
      const loginResult = await this.verifyOTPLogin(mobile, otp, userType);
      return { ...loginResult, isNewUser: false };
    } catch (error) {
      if (error.message.includes('User not found') && userData) {
        // User doesn't exist, proceed with registration
        const registerResult = await this.verifyOTPRegister(mobile, otp, userType, userData);
        return { ...registerResult, isNewUser: true };
      }
      throw error;
    }
  }

  // Helper methods
  async verifyOTPRegister(mobile, otp, userType, userData) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType, userData })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }

  async verifyOTPLogin(mobile, otp, userType) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }
}

// Usage in React Native
const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [userType, setUserType] = useState('end-user');
  const [flowType, setFlowType] = useState('checking'); // 'checking', 'login', 'registration'
  const [existingUser, setExistingUser] = useState(null);
  
  const otpService = new EnhancedOTPService();

  const handlePhoneValidation = async () => {
    try {
      setFlowType('checking');
      
      // Step 1: Check phone registration status
      const phoneCheck = await otpService.checkPhoneRegistration(mobile, userType);
      
      if (phoneCheck.isRegistered) {
        // Phone exists - show login flow
        setFlowType('login');
        setExistingUser(phoneCheck.existingUser);
        // Request OTP for login
        await otpService.requestOTP(mobile, userType, 'login');
      } else {
        // Phone is new - show registration flow
        setFlowType('registration');
        // Request OTP for registration
        await otpService.requestOTP(mobile, userType, 'register');
      }
      
      setIsOTPSent(true);
    } catch (error) {
      Alert.alert('Error', error.message);
      setFlowType('checking');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (flowType === 'login') {
        // Existing user login
        const result = await otpService.verifyOTPLogin(mobile, otp, userType);
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        // Navigate to main app
      } else {
        // New user registration - show registration form
        setShowRegistrationForm(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const result = await otpService.verifyOTPRegister(mobile, otp, userType, userData);
      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      // Navigate to main app
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      
      <Picker
        selectedValue={userType}
        onValueChange={setUserType}
      >
        <Picker.Item label="End User" value="end-user" />
        <Picker.Item label="Partner" value="partner" />
      </Picker>

      {flowType === 'checking' && (
        <Button title="Check Phone Number" onPress={handlePhoneValidation} />
      )}

      {flowType === 'login' && existingUser && (
        <View style={styles.existingUserInfo}>
          <Text>Welcome back, {existingUser.name}!</Text>
          <Text>Email: {existingUser.email}</Text>
          <Text>Status: {existingUser.status}</Text>
        </View>
      )}

      {isOTPSent && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOTP} />
        </>
      )}
    </View>
  );
};
```

### OTP Security Features
- OTP expires in 5 minutes
- OTP can only be used once
- Rate limiting prevents OTP spam
- Admin can view all OTPs for manual copy during development
- OTPs are automatically cleaned up after expiration
- Phone validation prevents duplicate registrations
- Enhanced security with pre-registration phone checks

## Endpoints

### Authentication

#### Login to get token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@nearmate.local",
  "password": "admin123"
}
```

#### Request OTP for mobile number
```http
POST /auth/request-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Verify OTP for new user registration
```http
POST /auth/verify-otp-register
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user",
  "userData": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "dateOfBirth": "1995-09-17",  // optional
    "gender": "male"               // optional
  }
}
```

#### Verify OTP for existing user login
```http
POST /auth/verify-otp-login
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user"
}
```

#### Check phone number registration status
```http
POST /auth/check-phone-registration
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Check phone number registration status (GET method)
```http
GET /auth/check-phone/+919876543210/end-user
```

#### Admin: List recent OTPs (for manual copy)
```http
GET /auth/otps?limit=10
Authorization: Bearer <admin_token>
```

#### Admin: Clear expired OTPs
```http
DELETE /auth/otps/expired
Authorization: Bearer <admin_token>
```

### 0. End Users (Customers)

#### Create end user
```http
POST /end-users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "dateOfBirth": "1995-09-17",   // optional (YYYY-MM-DD)
  "gender": "male"               // optional (male|female|other)
}
```

Response:
```json
{
  "id": "<uuid>",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "status": "active",
  "createdAt": "2025-08-21T12:00:00.000Z",
  "updatedAt": "2025-08-21T12:00:00.000Z",
  "addresses": [],
  "bookings": [],
  "reviews": []
}
```

**Note**: For mobile app users, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp`
2. Verify OTP and register via `/auth/verify-otp-register`

This ensures secure mobile-based registration without requiring admin tokens.

#### List end users
```http
GET /end-users?search=rahul&page=1&limit=20
Authorization: Bearer <token>
```

Response:
```json
{
  "users": [
    {
      "id": "<uuid>",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+919876543210",
      "status": "active",
      "createdAt": "2025-08-21T12:00:00.000Z",
      "updatedAt": "2025-08-21T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

#### Get end user by ID
```http
GET /end-users/{id}
Authorization: Bearer <token>
```

#### Update end user
```http
PATCH /end-users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul K Sharma",
  "status": "active"
}
```

#### Delete end user
```http
DELETE /end-users/{id}
Authorization: Bearer <token>
```

### 1. Categories

#### Get all categories
```http
GET /categories
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "6cd1ed55-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "plumber",
    "label": "Plumber",
    "icon": "🛠️",
    "tone": "#E9EEF9",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  },
  {
    "id": "6cd21805-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "electrician",
    "label": "Electrician",
    "icon": "🔌",
    "tone": "#F4ECF7",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  }
]
```

### 2. Partners (Service Providers)

#### Get all partners
```http
GET /partners?search=john
Authorization: Bearer <token>
```

Query Parameters:
- `search` (optional): Search by name, email, or phone

Response:
```json
[
  {
    "id": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "name": "John Doe",
    "phone": "9990001111",
    "email": "john@example.com",
    "loginId": "JD000001",
    "status": "active",
    "serviceRadiusKm": 5,
    "isAvailable": true,
    "pricingType": "hourly",
    "priceMin": 200,
    "priceMax": 500,
    "plan": "Gold",
    "planStatus": "active",
    "boostActive": false,
    "boostStart": null,
    "boostEnd": null,
    "createdAt": "2025-08-19T13:50:12.704Z",
    "updatedAt": "2025-08-19T13:51:28.540Z",
    "categories": [
      {
        "id": "d054520d-db57-48ac-a05d-61f26757d905",
        "serviceCategory": {
          "id": "6cd220a7-7d03-11f0-9cdd-0ea6e67bf632",
          "key": "carpenter",
          "label": "Carpenter",
          "icon": "🪚"
        }
      }
    ],
    "kycs": [
      {
        "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
        "idType": "Aadhar Card",
        "idNumber": "XXXXXXXXX",
        "docUrl": "https://example.com/doc.pdf",
        "status": "verified",
        "createdAt": "2025-08-19T13:50:12.714Z"
      }
    ],
    "bank": {
      "id": "02643418-8d12-443c-930f-46eea5044ebc",
      "accountName": "John Doe",
      "accountNo": "1234567890",
      "ifsc": "HDFC0001234",
      "bankName": "HDFC Bank"
    }
  }
]
```

#### Get partner by ID
```http
GET /partners/{id}
Authorization: Bearer <token>
```

#### Create new partner
```http
POST /partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Partner",
  "phone": "9876543210",
  "email": "new@example.com",
  "categoryKeys": ["plumber", "electrician"],
  "serviceRadiusKm": 10,
  "isAvailable": true,
  "pricingType": "hourly",
  "priceMin": 150,
  "priceMax": 400,
  "plan": "Basic",
  "planStatus": "active",
  "boostActive": false,
  "boostStart": "2025-08-20T10:00:00Z",
  "boostEnd": "2025-08-20T18:00:00Z",
  "bank": {
    "accountName": "New Partner",
    "accountNo": "0987654321",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank"
  }
}
```

**Note**: For mobile app partners, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp` with `userType: "partner"`
2. Verify OTP and register via `/auth/verify-otp-register` with partner data

This ensures secure mobile-based registration without requiring admin tokens.

#### Update partner
```http
PATCH /partners/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isAvailable": false,
  "pricingType": "fixed",
  "priceMin": 200,
  "priceMax": 300
}
```

#### Delete partner
```http
DELETE /partners/{id}
Authorization: Bearer <token>
```

### 3. Partner KYC Management

#### Get partner's KYC documents
```http
GET /partners/{id}/kyc
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
    "partnerId": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "idType": "Aadhar Card",
    "idNumber": "XXXXXXXXX",
    "docUrl": "https://example.com/doc.pdf",
    "status": "verified",
    "createdAt": "2025-08-19T13:50:12.714Z",
    "updatedAt": "2025-08-19T13:50:12.714Z"
  }
]
```

#### Add new KYC document
```http
POST /partners/{id}/kyc
Authorization: Bearer <token>
Content-Type: application/json

{
  "idType": "Pan Card",
  "idNumber": "ABCDE1234F",
  "docUrl": "https://example.com/pan.pdf",
  "status": "pending"
}
```

#### Update KYC document
```http
PATCH /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified"
}
```

#### Delete KYC document
```http
DELETE /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
```

### 4. Users (Staff/Admin)

#### Get all users
```http
GET /users
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "db4121a6-707b-4289-83d9-5df53886a00a",
    "email": "admin@nearmate.local",
    "name": "Administrator",
    "role": "admin",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.690Z",
    "updatedAt": "2025-08-19T13:50:12.690Z"
  }
]
```

#### Get user by ID
```http
GET /users/{id}
Authorization: Bearer <token>
```

#### Create new user
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "staff@nearmate.local",
  "name": "Staff Member",
  "password": "password123",
  "role": "staff"
}
```

#### Update user
```http
PATCH /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Staff Name",
  "role": "admin"
}
```

#### Delete user
```http
DELETE /users/{id}
Authorization: Bearer <token>
```

### 5. Items

#### Get all items
```http
GET /items
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "item-id-1",
    "name": "Item Name",
    "description": "Item description",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.000Z",
    "updatedAt": "2025-08-19T13:50:12.000Z"
  }
]
```

#### Create item
```http
POST /items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Item",
  "description": "New item description"
}
```

#### Update item
```http
PATCH /items/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Item Name",
  "status": "inactive"
}
```

#### Delete item
```http
DELETE /items/{id}
Authorization: Bearer <token>
```

## Data Models

### Partner
```typescript
interface Partner {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loginId?: string;
  status: string;
  serviceRadiusKm: number;
  isAvailable: boolean;
  pricingType?: string;
  priceMin?: number;
  priceMax?: number;
  plan?: string;
  planStatus?: string;
  boostActive: boolean;
  boostStart?: Date;
  boostEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: PartnerCategory[];
  kycs: PartnerKyc[];
  bank?: PartnerBank;
}
```

### PartnerKyc
```typescript
interface PartnerKyc {
  id: string;
  partnerId: string;
  idType?: string;
  idNumber?: string;
  docUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### PartnerBank
```typescript
interface PartnerBank {
  id: string;
  partnerId: string;
  accountName?: string;
  accountNo?: string;
  ifsc?: string;
  bankName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ServiceCategory
```typescript
interface ServiceCategory {
  id: string;
  key: string;
  label: string;
  icon?: string;
  tone?: string;
  popular: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### OTPCode
```typescript
interface OTPCode {
  id: string;
  mobile: string;
  otp: string;
  userType: 'end-user' | 'partner';
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Name is required",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Partner not found",
  "error": "Not Found"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Email or phone already exists",
  "error": "Conflict"
}
```

## Frontend Integration Examples

### React/JavaScript
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  }
  throw new Error('Login failed');
};

// Get partners with auth
const getPartners = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to fetch partners');
};

// Create partner
const createPartner = async (partnerData) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(partnerData)
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to create partner');
};
```

### Mobile App (React Native)
```javascript
// API base configuration
const API_BASE = 'http://localhost:4000/api/v1';

// API client with auth
const apiClient = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired, redirect to login
      await AsyncStorage.removeItem('accessToken');
      // Navigate to login screen
      return;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
  
  // Partner methods
  partners: {
    list: (search) => apiClient.request(`/partners${search ? `?search=${search}` : ''}`),
    get: (id) => apiClient.request(`/partners/${id}`),
    create: (data) => apiClient.request('/partners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiClient.request(`/partners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiClient.request(`/partners/${id}`, { method: 'DELETE' })
  },
  
  // KYC methods
  kyc: {
    list: (partnerId) => apiClient.request(`/partners/${partnerId}/kyc`),
    create: (partnerId, data) => apiClient.request(`/partners/${partnerId}/kyc`, { method: 'POST', body: JSON.stringify(data) }),
    update: (partnerId, kycId, data) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (partnerId, kycId) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'DELETE' })
  }
};

// Usage
const loadPartners = async () => {
  try {
    const partners = await apiClient.partners.list();
    setPartners(partners);
  } catch (error) {
    console.error('Failed to load partners:', error);
  }
};
```

### Enhanced OTP Flow with Phone Validation

The new phone validation endpoints allow you to create a better user experience by checking phone registration status before proceeding with OTP flows.

#### Complete Mobile App Flow
```javascript
// Enhanced OTP Service with Phone Validation
class EnhancedOTPService {
  constructor() {
    this.API_BASE = 'http://localhost:4000/api/v1';
  }

  // Step 1: Check phone registration status
  async checkPhoneRegistration(mobile, userType) {
    const response = await fetch(`${this.API_BASE}/auth/check-phone-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check phone registration');
    }
    
    return response.json();
  }

  // Step 2: Request OTP based on phone status
  async requestOTP(mobile, userType, purpose = 'login') {
    const response = await fetch(`${this.API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType, purpose })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }
    
    return response.json();
  }

  // Step 3: Complete authentication
  async completeAuthentication(mobile, otp, userType, userData = null) {
    try {
      // Try login first
      const loginResult = await this.verifyOTPLogin(mobile, otp, userType);
      return { ...loginResult, isNewUser: false };
    } catch (error) {
      if (error.message.includes('User not found') && userData) {
        // User doesn't exist, proceed with registration
        const registerResult = await this.verifyOTPRegister(mobile, otp, userType, userData);
        return { ...registerResult, isNewUser: true };
      }
      throw error;
    }
  }

  // Helper methods
  async verifyOTPRegister(mobile, otp, userType, userData) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType, userData })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }

  async verifyOTPLogin(mobile, otp, userType) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }
}

// Usage in React Native
const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [userType, setUserType] = useState('end-user');
  const [flowType, setFlowType] = useState('checking'); // 'checking', 'login', 'registration'
  const [existingUser, setExistingUser] = useState(null);
  
  const otpService = new EnhancedOTPService();

  const handlePhoneValidation = async () => {
    try {
      setFlowType('checking');
      
      // Step 1: Check phone registration status
      const phoneCheck = await otpService.checkPhoneRegistration(mobile, userType);
      
      if (phoneCheck.isRegistered) {
        // Phone exists - show login flow
        setFlowType('login');
        setExistingUser(phoneCheck.existingUser);
        // Request OTP for login
        await otpService.requestOTP(mobile, userType, 'login');
      } else {
        // Phone is new - show registration flow
        setFlowType('registration');
        // Request OTP for registration
        await otpService.requestOTP(mobile, userType, 'register');
      }
      
      setIsOTPSent(true);
    } catch (error) {
      Alert.alert('Error', error.message);
      setFlowType('checking');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (flowType === 'login') {
        // Existing user login
        const result = await otpService.verifyOTPLogin(mobile, otp, userType);
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        // Navigate to main app
      } else {
        // New user registration - show registration form
        setShowRegistrationForm(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const result = await otpService.verifyOTPRegister(mobile, otp, userType, userData);
      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      // Navigate to main app
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      
      <Picker
        selectedValue={userType}
        onValueChange={setUserType}
      >
        <Picker.Item label="End User" value="end-user" />
        <Picker.Item label="Partner" value="partner" />
      </Picker>

      {flowType === 'checking' && (
        <Button title="Check Phone Number" onPress={handlePhoneValidation} />
      )}

      {flowType === 'login' && existingUser && (
        <View style={styles.existingUserInfo}>
          <Text>Welcome back, {existingUser.name}!</Text>
          <Text>Email: {existingUser.email}</Text>
          <Text>Status: {existingUser.status}</Text>
        </View>
      )}

      {isOTPSent && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOTP} />
        </>
      )}
    </View>
  );
};
```

### OTP Security Features
- OTP expires in 5 minutes
- OTP can only be used once
- Rate limiting prevents OTP spam
- Admin can view all OTPs for manual copy during development
- OTPs are automatically cleaned up after expiration
- Phone validation prevents duplicate registrations
- Enhanced security with pre-registration phone checks

## Endpoints

### Authentication

#### Login to get token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@nearmate.local",
  "password": "admin123"
}
```

#### Request OTP for mobile number
```http
POST /auth/request-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Verify OTP for new user registration
```http
POST /auth/verify-otp-register
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user",
  "userData": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "dateOfBirth": "1995-09-17",  // optional
    "gender": "male"               // optional
  }
}
```

#### Verify OTP for existing user login
```http
POST /auth/verify-otp-login
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user"
}
```

#### Check phone number registration status
```http
POST /auth/check-phone-registration
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Check phone number registration status (GET method)
```http
GET /auth/check-phone/+919876543210/end-user
```

#### Admin: List recent OTPs (for manual copy)
```http
GET /auth/otps?limit=10
Authorization: Bearer <admin_token>
```

#### Admin: Clear expired OTPs
```http
DELETE /auth/otps/expired
Authorization: Bearer <admin_token>
```

### 0. End Users (Customers)

#### Create end user
```http
POST /end-users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "dateOfBirth": "1995-09-17",   // optional (YYYY-MM-DD)
  "gender": "male"               // optional (male|female|other)
}
```

Response:
```json
{
  "id": "<uuid>",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "status": "active",
  "createdAt": "2025-08-21T12:00:00.000Z",
  "updatedAt": "2025-08-21T12:00:00.000Z",
  "addresses": [],
  "bookings": [],
  "reviews": []
}
```

**Note**: For mobile app users, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp`
2. Verify OTP and register via `/auth/verify-otp-register`

This ensures secure mobile-based registration without requiring admin tokens.

#### List end users
```http
GET /end-users?search=rahul&page=1&limit=20
Authorization: Bearer <token>
```

Response:
```json
{
  "users": [
    {
      "id": "<uuid>",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+919876543210",
      "status": "active",
      "createdAt": "2025-08-21T12:00:00.000Z",
      "updatedAt": "2025-08-21T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

#### Get end user by ID
```http
GET /end-users/{id}
Authorization: Bearer <token>
```

#### Update end user
```http
PATCH /end-users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul K Sharma",
  "status": "active"
}
```

#### Delete end user
```http
DELETE /end-users/{id}
Authorization: Bearer <token>
```

### 1. Categories

#### Get all categories
```http
GET /categories
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "6cd1ed55-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "plumber",
    "label": "Plumber",
    "icon": "🛠️",
    "tone": "#E9EEF9",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  },
  {
    "id": "6cd21805-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "electrician",
    "label": "Electrician",
    "icon": "🔌",
    "tone": "#F4ECF7",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  }
]
```

### 2. Partners (Service Providers)

#### Get all partners
```http
GET /partners?search=john
Authorization: Bearer <token>
```

Query Parameters:
- `search` (optional): Search by name, email, or phone

Response:
```json
[
  {
    "id": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "name": "John Doe",
    "phone": "9990001111",
    "email": "john@example.com",
    "loginId": "JD000001",
    "status": "active",
    "serviceRadiusKm": 5,
    "isAvailable": true,
    "pricingType": "hourly",
    "priceMin": 200,
    "priceMax": 500,
    "plan": "Gold",
    "planStatus": "active",
    "boostActive": false,
    "boostStart": null,
    "boostEnd": null,
    "createdAt": "2025-08-19T13:50:12.704Z",
    "updatedAt": "2025-08-19T13:51:28.540Z",
    "categories": [
      {
        "id": "d054520d-db57-48ac-a05d-61f26757d905",
        "serviceCategory": {
          "id": "6cd220a7-7d03-11f0-9cdd-0ea6e67bf632",
          "key": "carpenter",
          "label": "Carpenter",
          "icon": "🪚"
        }
      }
    ],
    "kycs": [
      {
        "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
        "idType": "Aadhar Card",
        "idNumber": "XXXXXXXXX",
        "docUrl": "https://example.com/doc.pdf",
        "status": "verified",
        "createdAt": "2025-08-19T13:50:12.714Z"
      }
    ],
    "bank": {
      "id": "02643418-8d12-443c-930f-46eea5044ebc",
      "accountName": "John Doe",
      "accountNo": "1234567890",
      "ifsc": "HDFC0001234",
      "bankName": "HDFC Bank"
    }
  }
]
```

#### Get partner by ID
```http
GET /partners/{id}
Authorization: Bearer <token>
```

#### Create new partner
```http
POST /partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Partner",
  "phone": "9876543210",
  "email": "new@example.com",
  "categoryKeys": ["plumber", "electrician"],
  "serviceRadiusKm": 10,
  "isAvailable": true,
  "pricingType": "hourly",
  "priceMin": 150,
  "priceMax": 400,
  "plan": "Basic",
  "planStatus": "active",
  "boostActive": false,
  "boostStart": "2025-08-20T10:00:00Z",
  "boostEnd": "2025-08-20T18:00:00Z",
  "bank": {
    "accountName": "New Partner",
    "accountNo": "0987654321",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank"
  }
}
```

**Note**: For mobile app partners, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp` with `userType: "partner"`
2. Verify OTP and register via `/auth/verify-otp-register` with partner data

This ensures secure mobile-based registration without requiring admin tokens.

#### Update partner
```http
PATCH /partners/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isAvailable": false,
  "pricingType": "fixed",
  "priceMin": 200,
  "priceMax": 300
}
```

#### Delete partner
```http
DELETE /partners/{id}
Authorization: Bearer <token>
```

### 3. Partner KYC Management

#### Get partner's KYC documents
```http
GET /partners/{id}/kyc
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
    "partnerId": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "idType": "Aadhar Card",
    "idNumber": "XXXXXXXXX",
    "docUrl": "https://example.com/doc.pdf",
    "status": "verified",
    "createdAt": "2025-08-19T13:50:12.714Z",
    "updatedAt": "2025-08-19T13:50:12.714Z"
  }
]
```

#### Add new KYC document
```http
POST /partners/{id}/kyc
Authorization: Bearer <token>
Content-Type: application/json

{
  "idType": "Pan Card",
  "idNumber": "ABCDE1234F",
  "docUrl": "https://example.com/pan.pdf",
  "status": "pending"
}
```

#### Update KYC document
```http
PATCH /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified"
}
```

#### Delete KYC document
```http
DELETE /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
```

### 4. Users (Staff/Admin)

#### Get all users
```http
GET /users
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "db4121a6-707b-4289-83d9-5df53886a00a",
    "email": "admin@nearmate.local",
    "name": "Administrator",
    "role": "admin",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.690Z",
    "updatedAt": "2025-08-19T13:50:12.690Z"
  }
]
```

#### Get user by ID
```http
GET /users/{id}
Authorization: Bearer <token>
```

#### Create new user
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "staff@nearmate.local",
  "name": "Staff Member",
  "password": "password123",
  "role": "staff"
}
```

#### Update user
```http
PATCH /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Staff Name",
  "role": "admin"
}
```

#### Delete user
```http
DELETE /users/{id}
Authorization: Bearer <token>
```

### 5. Items

#### Get all items
```http
GET /items
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "item-id-1",
    "name": "Item Name",
    "description": "Item description",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.000Z",
    "updatedAt": "2025-08-19T13:50:12.000Z"
  }
]
```

#### Create item
```http
POST /items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Item",
  "description": "New item description"
}
```

#### Update item
```http
PATCH /items/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Item Name",
  "status": "inactive"
}
```

#### Delete item
```http
DELETE /items/{id}
Authorization: Bearer <token>
```

## Data Models

### Partner
```typescript
interface Partner {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loginId?: string;
  status: string;
  serviceRadiusKm: number;
  isAvailable: boolean;
  pricingType?: string;
  priceMin?: number;
  priceMax?: number;
  plan?: string;
  planStatus?: string;
  boostActive: boolean;
  boostStart?: Date;
  boostEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: PartnerCategory[];
  kycs: PartnerKyc[];
  bank?: PartnerBank;
}
```

### PartnerKyc
```typescript
interface PartnerKyc {
  id: string;
  partnerId: string;
  idType?: string;
  idNumber?: string;
  docUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### PartnerBank
```typescript
interface PartnerBank {
  id: string;
  partnerId: string;
  accountName?: string;
  accountNo?: string;
  ifsc?: string;
  bankName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ServiceCategory
```typescript
interface ServiceCategory {
  id: string;
  key: string;
  label: string;
  icon?: string;
  tone?: string;
  popular: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### OTPCode
```typescript
interface OTPCode {
  id: string;
  mobile: string;
  otp: string;
  userType: 'end-user' | 'partner';
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Name is required",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Partner not found",
  "error": "Not Found"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Email or phone already exists",
  "error": "Conflict"
}
```

## Frontend Integration Examples

### React/JavaScript
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  }
  throw new Error('Login failed');
};

// Get partners with auth
const getPartners = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to fetch partners');
};

// Create partner
const createPartner = async (partnerData) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(partnerData)
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to create partner');
};
```

### Mobile App (React Native)
```javascript
// API base configuration
const API_BASE = 'http://localhost:4000/api/v1';

// API client with auth
const apiClient = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired, redirect to login
      await AsyncStorage.removeItem('accessToken');
      // Navigate to login screen
      return;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
  
  // Partner methods
  partners: {
    list: (search) => apiClient.request(`/partners${search ? `?search=${search}` : ''}`),
    get: (id) => apiClient.request(`/partners/${id}`),
    create: (data) => apiClient.request('/partners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiClient.request(`/partners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiClient.request(`/partners/${id}`, { method: 'DELETE' })
  },
  
  // KYC methods
  kyc: {
    list: (partnerId) => apiClient.request(`/partners/${partnerId}/kyc`),
    create: (partnerId, data) => apiClient.request(`/partners/${partnerId}/kyc`, { method: 'POST', body: JSON.stringify(data) }),
    update: (partnerId, kycId, data) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (partnerId, kycId) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'DELETE' })
  }
};

// Usage
const loadPartners = async () => {
  try {
    const partners = await apiClient.partners.list();
    setPartners(partners);
  } catch (error) {
    console.error('Failed to load partners:', error);
  }
};
```

### Enhanced OTP Flow with Phone Validation

The new phone validation endpoints allow you to create a better user experience by checking phone registration status before proceeding with OTP flows.

#### Complete Mobile App Flow
```javascript
// Enhanced OTP Service with Phone Validation
class EnhancedOTPService {
  constructor() {
    this.API_BASE = 'http://localhost:4000/api/v1';
  }

  // Step 1: Check phone registration status
  async checkPhoneRegistration(mobile, userType) {
    const response = await fetch(`${this.API_BASE}/auth/check-phone-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check phone registration');
    }
    
    return response.json();
  }

  // Step 2: Request OTP based on phone status
  async requestOTP(mobile, userType, purpose = 'login') {
    const response = await fetch(`${this.API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType, purpose })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }
    
    return response.json();
  }

  // Step 3: Complete authentication
  async completeAuthentication(mobile, otp, userType, userData = null) {
    try {
      // Try login first
      const loginResult = await this.verifyOTPLogin(mobile, otp, userType);
      return { ...loginResult, isNewUser: false };
    } catch (error) {
      if (error.message.includes('User not found') && userData) {
        // User doesn't exist, proceed with registration
        const registerResult = await this.verifyOTPRegister(mobile, otp, userType, userData);
        return { ...registerResult, isNewUser: true };
      }
      throw error;
    }
  }

  // Helper methods
  async verifyOTPRegister(mobile, otp, userType, userData) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType, userData })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }

  async verifyOTPLogin(mobile, otp, userType) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }
}

// Usage in React Native
const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [userType, setUserType] = useState('end-user');
  const [flowType, setFlowType] = useState('checking'); // 'checking', 'login', 'registration'
  const [existingUser, setExistingUser] = useState(null);
  
  const otpService = new EnhancedOTPService();

  const handlePhoneValidation = async () => {
    try {
      setFlowType('checking');
      
      // Step 1: Check phone registration status
      const phoneCheck = await otpService.checkPhoneRegistration(mobile, userType);
      
      if (phoneCheck.isRegistered) {
        // Phone exists - show login flow
        setFlowType('login');
        setExistingUser(phoneCheck.existingUser);
        // Request OTP for login
        await otpService.requestOTP(mobile, userType, 'login');
      } else {
        // Phone is new - show registration flow
        setFlowType('registration');
        // Request OTP for registration
        await otpService.requestOTP(mobile, userType, 'register');
      }
      
      setIsOTPSent(true);
    } catch (error) {
      Alert.alert('Error', error.message);
      setFlowType('checking');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (flowType === 'login') {
        // Existing user login
        const result = await otpService.verifyOTPLogin(mobile, otp, userType);
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        // Navigate to main app
      } else {
        // New user registration - show registration form
        setShowRegistrationForm(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const result = await otpService.verifyOTPRegister(mobile, otp, userType, userData);
      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      // Navigate to main app
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      
      <Picker
        selectedValue={userType}
        onValueChange={setUserType}
      >
        <Picker.Item label="End User" value="end-user" />
        <Picker.Item label="Partner" value="partner" />
      </Picker>

      {flowType === 'checking' && (
        <Button title="Check Phone Number" onPress={handlePhoneValidation} />
      )}

      {flowType === 'login' && existingUser && (
        <View style={styles.existingUserInfo}>
          <Text>Welcome back, {existingUser.name}!</Text>
          <Text>Email: {existingUser.email}</Text>
          <Text>Status: {existingUser.status}</Text>
        </View>
      )}

      {isOTPSent && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOTP} />
        </>
      )}
    </View>
  );
};
```

### OTP Security Features
- OTP expires in 5 minutes
- OTP can only be used once
- Rate limiting prevents OTP spam
- Admin can view all OTPs for manual copy during development
- OTPs are automatically cleaned up after expiration
- Phone validation prevents duplicate registrations
- Enhanced security with pre-registration phone checks

## Endpoints

### Authentication

#### Login to get token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@nearmate.local",
  "password": "admin123"
}
```

#### Request OTP for mobile number
```http
POST /auth/request-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Verify OTP for new user registration
```http
POST /auth/verify-otp-register
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user",
  "userData": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "dateOfBirth": "1995-09-17",  // optional
    "gender": "male"               // optional
  }
}
```

#### Verify OTP for existing user login
```http
POST /auth/verify-otp-login
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user"
}
```

#### Check phone number registration status
```http
POST /auth/check-phone-registration
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Check phone number registration status (GET method)
```http
GET /auth/check-phone/+919876543210/end-user
```

#### Admin: List recent OTPs (for manual copy)
```http
GET /auth/otps?limit=10
Authorization: Bearer <admin_token>
```

#### Admin: Clear expired OTPs
```http
DELETE /auth/otps/expired
Authorization: Bearer <admin_token>
```

### 0. End Users (Customers)

#### Create end user
```http
POST /end-users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "dateOfBirth": "1995-09-17",   // optional (YYYY-MM-DD)
  "gender": "male"               // optional (male|female|other)
}
```

Response:
```json
{
  "id": "<uuid>",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "status": "active",
  "createdAt": "2025-08-21T12:00:00.000Z",
  "updatedAt": "2025-08-21T12:00:00.000Z",
  "addresses": [],
  "bookings": [],
  "reviews": []
}
```

**Note**: For mobile app users, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp`
2. Verify OTP and register via `/auth/verify-otp-register`

This ensures secure mobile-based registration without requiring admin tokens.

#### List end users
```http
GET /end-users?search=rahul&page=1&limit=20
Authorization: Bearer <token>
```

Response:
```json
{
  "users": [
    {
      "id": "<uuid>",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+919876543210",
      "status": "active",
      "createdAt": "2025-08-21T12:00:00.000Z",
      "updatedAt": "2025-08-21T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

#### Get end user by ID
```http
GET /end-users/{id}
Authorization: Bearer <token>
```

#### Update end user
```http
PATCH /end-users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul K Sharma",
  "status": "active"
}
```

#### Delete end user
```http
DELETE /end-users/{id}
Authorization: Bearer <token>
```

### 1. Categories

#### Get all categories
```http
GET /categories
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "6cd1ed55-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "plumber",
    "label": "Plumber",
    "icon": "🛠️",
    "tone": "#E9EEF9",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  },
  {
    "id": "6cd21805-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "electrician",
    "label": "Electrician",
    "icon": "🔌",
    "tone": "#F4ECF7",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  }
]
```

### 2. Partners (Service Providers)

#### Get all partners
```http
GET /partners?search=john
Authorization: Bearer <token>
```

Query Parameters:
- `search` (optional): Search by name, email, or phone

Response:
```json
[
  {
    "id": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "name": "John Doe",
    "phone": "9990001111",
    "email": "john@example.com",
    "loginId": "JD000001",
    "status": "active",
    "serviceRadiusKm": 5,
    "isAvailable": true,
    "pricingType": "hourly",
    "priceMin": 200,
    "priceMax": 500,
    "plan": "Gold",
    "planStatus": "active",
    "boostActive": false,
    "boostStart": null,
    "boostEnd": null,
    "createdAt": "2025-08-19T13:50:12.704Z",
    "updatedAt": "2025-08-19T13:51:28.540Z",
    "categories": [
      {
        "id": "d054520d-db57-48ac-a05d-61f26757d905",
        "serviceCategory": {
          "id": "6cd220a7-7d03-11f0-9cdd-0ea6e67bf632",
          "key": "carpenter",
          "label": "Carpenter",
          "icon": "🪚"
        }
      }
    ],
    "kycs": [
      {
        "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
        "idType": "Aadhar Card",
        "idNumber": "XXXXXXXXX",
        "docUrl": "https://example.com/doc.pdf",
        "status": "verified",
        "createdAt": "2025-08-19T13:50:12.714Z"
      }
    ],
    "bank": {
      "id": "02643418-8d12-443c-930f-46eea5044ebc",
      "accountName": "John Doe",
      "accountNo": "1234567890",
      "ifsc": "HDFC0001234",
      "bankName": "HDFC Bank"
    }
  }
]
```

#### Get partner by ID
```http
GET /partners/{id}
Authorization: Bearer <token>
```

#### Create new partner
```http
POST /partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Partner",
  "phone": "9876543210",
  "email": "new@example.com",
  "categoryKeys": ["plumber", "electrician"],
  "serviceRadiusKm": 10,
  "isAvailable": true,
  "pricingType": "hourly",
  "priceMin": 150,
  "priceMax": 400,
  "plan": "Basic",
  "planStatus": "active",
  "boostActive": false,
  "boostStart": "2025-08-20T10:00:00Z",
  "boostEnd": "2025-08-20T18:00:00Z",
  "bank": {
    "accountName": "New Partner",
    "accountNo": "0987654321",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank"
  }
}
```

**Note**: For mobile app partners, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp` with `userType: "partner"`
2. Verify OTP and register via `/auth/verify-otp-register` with partner data

This ensures secure mobile-based registration without requiring admin tokens.

#### Update partner
```http
PATCH /partners/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isAvailable": false,
  "pricingType": "fixed",
  "priceMin": 200,
  "priceMax": 300
}
```

#### Delete partner
```http
DELETE /partners/{id}
Authorization: Bearer <token>
```

### 3. Partner KYC Management

#### Get partner's KYC documents
```http
GET /partners/{id}/kyc
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
    "partnerId": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "idType": "Aadhar Card",
    "idNumber": "XXXXXXXXX",
    "docUrl": "https://example.com/doc.pdf",
    "status": "verified",
    "createdAt": "2025-08-19T13:50:12.714Z",
    "updatedAt": "2025-08-19T13:50:12.714Z"
  }
]
```

#### Add new KYC document
```http
POST /partners/{id}/kyc
Authorization: Bearer <token>
Content-Type: application/json

{
  "idType": "Pan Card",
  "idNumber": "ABCDE1234F",
  "docUrl": "https://example.com/pan.pdf",
  "status": "pending"
}
```

#### Update KYC document
```http
PATCH /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified"
}
```

#### Delete KYC document
```http
DELETE /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
```

### 4. Users (Staff/Admin)

#### Get all users
```http
GET /users
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "db4121a6-707b-4289-83d9-5df53886a00a",
    "email": "admin@nearmate.local",
    "name": "Administrator",
    "role": "admin",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.690Z",
    "updatedAt": "2025-08-19T13:50:12.690Z"
  }
]
```

#### Get user by ID
```http
GET /users/{id}
Authorization: Bearer <token>
```

#### Create new user
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "staff@nearmate.local",
  "name": "Staff Member",
  "password": "password123",
  "role": "staff"
}
```

#### Update user
```http
PATCH /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Staff Name",
  "role": "admin"
}
```

#### Delete user
```http
DELETE /users/{id}
Authorization: Bearer <token>
```

### 5. Items

#### Get all items
```http
GET /items
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "item-id-1",
    "name": "Item Name",
    "description": "Item description",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.000Z",
    "updatedAt": "2025-08-19T13:50:12.000Z"
  }
]
```

#### Create item
```http
POST /items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Item",
  "description": "New item description"
}
```

#### Update item
```http
PATCH /items/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Item Name",
  "status": "inactive"
}
```

#### Delete item
```http
DELETE /items/{id}
Authorization: Bearer <token>
```

## Data Models

### Partner
```typescript
interface Partner {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loginId?: string;
  status: string;
  serviceRadiusKm: number;
  isAvailable: boolean;
  pricingType?: string;
  priceMin?: number;
  priceMax?: number;
  plan?: string;
  planStatus?: string;
  boostActive: boolean;
  boostStart?: Date;
  boostEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: PartnerCategory[];
  kycs: PartnerKyc[];
  bank?: PartnerBank;
}
```

### PartnerKyc
```typescript
interface PartnerKyc {
  id: string;
  partnerId: string;
  idType?: string;
  idNumber?: string;
  docUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### PartnerBank
```typescript
interface PartnerBank {
  id: string;
  partnerId: string;
  accountName?: string;
  accountNo?: string;
  ifsc?: string;
  bankName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ServiceCategory
```typescript
interface ServiceCategory {
  id: string;
  key: string;
  label: string;
  icon?: string;
  tone?: string;
  popular: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### OTPCode
```typescript
interface OTPCode {
  id: string;
  mobile: string;
  otp: string;
  userType: 'end-user' | 'partner';
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Name is required",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Partner not found",
  "error": "Not Found"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Email or phone already exists",
  "error": "Conflict"
}
```

## Frontend Integration Examples

### React/JavaScript
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  }
  throw new Error('Login failed');
};

// Get partners with auth
const getPartners = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to fetch partners');
};

// Create partner
const createPartner = async (partnerData) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(partnerData)
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to create partner');
};
```

### Mobile App (React Native)
```javascript
// API base configuration
const API_BASE = 'http://localhost:4000/api/v1';

// API client with auth
const apiClient = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired, redirect to login
      await AsyncStorage.removeItem('accessToken');
      // Navigate to login screen
      return;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
  
  // Partner methods
  partners: {
    list: (search) => apiClient.request(`/partners${search ? `?search=${search}` : ''}`),
    get: (id) => apiClient.request(`/partners/${id}`),
    create: (data) => apiClient.request('/partners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiClient.request(`/partners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiClient.request(`/partners/${id}`, { method: 'DELETE' })
  },
  
  // KYC methods
  kyc: {
    list: (partnerId) => apiClient.request(`/partners/${partnerId}/kyc`),
    create: (partnerId, data) => apiClient.request(`/partners/${partnerId}/kyc`, { method: 'POST', body: JSON.stringify(data) }),
    update: (partnerId, kycId, data) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (partnerId, kycId) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'DELETE' })
  }
};

// Usage
const loadPartners = async () => {
  try {
    const partners = await apiClient.partners.list();
    setPartners(partners);
  } catch (error) {
    console.error('Failed to load partners:', error);
  }
};
```

### Enhanced OTP Flow with Phone Validation

The new phone validation endpoints allow you to create a better user experience by checking phone registration status before proceeding with OTP flows.

#### Complete Mobile App Flow
```javascript
// Enhanced OTP Service with Phone Validation
class EnhancedOTPService {
  constructor() {
    this.API_BASE = 'http://localhost:4000/api/v1';
  }

  // Step 1: Check phone registration status
  async checkPhoneRegistration(mobile, userType) {
    const response = await fetch(`${this.API_BASE}/auth/check-phone-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check phone registration');
    }
    
    return response.json();
  }

  // Step 2: Request OTP based on phone status
  async requestOTP(mobile, userType, purpose = 'login') {
    const response = await fetch(`${this.API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType, purpose })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }
    
    return response.json();
  }

  // Step 3: Complete authentication
  async completeAuthentication(mobile, otp, userType, userData = null) {
    try {
      // Try login first
      const loginResult = await this.verifyOTPLogin(mobile, otp, userType);
      return { ...loginResult, isNewUser: false };
    } catch (error) {
      if (error.message.includes('User not found') && userData) {
        // User doesn't exist, proceed with registration
        const registerResult = await this.verifyOTPRegister(mobile, otp, userType, userData);
        return { ...registerResult, isNewUser: true };
      }
      throw error;
    }
  }

  // Helper methods
  async verifyOTPRegister(mobile, otp, userType, userData) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType, userData })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }

  async verifyOTPLogin(mobile, otp, userType) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }
}

// Usage in React Native
const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [userType, setUserType] = useState('end-user');
  const [flowType, setFlowType] = useState('checking'); // 'checking', 'login', 'registration'
  const [existingUser, setExistingUser] = useState(null);
  
  const otpService = new EnhancedOTPService();

  const handlePhoneValidation = async () => {
    try {
      setFlowType('checking');
      
      // Step 1: Check phone registration status
      const phoneCheck = await otpService.checkPhoneRegistration(mobile, userType);
      
      if (phoneCheck.isRegistered) {
        // Phone exists - show login flow
        setFlowType('login');
        setExistingUser(phoneCheck.existingUser);
        // Request OTP for login
        await otpService.requestOTP(mobile, userType, 'login');
      } else {
        // Phone is new - show registration flow
        setFlowType('registration');
        // Request OTP for registration
        await otpService.requestOTP(mobile, userType, 'register');
      }
      
      setIsOTPSent(true);
    } catch (error) {
      Alert.alert('Error', error.message);
      setFlowType('checking');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (flowType === 'login') {
        // Existing user login
        const result = await otpService.verifyOTPLogin(mobile, otp, userType);
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        // Navigate to main app
      } else {
        // New user registration - show registration form
        setShowRegistrationForm(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const result = await otpService.verifyOTPRegister(mobile, otp, userType, userData);
      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      // Navigate to main app
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      
      <Picker
        selectedValue={userType}
        onValueChange={setUserType}
      >
        <Picker.Item label="End User" value="end-user" />
        <Picker.Item label="Partner" value="partner" />
      </Picker>

      {flowType === 'checking' && (
        <Button title="Check Phone Number" onPress={handlePhoneValidation} />
      )}

      {flowType === 'login' && existingUser && (
        <View style={styles.existingUserInfo}>
          <Text>Welcome back, {existingUser.name}!</Text>
          <Text>Email: {existingUser.email}</Text>
          <Text>Status: {existingUser.status}</Text>
        </View>
      )}

      {isOTPSent && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOTP} />
        </>
      )}
    </View>
  );
};
```

### OTP Security Features
- OTP expires in 5 minutes
- OTP can only be used once
- Rate limiting prevents OTP spam
- Admin can view all OTPs for manual copy during development
- OTPs are automatically cleaned up after expiration
- Phone validation prevents duplicate registrations
- Enhanced security with pre-registration phone checks

## Endpoints

### Authentication

#### Login to get token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@nearmate.local",
  "password": "admin123"
}
```

#### Request OTP for mobile number
```http
POST /auth/request-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Verify OTP for new user registration
```http
POST /auth/verify-otp-register
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user",
  "userData": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "dateOfBirth": "1995-09-17",  // optional
    "gender": "male"               // optional
  }
}
```

#### Verify OTP for existing user login
```http
POST /auth/verify-otp-login
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user"
}
```

#### Check phone number registration status
```http
POST /auth/check-phone-registration
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Check phone number registration status (GET method)
```http
GET /auth/check-phone/+919876543210/end-user
```

#### Admin: List recent OTPs (for manual copy)
```http
GET /auth/otps?limit=10
Authorization: Bearer <admin_token>
```

#### Admin: Clear expired OTPs
```http
DELETE /auth/otps/expired
Authorization: Bearer <admin_token>
```

### 0. End Users (Customers)

#### Create end user
```http
POST /end-users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "dateOfBirth": "1995-09-17",   // optional (YYYY-MM-DD)
  "gender": "male"               // optional (male|female|other)
}
```

Response:
```json
{
  "id": "<uuid>",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "status": "active",
  "createdAt": "2025-08-21T12:00:00.000Z",
  "updatedAt": "2025-08-21T12:00:00.000Z",
  "addresses": [],
  "bookings": [],
  "reviews": []
}
```

**Note**: For mobile app users, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp`
2. Verify OTP and register via `/auth/verify-otp-register`

This ensures secure mobile-based registration without requiring admin tokens.

#### List end users
```http
GET /end-users?search=rahul&page=1&limit=20
Authorization: Bearer <token>
```

Response:
```json
{
  "users": [
    {
      "id": "<uuid>",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+919876543210",
      "status": "active",
      "createdAt": "2025-08-21T12:00:00.000Z",
      "updatedAt": "2025-08-21T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

#### Get end user by ID
```http
GET /end-users/{id}
Authorization: Bearer <token>
```

#### Update end user
```http
PATCH /end-users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul K Sharma",
  "status": "active"
}
```

#### Delete end user
```http
DELETE /end-users/{id}
Authorization: Bearer <token>
```

### 1. Categories

#### Get all categories
```http
GET /categories
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "6cd1ed55-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "plumber",
    "label": "Plumber",
    "icon": "🛠️",
    "tone": "#E9EEF9",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  },
  {
    "id": "6cd21805-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "electrician",
    "label": "Electrician",
    "icon": "🔌",
    "tone": "#F4ECF7",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  }
]
```

### 2. Partners (Service Providers)

#### Get all partners
```http
GET /partners?search=john
Authorization: Bearer <token>
```

Query Parameters:
- `search` (optional): Search by name, email, or phone

Response:
```json
[
  {
    "id": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "name": "John Doe",
    "phone": "9990001111",
    "email": "john@example.com",
    "loginId": "JD000001",
    "status": "active",
    "serviceRadiusKm": 5,
    "isAvailable": true,
    "pricingType": "hourly",
    "priceMin": 200,
    "priceMax": 500,
    "plan": "Gold",
    "planStatus": "active",
    "boostActive": false,
    "boostStart": null,
    "boostEnd": null,
    "createdAt": "2025-08-19T13:50:12.704Z",
    "updatedAt": "2025-08-19T13:51:28.540Z",
    "categories": [
      {
        "id": "d054520d-db57-48ac-a05d-61f26757d905",
        "serviceCategory": {
          "id": "6cd220a7-7d03-11f0-9cdd-0ea6e67bf632",
          "key": "carpenter",
          "label": "Carpenter",
          "icon": "🪚"
        }
      }
    ],
    "kycs": [
      {
        "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
        "idType": "Aadhar Card",
        "idNumber": "XXXXXXXXX",
        "docUrl": "https://example.com/doc.pdf",
        "status": "verified",
        "createdAt": "2025-08-19T13:50:12.714Z"
      }
    ],
    "bank": {
      "id": "02643418-8d12-443c-930f-46eea5044ebc",
      "accountName": "John Doe",
      "accountNo": "1234567890",
      "ifsc": "HDFC0001234",
      "bankName": "HDFC Bank"
    }
  }
]
```

#### Get partner by ID
```http
GET /partners/{id}
Authorization: Bearer <token>
```

#### Create new partner
```http
POST /partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Partner",
  "phone": "9876543210",
  "email": "new@example.com",
  "categoryKeys": ["plumber", "electrician"],
  "serviceRadiusKm": 10,
  "isAvailable": true,
  "pricingType": "hourly",
  "priceMin": 150,
  "priceMax": 400,
  "plan": "Basic",
  "planStatus": "active",
  "boostActive": false,
  "boostStart": "2025-08-20T10:00:00Z",
  "boostEnd": "2025-08-20T18:00:00Z",
  "bank": {
    "accountName": "New Partner",
    "accountNo": "0987654321",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank"
  }
}
```

**Note**: For mobile app partners, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp` with `userType: "partner"`
2. Verify OTP and register via `/auth/verify-otp-register` with partner data

This ensures secure mobile-based registration without requiring admin tokens.

#### Update partner
```http
PATCH /partners/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isAvailable": false,
  "pricingType": "fixed",
  "priceMin": 200,
  "priceMax": 300
}
```

#### Delete partner
```http
DELETE /partners/{id}
Authorization: Bearer <token>
```

### 3. Partner KYC Management

#### Get partner's KYC documents
```http
GET /partners/{id}/kyc
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
    "partnerId": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "idType": "Aadhar Card",
    "idNumber": "XXXXXXXXX",
    "docUrl": "https://example.com/doc.pdf",
    "status": "verified",
    "createdAt": "2025-08-19T13:50:12.714Z",
    "updatedAt": "2025-08-19T13:50:12.714Z"
  }
]
```

#### Add new KYC document
```http
POST /partners/{id}/kyc
Authorization: Bearer <token>
Content-Type: application/json

{
  "idType": "Pan Card",
  "idNumber": "ABCDE1234F",
  "docUrl": "https://example.com/pan.pdf",
  "status": "pending"
}
```

#### Update KYC document
```http
PATCH /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified"
}
```

#### Delete KYC document
```http
DELETE /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
```

### 4. Users (Staff/Admin)

#### Get all users
```http
GET /users
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "db4121a6-707b-4289-83d9-5df53886a00a",
    "email": "admin@nearmate.local",
    "name": "Administrator",
    "role": "admin",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.690Z",
    "updatedAt": "2025-08-19T13:50:12.690Z"
  }
]
```

#### Get user by ID
```http
GET /users/{id}
Authorization: Bearer <token>
```

#### Create new user
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "staff@nearmate.local",
  "name": "Staff Member",
  "password": "password123",
  "role": "staff"
}
```

#### Update user
```http
PATCH /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Staff Name",
  "role": "admin"
}
```

#### Delete user
```http
DELETE /users/{id}
Authorization: Bearer <token>
```

### 5. Items

#### Get all items
```http
GET /items
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "item-id-1",
    "name": "Item Name",
    "description": "Item description",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.000Z",
    "updatedAt": "2025-08-19T13:50:12.000Z"
  }
]
```

#### Create item
```http
POST /items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Item",
  "description": "New item description"
}
```

#### Update item
```http
PATCH /items/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Item Name",
  "status": "inactive"
}
```

#### Delete item
```http
DELETE /items/{id}
Authorization: Bearer <token>
```

## Data Models

### Partner
```typescript
interface Partner {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loginId?: string;
  status: string;
  serviceRadiusKm: number;
  isAvailable: boolean;
  pricingType?: string;
  priceMin?: number;
  priceMax?: number;
  plan?: string;
  planStatus?: string;
  boostActive: boolean;
  boostStart?: Date;
  boostEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: PartnerCategory[];
  kycs: PartnerKyc[];
  bank?: PartnerBank;
}
```

### PartnerKyc
```typescript
interface PartnerKyc {
  id: string;
  partnerId: string;
  idType?: string;
  idNumber?: string;
  docUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### PartnerBank
```typescript
interface PartnerBank {
  id: string;
  partnerId: string;
  accountName?: string;
  accountNo?: string;
  ifsc?: string;
  bankName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ServiceCategory
```typescript
interface ServiceCategory {
  id: string;
  key: string;
  label: string;
  icon?: string;
  tone?: string;
  popular: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### OTPCode
```typescript
interface OTPCode {
  id: string;
  mobile: string;
  otp: string;
  userType: 'end-user' | 'partner';
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Name is required",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Partner not found",
  "error": "Not Found"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Email or phone already exists",
  "error": "Conflict"
}
```

## Frontend Integration Examples

### React/JavaScript
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  }
  throw new Error('Login failed');
};

// Get partners with auth
const getPartners = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to fetch partners');
};

// Create partner
const createPartner = async (partnerData) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(partnerData)
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to create partner');
};
```

### Mobile App (React Native)
```javascript
// API base configuration
const API_BASE = 'http://localhost:4000/api/v1';

// API client with auth
const apiClient = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired, redirect to login
      await AsyncStorage.removeItem('accessToken');
      // Navigate to login screen
      return;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
  
  // Partner methods
  partners: {
    list: (search) => apiClient.request(`/partners${search ? `?search=${search}` : ''}`),
    get: (id) => apiClient.request(`/partners/${id}`),
    create: (data) => apiClient.request('/partners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiClient.request(`/partners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiClient.request(`/partners/${id}`, { method: 'DELETE' })
  },
  
  // KYC methods
  kyc: {
    list: (partnerId) => apiClient.request(`/partners/${partnerId}/kyc`),
    create: (partnerId, data) => apiClient.request(`/partners/${partnerId}/kyc`, { method: 'POST', body: JSON.stringify(data) }),
    update: (partnerId, kycId, data) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (partnerId, kycId) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'DELETE' })
  }
};

// Usage
const loadPartners = async () => {
  try {
    const partners = await apiClient.partners.list();
    setPartners(partners);
  } catch (error) {
    console.error('Failed to load partners:', error);
  }
};
```

### Enhanced OTP Flow with Phone Validation

The new phone validation endpoints allow you to create a better user experience by checking phone registration status before proceeding with OTP flows.

#### Complete Mobile App Flow
```javascript
// Enhanced OTP Service with Phone Validation
class EnhancedOTPService {
  constructor() {
    this.API_BASE = 'http://localhost:4000/api/v1';
  }

  // Step 1: Check phone registration status
  async checkPhoneRegistration(mobile, userType) {
    const response = await fetch(`${this.API_BASE}/auth/check-phone-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check phone registration');
    }
    
    return response.json();
  }

  // Step 2: Request OTP based on phone status
  async requestOTP(mobile, userType, purpose = 'login') {
    const response = await fetch(`${this.API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType, purpose })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }
    
    return response.json();
  }

  // Step 3: Complete authentication
  async completeAuthentication(mobile, otp, userType, userData = null) {
    try {
      // Try login first
      const loginResult = await this.verifyOTPLogin(mobile, otp, userType);
      return { ...loginResult, isNewUser: false };
    } catch (error) {
      if (error.message.includes('User not found') && userData) {
        // User doesn't exist, proceed with registration
        const registerResult = await this.verifyOTPRegister(mobile, otp, userType, userData);
        return { ...registerResult, isNewUser: true };
      }
      throw error;
    }
  }

  // Helper methods
  async verifyOTPRegister(mobile, otp, userType, userData) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType, userData })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }

  async verifyOTPLogin(mobile, otp, userType) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }
}

// Usage in React Native
const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [userType, setUserType] = useState('end-user');
  const [flowType, setFlowType] = useState('checking'); // 'checking', 'login', 'registration'
  const [existingUser, setExistingUser] = useState(null);
  
  const otpService = new EnhancedOTPService();

  const handlePhoneValidation = async () => {
    try {
      setFlowType('checking');
      
      // Step 1: Check phone registration status
      const phoneCheck = await otpService.checkPhoneRegistration(mobile, userType);
      
      if (phoneCheck.isRegistered) {
        // Phone exists - show login flow
        setFlowType('login');
        setExistingUser(phoneCheck.existingUser);
        // Request OTP for login
        await otpService.requestOTP(mobile, userType, 'login');
      } else {
        // Phone is new - show registration flow
        setFlowType('registration');
        // Request OTP for registration
        await otpService.requestOTP(mobile, userType, 'register');
      }
      
      setIsOTPSent(true);
    } catch (error) {
      Alert.alert('Error', error.message);
      setFlowType('checking');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (flowType === 'login') {
        // Existing user login
        const result = await otpService.verifyOTPLogin(mobile, otp, userType);
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        // Navigate to main app
      } else {
        // New user registration - show registration form
        setShowRegistrationForm(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const result = await otpService.verifyOTPRegister(mobile, otp, userType, userData);
      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      // Navigate to main app
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      
      <Picker
        selectedValue={userType}
        onValueChange={setUserType}
      >
        <Picker.Item label="End User" value="end-user" />
        <Picker.Item label="Partner" value="partner" />
      </Picker>

      {flowType === 'checking' && (
        <Button title="Check Phone Number" onPress={handlePhoneValidation} />
      )}

      {flowType === 'login' && existingUser && (
        <View style={styles.existingUserInfo}>
          <Text>Welcome back, {existingUser.name}!</Text>
          <Text>Email: {existingUser.email}</Text>
          <Text>Status: {existingUser.status}</Text>
        </View>
      )}

      {isOTPSent && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOTP} />
        </>
      )}
    </View>
  );
};
```

### OTP Security Features
- OTP expires in 5 minutes
- OTP can only be used once
- Rate limiting prevents OTP spam
- Admin can view all OTPs for manual copy during development
- OTPs are automatically cleaned up after expiration
- Phone validation prevents duplicate registrations
- Enhanced security with pre-registration phone checks

## Endpoints

### Authentication

#### Login to get token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@nearmate.local",
  "password": "admin123"
}
```

#### Request OTP for mobile number
```http
POST /auth/request-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Verify OTP for new user registration
```http
POST /auth/verify-otp-register
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user",
  "userData": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "dateOfBirth": "1995-09-17",  // optional
    "gender": "male"               // optional
  }
}
```

#### Verify OTP for existing user login
```http
POST /auth/verify-otp-login
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user"
}
```

#### Check phone number registration status
```http
POST /auth/check-phone-registration
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Check phone number registration status (GET method)
```http
GET /auth/check-phone/+919876543210/end-user
```

#### Admin: List recent OTPs (for manual copy)
```http
GET /auth/otps?limit=10
Authorization: Bearer <admin_token>
```

#### Admin: Clear expired OTPs
```http
DELETE /auth/otps/expired
Authorization: Bearer <admin_token>
```

### 0. End Users (Customers)

#### Create end user
```http
POST /end-users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "dateOfBirth": "1995-09-17",   // optional (YYYY-MM-DD)
  "gender": "male"               // optional (male|female|other)
}
```

Response:
```json
{
  "id": "<uuid>",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "status": "active",
  "createdAt": "2025-08-21T12:00:00.000Z",
  "updatedAt": "2025-08-21T12:00:00.000Z",
  "addresses": [],
  "bookings": [],
  "reviews": []
}
```

**Note**: For mobile app users, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp`
2. Verify OTP and register via `/auth/verify-otp-register`

This ensures secure mobile-based registration without requiring admin tokens.

#### List end users
```http
GET /end-users?search=rahul&page=1&limit=20
Authorization: Bearer <token>
```

Response:
```json
{
  "users": [
    {
      "id": "<uuid>",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+919876543210",
      "status": "active",
      "createdAt": "2025-08-21T12:00:00.000Z",
      "updatedAt": "2025-08-21T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

#### Get end user by ID
```http
GET /end-users/{id}
Authorization: Bearer <token>
```

#### Update end user
```http
PATCH /end-users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul K Sharma",
  "status": "active"
}
```

#### Delete end user
```http
DELETE /end-users/{id}
Authorization: Bearer <token>
```

### 1. Categories

#### Get all categories
```http
GET /categories
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "6cd1ed55-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "plumber",
    "label": "Plumber",
    "icon": "🛠️",
    "tone": "#E9EEF9",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  },
  {
    "id": "6cd21805-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "electrician",
    "label": "Electrician",
    "icon": "🔌",
    "tone": "#F4ECF7",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  }
]
```

### 2. Partners (Service Providers)

#### Get all partners
```http
GET /partners?search=john
Authorization: Bearer <token>
```

Query Parameters:
- `search` (optional): Search by name, email, or phone

Response:
```json
[
  {
    "id": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "name": "John Doe",
    "phone": "9990001111",
    "email": "john@example.com",
    "loginId": "JD000001",
    "status": "active",
    "serviceRadiusKm": 5,
    "isAvailable": true,
    "pricingType": "hourly",
    "priceMin": 200,
    "priceMax": 500,
    "plan": "Gold",
    "planStatus": "active",
    "boostActive": false,
    "boostStart": null,
    "boostEnd": null,
    "createdAt": "2025-08-19T13:50:12.704Z",
    "updatedAt": "2025-08-19T13:51:28.540Z",
    "categories": [
      {
        "id": "d054520d-db57-48ac-a05d-61f26757d905",
        "serviceCategory": {
          "id": "6cd220a7-7d03-11f0-9cdd-0ea6e67bf632",
          "key": "carpenter",
          "label": "Carpenter",
          "icon": "🪚"
        }
      }
    ],
    "kycs": [
      {
        "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
        "idType": "Aadhar Card",
        "idNumber": "XXXXXXXXX",
        "docUrl": "https://example.com/doc.pdf",
        "status": "verified",
        "createdAt": "2025-08-19T13:50:12.714Z"
      }
    ],
    "bank": {
      "id": "02643418-8d12-443c-930f-46eea5044ebc",
      "accountName": "John Doe",
      "accountNo": "1234567890",
      "ifsc": "HDFC0001234",
      "bankName": "HDFC Bank"
    }
  }
]
```

#### Get partner by ID
```http
GET /partners/{id}
Authorization: Bearer <token>
```

#### Create new partner
```http
POST /partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Partner",
  "phone": "9876543210",
  "email": "new@example.com",
  "categoryKeys": ["plumber", "electrician"],
  "serviceRadiusKm": 10,
  "isAvailable": true,
  "pricingType": "hourly",
  "priceMin": 150,
  "priceMax": 400,
  "plan": "Basic",
  "planStatus": "active",
  "boostActive": false,
  "boostStart": "2025-08-20T10:00:00Z",
  "boostEnd": "2025-08-20T18:00:00Z",
  "bank": {
    "accountName": "New Partner",
    "accountNo": "0987654321",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank"
  }
}
```

**Note**: For mobile app partners, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp` with `userType: "partner"`
2. Verify OTP and register via `/auth/verify-otp-register` with partner data

This ensures secure mobile-based registration without requiring admin tokens.

#### Update partner
```http
PATCH /partners/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isAvailable": false,
  "pricingType": "fixed",
  "priceMin": 200,
  "priceMax": 300
}
```

#### Delete partner
```http
DELETE /partners/{id}
Authorization: Bearer <token>
```

### 3. Partner KYC Management

#### Get partner's KYC documents
```http
GET /partners/{id}/kyc
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
    "partnerId": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "idType": "Aadhar Card",
    "idNumber": "XXXXXXXXX",
    "docUrl": "https://example.com/doc.pdf",
    "status": "verified",
    "createdAt": "2025-08-19T13:50:12.714Z",
    "updatedAt": "2025-08-19T13:50:12.714Z"
  }
]
```

#### Add new KYC document
```http
POST /partners/{id}/kyc
Authorization: Bearer <token>
Content-Type: application/json

{
  "idType": "Pan Card",
  "idNumber": "ABCDE1234F",
  "docUrl": "https://example.com/pan.pdf",
  "status": "pending"
}
```

#### Update KYC document
```http
PATCH /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified"
}
```

#### Delete KYC document
```http
DELETE /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
```

### 4. Users (Staff/Admin)

#### Get all users
```http
GET /users
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "db4121a6-707b-4289-83d9-5df53886a00a",
    "email": "admin@nearmate.local",
    "name": "Administrator",
    "role": "admin",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.690Z",
    "updatedAt": "2025-08-19T13:50:12.690Z"
  }
]
```

#### Get user by ID
```http
GET /users/{id}
Authorization: Bearer <token>
```

#### Create new user
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "staff@nearmate.local",
  "name": "Staff Member",
  "password": "password123",
  "role": "staff"
}
```

#### Update user
```http
PATCH /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Staff Name",
  "role": "admin"
}
```

#### Delete user
```http
DELETE /users/{id}
Authorization: Bearer <token>
```

### 5. Items

#### Get all items
```http
GET /items
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "item-id-1",
    "name": "Item Name",
    "description": "Item description",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.000Z",
    "updatedAt": "2025-08-19T13:50:12.000Z"
  }
]
```

#### Create item
```http
POST /items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Item",
  "description": "New item description"
}
```

#### Update item
```http
PATCH /items/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Item Name",
  "status": "inactive"
}
```

#### Delete item
```http
DELETE /items/{id}
Authorization: Bearer <token>
```

## Data Models

### Partner
```typescript
interface Partner {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loginId?: string;
  status: string;
  serviceRadiusKm: number;
  isAvailable: boolean;
  pricingType?: string;
  priceMin?: number;
  priceMax?: number;
  plan?: string;
  planStatus?: string;
  boostActive: boolean;
  boostStart?: Date;
  boostEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: PartnerCategory[];
  kycs: PartnerKyc[];
  bank?: PartnerBank;
}
```

### PartnerKyc
```typescript
interface PartnerKyc {
  id: string;
  partnerId: string;
  idType?: string;
  idNumber?: string;
  docUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### PartnerBank
```typescript
interface PartnerBank {
  id: string;
  partnerId: string;
  accountName?: string;
  accountNo?: string;
  ifsc?: string;
  bankName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ServiceCategory
```typescript
interface ServiceCategory {
  id: string;
  key: string;
  label: string;
  icon?: string;
  tone?: string;
  popular: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### OTPCode
```typescript
interface OTPCode {
  id: string;
  mobile: string;
  otp: string;
  userType: 'end-user' | 'partner';
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Name is required",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Partner not found",
  "error": "Not Found"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Email or phone already exists",
  "error": "Conflict"
}
```

## Frontend Integration Examples

### React/JavaScript
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  }
  throw new Error('Login failed');
};

// Get partners with auth
const getPartners = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to fetch partners');
};

// Create partner
const createPartner = async (partnerData) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(partnerData)
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to create partner');
};
```

### Mobile App (React Native)
```javascript
// API base configuration
const API_BASE = 'http://localhost:4000/api/v1';

// API client with auth
const apiClient = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired, redirect to login
      await AsyncStorage.removeItem('accessToken');
      // Navigate to login screen
      return;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
  
  // Partner methods
  partners: {
    list: (search) => apiClient.request(`/partners${search ? `?search=${search}` : ''}`),
    get: (id) => apiClient.request(`/partners/${id}`),
    create: (data) => apiClient.request('/partners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiClient.request(`/partners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiClient.request(`/partners/${id}`, { method: 'DELETE' })
  },
  
  // KYC methods
  kyc: {
    list: (partnerId) => apiClient.request(`/partners/${partnerId}/kyc`),
    create: (partnerId, data) => apiClient.request(`/partners/${partnerId}/kyc`, { method: 'POST', body: JSON.stringify(data) }),
    update: (partnerId, kycId, data) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (partnerId, kycId) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'DELETE' })
  }
};

// Usage
const loadPartners = async () => {
  try {
    const partners = await apiClient.partners.list();
    setPartners(partners);
  } catch (error) {
    console.error('Failed to load partners:', error);
  }
};
```

### Enhanced OTP Flow with Phone Validation

The new phone validation endpoints allow you to create a better user experience by checking phone registration status before proceeding with OTP flows.

#### Complete Mobile App Flow
```javascript
// Enhanced OTP Service with Phone Validation
class EnhancedOTPService {
  constructor() {
    this.API_BASE = 'http://localhost:4000/api/v1';
  }

  // Step 1: Check phone registration status
  async checkPhoneRegistration(mobile, userType) {
    const response = await fetch(`${this.API_BASE}/auth/check-phone-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check phone registration');
    }
    
    return response.json();
  }

  // Step 2: Request OTP based on phone status
  async requestOTP(mobile, userType, purpose = 'login') {
    const response = await fetch(`${this.API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType, purpose })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }
    
    return response.json();
  }

  // Step 3: Complete authentication
  async completeAuthentication(mobile, otp, userType, userData = null) {
    try {
      // Try login first
      const loginResult = await this.verifyOTPLogin(mobile, otp, userType);
      return { ...loginResult, isNewUser: false };
    } catch (error) {
      if (error.message.includes('User not found') && userData) {
        // User doesn't exist, proceed with registration
        const registerResult = await this.verifyOTPRegister(mobile, otp, userType, userData);
        return { ...registerResult, isNewUser: true };
      }
      throw error;
    }
  }

  // Helper methods
  async verifyOTPRegister(mobile, otp, userType, userData) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType, userData })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }

  async verifyOTPLogin(mobile, otp, userType) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }
}

// Usage in React Native
const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [userType, setUserType] = useState('end-user');
  const [flowType, setFlowType] = useState('checking'); // 'checking', 'login', 'registration'
  const [existingUser, setExistingUser] = useState(null);
  
  const otpService = new EnhancedOTPService();

  const handlePhoneValidation = async () => {
    try {
      setFlowType('checking');
      
      // Step 1: Check phone registration status
      const phoneCheck = await otpService.checkPhoneRegistration(mobile, userType);
      
      if (phoneCheck.isRegistered) {
        // Phone exists - show login flow
        setFlowType('login');
        setExistingUser(phoneCheck.existingUser);
        // Request OTP for login
        await otpService.requestOTP(mobile, userType, 'login');
      } else {
        // Phone is new - show registration flow
        setFlowType('registration');
        // Request OTP for registration
        await otpService.requestOTP(mobile, userType, 'register');
      }
      
      setIsOTPSent(true);
    } catch (error) {
      Alert.alert('Error', error.message);
      setFlowType('checking');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (flowType === 'login') {
        // Existing user login
        const result = await otpService.verifyOTPLogin(mobile, otp, userType);
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        // Navigate to main app
      } else {
        // New user registration - show registration form
        setShowRegistrationForm(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const result = await otpService.verifyOTPRegister(mobile, otp, userType, userData);
      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      // Navigate to main app
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      
      <Picker
        selectedValue={userType}
        onValueChange={setUserType}
      >
        <Picker.Item label="End User" value="end-user" />
        <Picker.Item label="Partner" value="partner" />
      </Picker>

      {flowType === 'checking' && (
        <Button title="Check Phone Number" onPress={handlePhoneValidation} />
      )}

      {flowType === 'login' && existingUser && (
        <View style={styles.existingUserInfo}>
          <Text>Welcome back, {existingUser.name}!</Text>
          <Text>Email: {existingUser.email}</Text>
          <Text>Status: {existingUser.status}</Text>
        </View>
      )}

      {isOTPSent && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOTP} />
        </>
      )}
    </View>
  );
};
```

### OTP Security Features
- OTP expires in 5 minutes
- OTP can only be used once
- Rate limiting prevents OTP spam
- Admin can view all OTPs for manual copy during development
- OTPs are automatically cleaned up after expiration
- Phone validation prevents duplicate registrations
- Enhanced security with pre-registration phone checks

## Endpoints

### Authentication

#### Login to get token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@nearmate.local",
  "password": "admin123"
}
```

#### Request OTP for mobile number
```http
POST /auth/request-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Verify OTP for new user registration
```http
POST /auth/verify-otp-register
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user",
  "userData": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "dateOfBirth": "1995-09-17",  // optional
    "gender": "male"               // optional
  }
}
```

#### Verify OTP for existing user login
```http
POST /auth/verify-otp-login
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user"
}
```

#### Check phone number registration status
```http
POST /auth/check-phone-registration
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Check phone number registration status (GET method)
```http
GET /auth/check-phone/+919876543210/end-user
```

#### Admin: List recent OTPs (for manual copy)
```http
GET /auth/otps?limit=10
Authorization: Bearer <admin_token>
```

#### Admin: Clear expired OTPs
```http
DELETE /auth/otps/expired
Authorization: Bearer <admin_token>
```

### 0. End Users (Customers)

#### Create end user
```http
POST /end-users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "dateOfBirth": "1995-09-17",   // optional (YYYY-MM-DD)
  "gender": "male"               // optional (male|female|other)
}
```

Response:
```json
{
  "id": "<uuid>",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "status": "active",
  "createdAt": "2025-08-21T12:00:00.000Z",
  "updatedAt": "2025-08-21T12:00:00.000Z",
  "addresses": [],
  "bookings": [],
  "reviews": []
}
```

**Note**: For mobile app users, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp`
2. Verify OTP and register via `/auth/verify-otp-register`

This ensures secure mobile-based registration without requiring admin tokens.

#### List end users
```http
GET /end-users?search=rahul&page=1&limit=20
Authorization: Bearer <token>
```

Response:
```json
{
  "users": [
    {
      "id": "<uuid>",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+919876543210",
      "status": "active",
      "createdAt": "2025-08-21T12:00:00.000Z",
      "updatedAt": "2025-08-21T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

#### Get end user by ID
```http
GET /end-users/{id}
Authorization: Bearer <token>
```

#### Update end user
```http
PATCH /end-users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul K Sharma",
  "status": "active"
}
```

#### Delete end user
```http
DELETE /end-users/{id}
Authorization: Bearer <token>
```

### 1. Categories

#### Get all categories
```http
GET /categories
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "6cd1ed55-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "plumber",
    "label": "Plumber",
    "icon": "🛠️",
    "tone": "#E9EEF9",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  },
  {
    "id": "6cd21805-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "electrician",
    "label": "Electrician",
    "icon": "🔌",
    "tone": "#F4ECF7",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  }
]
```

### 2. Partners (Service Providers)

#### Get all partners
```http
GET /partners?search=john
Authorization: Bearer <token>
```

Query Parameters:
- `search` (optional): Search by name, email, or phone

Response:
```json
[
  {
    "id": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "name": "John Doe",
    "phone": "9990001111",
    "email": "john@example.com",
    "loginId": "JD000001",
    "status": "active",
    "serviceRadiusKm": 5,
    "isAvailable": true,
    "pricingType": "hourly",
    "priceMin": 200,
    "priceMax": 500,
    "plan": "Gold",
    "planStatus": "active",
    "boostActive": false,
    "boostStart": null,
    "boostEnd": null,
    "createdAt": "2025-08-19T13:50:12.704Z",
    "updatedAt": "2025-08-19T13:51:28.540Z",
    "categories": [
      {
        "id": "d054520d-db57-48ac-a05d-61f26757d905",
        "serviceCategory": {
          "id": "6cd220a7-7d03-11f0-9cdd-0ea6e67bf632",
          "key": "carpenter",
          "label": "Carpenter",
          "icon": "🪚"
        }
      }
    ],
    "kycs": [
      {
        "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
        "idType": "Aadhar Card",
        "idNumber": "XXXXXXXXX",
        "docUrl": "https://example.com/doc.pdf",
        "status": "verified",
        "createdAt": "2025-08-19T13:50:12.714Z"
      }
    ],
    "bank": {
      "id": "02643418-8d12-443c-930f-46eea5044ebc",
      "accountName": "John Doe",
      "accountNo": "1234567890",
      "ifsc": "HDFC0001234",
      "bankName": "HDFC Bank"
    }
  }
]
```

#### Get partner by ID
```http
GET /partners/{id}
Authorization: Bearer <token>
```

#### Create new partner
```http
POST /partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Partner",
  "phone": "9876543210",
  "email": "new@example.com",
  "categoryKeys": ["plumber", "electrician"],
  "serviceRadiusKm": 10,
  "isAvailable": true,
  "pricingType": "hourly",
  "priceMin": 150,
  "priceMax": 400,
  "plan": "Basic",
  "planStatus": "active",
  "boostActive": false,
  "boostStart": "2025-08-20T10:00:00Z",
  "boostEnd": "2025-08-20T18:00:00Z",
  "bank": {
    "accountName": "New Partner",
    "accountNo": "0987654321",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank"
  }
}
```

**Note**: For mobile app partners, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp` with `userType: "partner"`
2. Verify OTP and register via `/auth/verify-otp-register` with partner data

This ensures secure mobile-based registration without requiring admin tokens.

#### Update partner
```http
PATCH /partners/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isAvailable": false,
  "pricingType": "fixed",
  "priceMin": 200,
  "priceMax": 300
}
```

#### Delete partner
```http
DELETE /partners/{id}
Authorization: Bearer <token>
```

### 3. Partner KYC Management

#### Get partner's KYC documents
```http
GET /partners/{id}/kyc
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
    "partnerId": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "idType": "Aadhar Card",
    "idNumber": "XXXXXXXXX",
    "docUrl": "https://example.com/doc.pdf",
    "status": "verified",
    "createdAt": "2025-08-19T13:50:12.714Z",
    "updatedAt": "2025-08-19T13:50:12.714Z"
  }
]
```

#### Add new KYC document
```http
POST /partners/{id}/kyc
Authorization: Bearer <token>
Content-Type: application/json

{
  "idType": "Pan Card",
  "idNumber": "ABCDE1234F",
  "docUrl": "https://example.com/pan.pdf",
  "status": "pending"
}
```

#### Update KYC document
```http
PATCH /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified"
}
```

#### Delete KYC document
```http
DELETE /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
```

### 4. Users (Staff/Admin)

#### Get all users
```http
GET /users
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "db4121a6-707b-4289-83d9-5df53886a00a",
    "email": "admin@nearmate.local",
    "name": "Administrator",
    "role": "admin",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.690Z",
    "updatedAt": "2025-08-19T13:50:12.690Z"
  }
]
```

#### Get user by ID
```http
GET /users/{id}
Authorization: Bearer <token>
```

#### Create new user
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "staff@nearmate.local",
  "name": "Staff Member",
  "password": "password123",
  "role": "staff"
}
```

#### Update user
```http
PATCH /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Staff Name",
  "role": "admin"
}
```

#### Delete user
```http
DELETE /users/{id}
Authorization: Bearer <token>
```

### 5. Items

#### Get all items
```http
GET /items
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "item-id-1",
    "name": "Item Name",
    "description": "Item description",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.000Z",
    "updatedAt": "2025-08-19T13:50:12.000Z"
  }
]
```

#### Create item
```http
POST /items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Item",
  "description": "New item description"
}
```

#### Update item
```http
PATCH /items/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Item Name",
  "status": "inactive"
}
```

#### Delete item
```http
DELETE /items/{id}
Authorization: Bearer <token>
```

## Data Models

### Partner
```typescript
interface Partner {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loginId?: string;
  status: string;
  serviceRadiusKm: number;
  isAvailable: boolean;
  pricingType?: string;
  priceMin?: number;
  priceMax?: number;
  plan?: string;
  planStatus?: string;
  boostActive: boolean;
  boostStart?: Date;
  boostEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: PartnerCategory[];
  kycs: PartnerKyc[];
  bank?: PartnerBank;
}
```

### PartnerKyc
```typescript
interface PartnerKyc {
  id: string;
  partnerId: string;
  idType?: string;
  idNumber?: string;
  docUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### PartnerBank
```typescript
interface PartnerBank {
  id: string;
  partnerId: string;
  accountName?: string;
  accountNo?: string;
  ifsc?: string;
  bankName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ServiceCategory
```typescript
interface ServiceCategory {
  id: string;
  key: string;
  label: string;
  icon?: string;
  tone?: string;
  popular: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### OTPCode
```typescript
interface OTPCode {
  id: string;
  mobile: string;
  otp: string;
  userType: 'end-user' | 'partner';
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Name is required",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Partner not found",
  "error": "Not Found"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Email or phone already exists",
  "error": "Conflict"
}
```

## Frontend Integration Examples

### React/JavaScript
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  }
  throw new Error('Login failed');
};

// Get partners with auth
const getPartners = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to fetch partners');
};

// Create partner
const createPartner = async (partnerData) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(partnerData)
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to create partner');
};
```

### Mobile App (React Native)
```javascript
// API base configuration
const API_BASE = 'http://localhost:4000/api/v1';

// API client with auth
const apiClient = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired, redirect to login
      await AsyncStorage.removeItem('accessToken');
      // Navigate to login screen
      return;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
  
  // Partner methods
  partners: {
    list: (search) => apiClient.request(`/partners${search ? `?search=${search}` : ''}`),
    get: (id) => apiClient.request(`/partners/${id}`),
    create: (data) => apiClient.request('/partners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiClient.request(`/partners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiClient.request(`/partners/${id}`, { method: 'DELETE' })
  },
  
  // KYC methods
  kyc: {
    list: (partnerId) => apiClient.request(`/partners/${partnerId}/kyc`),
    create: (partnerId, data) => apiClient.request(`/partners/${partnerId}/kyc`, { method: 'POST', body: JSON.stringify(data) }),
    update: (partnerId, kycId, data) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (partnerId, kycId) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'DELETE' })
  }
};

// Usage
const loadPartners = async () => {
  try {
    const partners = await apiClient.partners.list();
    setPartners(partners);
  } catch (error) {
    console.error('Failed to load partners:', error);
  }
};
```

### Enhanced OTP Flow with Phone Validation

The new phone validation endpoints allow you to create a better user experience by checking phone registration status before proceeding with OTP flows.

#### Complete Mobile App Flow
```javascript
// Enhanced OTP Service with Phone Validation
class EnhancedOTPService {
  constructor() {
    this.API_BASE = 'http://localhost:4000/api/v1';
  }

  // Step 1: Check phone registration status
  async checkPhoneRegistration(mobile, userType) {
    const response = await fetch(`${this.API_BASE}/auth/check-phone-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check phone registration');
    }
    
    return response.json();
  }

  // Step 2: Request OTP based on phone status
  async requestOTP(mobile, userType, purpose = 'login') {
    const response = await fetch(`${this.API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType, purpose })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }
    
    return response.json();
  }

  // Step 3: Complete authentication
  async completeAuthentication(mobile, otp, userType, userData = null) {
    try {
      // Try login first
      const loginResult = await this.verifyOTPLogin(mobile, otp, userType);
      return { ...loginResult, isNewUser: false };
    } catch (error) {
      if (error.message.includes('User not found') && userData) {
        // User doesn't exist, proceed with registration
        const registerResult = await this.verifyOTPRegister(mobile, otp, userType, userData);
        return { ...registerResult, isNewUser: true };
      }
      throw error;
    }
  }

  // Helper methods
  async verifyOTPRegister(mobile, otp, userType, userData) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType, userData })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }

  async verifyOTPLogin(mobile, otp, userType) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }
}

// Usage in React Native
const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [userType, setUserType] = useState('end-user');
  const [flowType, setFlowType] = useState('checking'); // 'checking', 'login', 'registration'
  const [existingUser, setExistingUser] = useState(null);
  
  const otpService = new EnhancedOTPService();

  const handlePhoneValidation = async () => {
    try {
      setFlowType('checking');
      
      // Step 1: Check phone registration status
      const phoneCheck = await otpService.checkPhoneRegistration(mobile, userType);
      
      if (phoneCheck.isRegistered) {
        // Phone exists - show login flow
        setFlowType('login');
        setExistingUser(phoneCheck.existingUser);
        // Request OTP for login
        await otpService.requestOTP(mobile, userType, 'login');
      } else {
        // Phone is new - show registration flow
        setFlowType('registration');
        // Request OTP for registration
        await otpService.requestOTP(mobile, userType, 'register');
      }
      
      setIsOTPSent(true);
    } catch (error) {
      Alert.alert('Error', error.message);
      setFlowType('checking');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (flowType === 'login') {
        // Existing user login
        const result = await otpService.verifyOTPLogin(mobile, otp, userType);
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        // Navigate to main app
      } else {
        // New user registration - show registration form
        setShowRegistrationForm(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const result = await otpService.verifyOTPRegister(mobile, otp, userType, userData);
      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      // Navigate to main app
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      
      <Picker
        selectedValue={userType}
        onValueChange={setUserType}
      >
        <Picker.Item label="End User" value="end-user" />
        <Picker.Item label="Partner" value="partner" />
      </Picker>

      {flowType === 'checking' && (
        <Button title="Check Phone Number" onPress={handlePhoneValidation} />
      )}

      {flowType === 'login' && existingUser && (
        <View style={styles.existingUserInfo}>
          <Text>Welcome back, {existingUser.name}!</Text>
          <Text>Email: {existingUser.email}</Text>
          <Text>Status: {existingUser.status}</Text>
        </View>
      )}

      {isOTPSent && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOTP} />
        </>
      )}
    </View>
  );
};
```

### OTP Security Features
- OTP expires in 5 minutes
- OTP can only be used once
- Rate limiting prevents OTP spam
- Admin can view all OTPs for manual copy during development
- OTPs are automatically cleaned up after expiration
- Phone validation prevents duplicate registrations
- Enhanced security with pre-registration phone checks

## Endpoints

### Authentication

#### Login to get token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@nearmate.local",
  "password": "admin123"
}
```

#### Request OTP for mobile number
```http
POST /auth/request-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Verify OTP for new user registration
```http
POST /auth/verify-otp-register
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user",
  "userData": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "dateOfBirth": "1995-09-17",  // optional
    "gender": "male"               // optional
  }
}
```

#### Verify OTP for existing user login
```http
POST /auth/verify-otp-login
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user"
}
```

#### Check phone number registration status
```http
POST /auth/check-phone-registration
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Check phone number registration status (GET method)
```http
GET /auth/check-phone/+919876543210/end-user
```

#### Admin: List recent OTPs (for manual copy)
```http
GET /auth/otps?limit=10
Authorization: Bearer <admin_token>
```

#### Admin: Clear expired OTPs
```http
DELETE /auth/otps/expired
Authorization: Bearer <admin_token>
```

### 0. End Users (Customers)

#### Create end user
```http
POST /end-users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "dateOfBirth": "1995-09-17",   // optional (YYYY-MM-DD)
  "gender": "male"               // optional (male|female|other)
}
```

Response:
```json
{
  "id": "<uuid>",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "status": "active",
  "createdAt": "2025-08-21T12:00:00.000Z",
  "updatedAt": "2025-08-21T12:00:00.000Z",
  "addresses": [],
  "bookings": [],
  "reviews": []
}
```

**Note**: For mobile app users, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp`
2. Verify OTP and register via `/auth/verify-otp-register`

This ensures secure mobile-based registration without requiring admin tokens.

#### List end users
```http
GET /end-users?search=rahul&page=1&limit=20
Authorization: Bearer <token>
```

Response:
```json
{
  "users": [
    {
      "id": "<uuid>",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+919876543210",
      "status": "active",
      "createdAt": "2025-08-21T12:00:00.000Z",
      "updatedAt": "2025-08-21T12:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
}
```

#### Get end user by ID
```http
GET /end-users/{id}
Authorization: Bearer <token>
```

#### Update end user
```http
PATCH /end-users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul K Sharma",
  "status": "active"
}
```

#### Delete end user
```http
DELETE /end-users/{id}
Authorization: Bearer <token>
```

### 1. Categories

#### Get all categories
```http
GET /categories
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "6cd1ed55-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "plumber",
    "label": "Plumber",
    "icon": "🛠️",
    "tone": "#E9EEF9",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  },
  {
    "id": "6cd21805-7d03-11f0-9cdd-0ea6e67bf632",
    "key": "electrician",
    "label": "Electrician",
    "icon": "🔌",
    "tone": "#F4ECF7",
    "popular": false,
    "createdAt": "2025-08-19T13:50:11.255Z",
    "updatedAt": "2025-08-19T13:50:11.255Z"
  }
]
```

### 2. Partners (Service Providers)

#### Get all partners
```http
GET /partners?search=john
Authorization: Bearer <token>
```

Query Parameters:
- `search` (optional): Search by name, email, or phone

Response:
```json
[
  {
    "id": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "name": "John Doe",
    "phone": "9990001111",
    "email": "john@example.com",
    "loginId": "JD000001",
    "status": "active",
    "serviceRadiusKm": 5,
    "isAvailable": true,
    "pricingType": "hourly",
    "priceMin": 200,
    "priceMax": 500,
    "plan": "Gold",
    "planStatus": "active",
    "boostActive": false,
    "boostStart": null,
    "boostEnd": null,
    "createdAt": "2025-08-19T13:50:12.704Z",
    "updatedAt": "2025-08-19T13:51:28.540Z",
    "categories": [
      {
        "id": "d054520d-db57-48ac-a05d-61f26757d905",
        "serviceCategory": {
          "id": "6cd220a7-7d03-11f0-9cdd-0ea6e67bf632",
          "key": "carpenter",
          "label": "Carpenter",
          "icon": "🪚"
        }
      }
    ],
    "kycs": [
      {
        "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
        "idType": "Aadhar Card",
        "idNumber": "XXXXXXXXX",
        "docUrl": "https://example.com/doc.pdf",
        "status": "verified",
        "createdAt": "2025-08-19T13:50:12.714Z"
      }
    ],
    "bank": {
      "id": "02643418-8d12-443c-930f-46eea5044ebc",
      "accountName": "John Doe",
      "accountNo": "1234567890",
      "ifsc": "HDFC0001234",
      "bankName": "HDFC Bank"
    }
  }
]
```

#### Get partner by ID
```http
GET /partners/{id}
Authorization: Bearer <token>
```

#### Create new partner
```http
POST /partners
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Partner",
  "phone": "9876543210",
  "email": "new@example.com",
  "categoryKeys": ["plumber", "electrician"],
  "serviceRadiusKm": 10,
  "isAvailable": true,
  "pricingType": "hourly",
  "priceMin": 150,
  "priceMax": 400,
  "plan": "Basic",
  "planStatus": "active",
  "boostActive": false,
  "boostStart": "2025-08-20T10:00:00Z",
  "boostEnd": "2025-08-20T18:00:00Z",
  "bank": {
    "accountName": "New Partner",
    "accountNo": "0987654321",
    "ifsc": "SBIN0001234",
    "bankName": "State Bank"
  }
}
```

**Note**: For mobile app partners, use the OTP-based registration flow instead:
1. Request OTP via `/auth/request-otp` with `userType: "partner"`
2. Verify OTP and register via `/auth/verify-otp-register` with partner data

This ensures secure mobile-based registration without requiring admin tokens.

#### Update partner
```http
PATCH /partners/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "isAvailable": false,
  "pricingType": "fixed",
  "priceMin": 200,
  "priceMax": 300
}
```

#### Delete partner
```http
DELETE /partners/{id}
Authorization: Bearer <token>
```

### 3. Partner KYC Management

#### Get partner's KYC documents
```http
GET /partners/{id}/kyc
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "062eaa9d-2097-4c95-9503-de29febfdc17",
    "partnerId": "1a44b107-9de0-4b36-a422-0e564f386cfe",
    "idType": "Aadhar Card",
    "idNumber": "XXXXXXXXX",
    "docUrl": "https://example.com/doc.pdf",
    "status": "verified",
    "createdAt": "2025-08-19T13:50:12.714Z",
    "updatedAt": "2025-08-19T13:50:12.714Z"
  }
]
```

#### Add new KYC document
```http
POST /partners/{id}/kyc
Authorization: Bearer <token>
Content-Type: application/json

{
  "idType": "Pan Card",
  "idNumber": "ABCDE1234F",
  "docUrl": "https://example.com/pan.pdf",
  "status": "pending"
}
```

#### Update KYC document
```http
PATCH /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified"
}
```

#### Delete KYC document
```http
DELETE /partners/{id}/kyc/{kycId}
Authorization: Bearer <token>
```

### 4. Users (Staff/Admin)

#### Get all users
```http
GET /users
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "db4121a6-707b-4289-83d9-5df53886a00a",
    "email": "admin@nearmate.local",
    "name": "Administrator",
    "role": "admin",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.690Z",
    "updatedAt": "2025-08-19T13:50:12.690Z"
  }
]
```

#### Get user by ID
```http
GET /users/{id}
Authorization: Bearer <token>
```

#### Create new user
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "staff@nearmate.local",
  "name": "Staff Member",
  "password": "password123",
  "role": "staff"
}
```

#### Update user
```http
PATCH /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Staff Name",
  "role": "admin"
}
```

#### Delete user
```http
DELETE /users/{id}
Authorization: Bearer <token>
```

### 5. Items

#### Get all items
```http
GET /items
Authorization: Bearer <token>
```

Response:
```json
[
  {
    "id": "item-id-1",
    "name": "Item Name",
    "description": "Item description",
    "status": "active",
    "createdAt": "2025-08-19T13:50:12.000Z",
    "updatedAt": "2025-08-19T13:50:12.000Z"
  }
]
```

#### Create item
```http
POST /items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Item",
  "description": "New item description"
}
```

#### Update item
```http
PATCH /items/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Item Name",
  "status": "inactive"
}
```

#### Delete item
```http
DELETE /items/{id}
Authorization: Bearer <token>
```

## Data Models

### Partner
```typescript
interface Partner {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  loginId?: string;
  status: string;
  serviceRadiusKm: number;
  isAvailable: boolean;
  pricingType?: string;
  priceMin?: number;
  priceMax?: number;
  plan?: string;
  planStatus?: string;
  boostActive: boolean;
  boostStart?: Date;
  boostEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
  categories: PartnerCategory[];
  kycs: PartnerKyc[];
  bank?: PartnerBank;
}
```

### PartnerKyc
```typescript
interface PartnerKyc {
  id: string;
  partnerId: string;
  idType?: string;
  idNumber?: string;
  docUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### PartnerBank
```typescript
interface PartnerBank {
  id: string;
  partnerId: string;
  accountName?: string;
  accountNo?: string;
  ifsc?: string;
  bankName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ServiceCategory
```typescript
interface ServiceCategory {
  id: string;
  key: string;
  label: string;
  icon?: string;
  tone?: string;
  popular: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### OTPCode
```typescript
interface OTPCode {
  id: string;
  mobile: string;
  otp: string;
  userType: 'end-user' | 'partner';
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Name is required",
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Invalid token",
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Partner not found",
  "error": "Not Found"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "Email or phone already exists",
  "error": "Conflict"
}
```

## Frontend Integration Examples

### React/JavaScript
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  }
  throw new Error('Login failed');
};

// Get partners with auth
const getPartners = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to fetch partners');
};

// Create partner
const createPartner = async (partnerData) => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('http://localhost:4000/api/v1/partners', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(partnerData)
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to create partner');
};
```

### Mobile App (React Native)
```javascript
// API base configuration
const API_BASE = 'http://localhost:4000/api/v1';

// API client with auth
const apiClient = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired, redirect to login
      await AsyncStorage.removeItem('accessToken');
      // Navigate to login screen
      return;
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
  
  // Partner methods
  partners: {
    list: (search) => apiClient.request(`/partners${search ? `?search=${search}` : ''}`),
    get: (id) => apiClient.request(`/partners/${id}`),
    create: (data) => apiClient.request('/partners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiClient.request(`/partners/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiClient.request(`/partners/${id}`, { method: 'DELETE' })
  },
  
  // KYC methods
  kyc: {
    list: (partnerId) => apiClient.request(`/partners/${partnerId}/kyc`),
    create: (partnerId, data) => apiClient.request(`/partners/${partnerId}/kyc`, { method: 'POST', body: JSON.stringify(data) }),
    update: (partnerId, kycId, data) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (partnerId, kycId) => apiClient.request(`/partners/${partnerId}/kyc/${kycId}`, { method: 'DELETE' })
  }
};

// Usage
const loadPartners = async () => {
  try {
    const partners = await apiClient.partners.list();
    setPartners(partners);
  } catch (error) {
    console.error('Failed to load partners:', error);
  }
};
```

### Enhanced OTP Flow with Phone Validation

The new phone validation endpoints allow you to create a better user experience by checking phone registration status before proceeding with OTP flows.

#### Complete Mobile App Flow
```javascript
// Enhanced OTP Service with Phone Validation
class EnhancedOTPService {
  constructor() {
    this.API_BASE = 'http://localhost:4000/api/v1';
  }

  // Step 1: Check phone registration status
  async checkPhoneRegistration(mobile, userType) {
    const response = await fetch(`${this.API_BASE}/auth/check-phone-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check phone registration');
    }
    
    return response.json();
  }

  // Step 2: Request OTP based on phone status
  async requestOTP(mobile, userType, purpose = 'login') {
    const response = await fetch(`${this.API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, userType, purpose })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }
    
    return response.json();
  }

  // Step 3: Complete authentication
  async completeAuthentication(mobile, otp, userType, userData = null) {
    try {
      // Try login first
      const loginResult = await this.verifyOTPLogin(mobile, otp, userType);
      return { ...loginResult, isNewUser: false };
    } catch (error) {
      if (error.message.includes('User not found') && userData) {
        // User doesn't exist, proceed with registration
        const registerResult = await this.verifyOTPRegister(mobile, otp, userType, userData);
        return { ...registerResult, isNewUser: true };
      }
      throw error;
    }
  }

  // Helper methods
  async verifyOTPRegister(mobile, otp, userType, userData) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType, userData })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }

  async verifyOTPLogin(mobile, otp, userType) {
    const response = await fetch(`${this.API_BASE}/auth/verify-otp-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp, userType })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }
    
    return response.json();
  }
}

// Usage in React Native
const LoginScreen = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [userType, setUserType] = useState('end-user');
  const [flowType, setFlowType] = useState('checking'); // 'checking', 'login', 'registration'
  const [existingUser, setExistingUser] = useState(null);
  
  const otpService = new EnhancedOTPService();

  const handlePhoneValidation = async () => {
    try {
      setFlowType('checking');
      
      // Step 1: Check phone registration status
      const phoneCheck = await otpService.checkPhoneRegistration(mobile, userType);
      
      if (phoneCheck.isRegistered) {
        // Phone exists - show login flow
        setFlowType('login');
        setExistingUser(phoneCheck.existingUser);
        // Request OTP for login
        await otpService.requestOTP(mobile, userType, 'login');
      } else {
        // Phone is new - show registration flow
        setFlowType('registration');
        // Request OTP for registration
        await otpService.requestOTP(mobile, userType, 'register');
      }
      
      setIsOTPSent(true);
    } catch (error) {
      Alert.alert('Error', error.message);
      setFlowType('checking');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (flowType === 'login') {
        // Existing user login
        const result = await otpService.verifyOTPLogin(mobile, otp, userType);
        await AsyncStorage.setItem('accessToken', result.accessToken);
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        // Navigate to main app
      } else {
        // New user registration - show registration form
        setShowRegistrationForm(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const result = await otpService.verifyOTPRegister(mobile, otp, userType, userData);
      await AsyncStorage.setItem('accessToken', result.accessToken);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));
      // Navigate to main app
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      
      <Picker
        selectedValue={userType}
        onValueChange={setUserType}
      >
        <Picker.Item label="End User" value="end-user" />
        <Picker.Item label="Partner" value="partner" />
      </Picker>

      {flowType === 'checking' && (
        <Button title="Check Phone Number" onPress={handlePhoneValidation} />
      )}

      {flowType === 'login' && existingUser && (
        <View style={styles.existingUserInfo}>
          <Text>Welcome back, {existingUser.name}!</Text>
          <Text>Email: {existingUser.email}</Text>
          <Text>Status: {existingUser.status}</Text>
        </View>
      )}

      {isOTPSent && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <Button title="Verify OTP" onPress={handleVerifyOTP} />
        </>
      )}
    </View>
  );
};
```

### OTP Security Features
- OTP expires in 5 minutes
- OTP can only be used once
- Rate limiting prevents OTP spam
- Admin can view all OTPs for manual copy during development
- OTPs are automatically cleaned up after expiration
- Phone validation prevents duplicate registrations
- Enhanced security with pre-registration phone checks

## Endpoints

### Authentication

#### Login to get token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@nearmate.local",
  "password": "admin123"
}
```

#### Request OTP for mobile number
```http
POST /auth/request-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Verify OTP for new user registration
```http
POST /auth/verify-otp-register
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user",
  "userData": {
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "dateOfBirth": "1995-09-17",  // optional
    "gender": "male"               // optional
  }
}
```

#### Verify OTP for existing user login
```http
POST /auth/verify-otp-login
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "userType": "end-user"
}
```

#### Check phone number registration status
```http
POST /auth/check-phone-registration
Content-Type: application/json

{
  "mobile": "+919876543210",
  "userType": "end-user"  // "end-user" or "partner"
}
```

#### Check phone number registration status (GET method)
```http
GET /auth/check-phone/+919876543210/end-user
```

#### Admin: List recent OTPs (for manual copy)
```http
GET /auth/otps?limit=10
Authorization: Bearer <admin_token>
```

#### Admin: Clear expired OTPs
```http
DELETE /auth/otps/expired
Authorization: Bearer <admin_token>
```

### 0. End Users (Customers)

#### Create end user
```http
POST /end-users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "dateOfBirth": "1995-09-17",   // optional (YYYY-MM-DD)
  "gender": "male"               // optional (male|female|other)
}
```

Response:
```json
{
  "id": "<uuid>",
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "status": "active",
  "createdAt": "2025-08-21T12:00:00.000Z",
  "updatedAt": "2025-08-