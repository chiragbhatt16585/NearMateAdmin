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

## Endpoints

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

## Testing the API

### Using cURL
```bash
# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nearmate.local","password":"admin123"}'

# Get partners (replace TOKEN with actual token)
curl -X GET http://localhost:4000/api/v1/partners \
  -H "Authorization: Bearer TOKEN"

# Create partner
curl -X POST http://localhost:4000/api/v1/partners \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Partner","phone":"1234567890"}'
```

### Using Postman
1. Import the collection
2. Set base URL: `http://localhost:4000/api/v1`
3. Login first to get token
4. Use token in Authorization header for other requests

## Notes
- All timestamps are in ISO 8601 format
- IDs are UUIDs
- Phone numbers should be in international format
- KYC status can be: `pending`, `verified`, `rejected`
- Plan status can be: `active`, `paused`, `expired`
- Pricing type can be: `hourly`, `fixed`
- Service radius is in kilometers
- Boost dates are optional datetime values
