# NearMate API Documentation

**Base URL:** `http://localhost:4000`  
**API Version:** `v1`  
**Swagger Docs:** `http://localhost:4000/api/docs`

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📱 Auth Endpoints

### Login
- **POST** `/api/v1/auth/login`
- **Body:** `{ "email": "string", "password": "string" }`
- **Response:** `{ user: {...}, accessToken: "string", refreshToken: "string" }`

### OTP Management
- **POST** `/api/v1/auth/request-otp`
- **Body:** `{ "mobile": "string", "userType": "string", "purpose": "string" }`

- **POST** `/api/v1/auth/verify-otp-register`
- **Body:** `{ "mobile": "string", "otp": "string", "userType": "string", "userData": "any" }`

- **POST** `/api/v1/auth/verify-otp-login`
- **Body:** `{ "mobile": "string", "otp": "string", "userType": "string" }`

### Mobile Login & Registration Check
- **POST** `/api/v1/auth/check-mobile-exists`
- **Body:** `{ "mobile": "string", "userType": "string" }`
- **Response:** `{ isRegistered: boolean, existingUser?: {...}, message: "string" }`

- **POST** `/api/v1/auth/login-with-mobile`
- **Body:** `{ "mobile": "string", "otp": "string", "userType": "string" }`
- **Response:** `{ user: {...}, accessToken: "string", refreshToken: "string", message: "string" }`

### Admin OTP Management (Protected)
- **GET** `/api/v1/auth/otps?limit=10`
- **DELETE** `/api/v1/auth/otps/expired`

---

## 👥 Users Management (Protected)

- **GET** `/api/v1/users?search=string`
- **GET** `/api/v1/users/:id`
- **POST** `/api/v1/users`
  - **Body:** `{ "email": "string", "name": "string", "password": "string", "role": "string" }`
- **PATCH** `/api/v1/users/:id`
  - **Body:** `{ "name": "string", "role": "string", "status": "string", "password": "string" }`
- **DELETE** `/api/v1/users/:id`

---

## 📦 Items Management (Protected)

- **GET** `/api/v1/items?search=string&skip=0&take=20`
- **GET** `/api/v1/items/:id`
- **POST** `/api/v1/items`
  - **Body:** `{ "name": "string", "description": "string" }`
- **PATCH** `/api/v1/items/:id`
  - **Body:** `{ "name": "string", "description": "string", "status": "string" }`
- **DELETE** `/api/v1/items/:id`

---

## 🏷️ Categories Management (Protected)

- **GET** `/api/v1/categories`
- **GET** `/api/v1/categories/:id`
- **POST** `/api/v1/categories`
  - **Body:** `{ "key": "string", "label": "string", "icon": "string", "tone": "string", "popular": boolean }`
- **PATCH** `/api/v1/categories/:id`
  - **Body:** `{ "key": "string", "label": "string", "icon": "string", "tone": "string", "popular": boolean }`
- **DELETE** `/api/v1/categories/:id`

---

## 🤝 Partners Management (Protected)

- **GET** `/api/v1/partners?search=string`
- **GET** `/api/v1/partners/:id`
- **POST** `/api/v1/partners`
  - **Body:** `{ "name": "string", "phone": "string", "email": "string", "categoryKeys": ["string"], "bank": {...}, "serviceRadiusKm": number, "isAvailable": boolean, "pricingType": "string", "priceMin": number, "priceMax": number, "plan": "string", "planStatus": "string", "boostActive": boolean, "boostStart": "string", "boostEnd": "string" }`
- **PATCH** `/api/v1/partners/:id`
  - **Body:** Same as POST (all fields optional)
- **DELETE** `/api/v1/partners/:id`

### Partner KYC Management
- **GET** `/api/v1/partners/:id/kyc`
- **POST** `/api/v1/partners/:id/kyc`
  - **Body:** `{ "idType": "string", "idNumber": "string", "status": "string", "docUrl": "string" }`
- **PATCH** `/api/v1/partners/:id/kyc/:kycId`
  - **Body:** Same as POST (all fields optional)
- **DELETE** `/api/v1/partners/:id/kyc/:kycId`

---

## 👤 End Users Management (Protected)

- **GET** `/api/v1/end-users?search=string&status=string&page=1&limit=20`
- **GET** `/api/v1/end-users/:id`
- **GET** `/api/v1/end-users/:id/stats`
- **POST** `/api/v1/end-users`
  - **Body:** `{ "email": "string", "phone": "string", "name": "string", "dateOfBirth": "string", "gender": "string" }`
- **PATCH** `/api/v1/end-users/:id`
  - **Body:** `{ "name": "string", "email": "string", "phone": "string", "dateOfBirth": "string", "gender": "string", "status": "string" }`
- **DELETE** `/api/v1/end-users/:id`

---

## 📍 End User Addresses (Protected)

- **GET** `/api/v1/end-users/:endUserId/addresses`
  - **Response:** `{ addresses: [...], count: number }`
  - **Features:** Returns all active addresses, ordered by default first, then by creation date

- **GET** `/api/v1/end-users/:endUserId/addresses/:id`
  - **Response:** Single address object
  - **Features:** Get specific address by ID

- **POST** `/api/v1/end-users/:endUserId/addresses`
  - **Body:** `{ "type": "string", "label": "string", "area": "string", "pincode": "string", "city": "string", "state": "string", "country": "string", "lat": number, "lng": number, "isDefault": boolean }`
  - **Response:** `{ message: "string", address: {...} }`
  - **Features:** Creates new address, automatically sets as default if first address

- **PATCH** `/api/v1/end-users/:endUserId/addresses/:id`
  - **Body:** Same as POST (all fields optional)
  - **Response:** `{ message: "string", address: {...} }`
  - **Features:** Updates existing address, handles default address logic

- **PATCH** `/api/v1/end-users/:endUserId/addresses/:id/set-default`
  - **Response:** `{ message: "string", address: {...} }`
  - **Features:** Sets address as default, automatically unsets other default addresses

- **DELETE** `/api/v1/end-users/:endUserId/addresses/:id`
  - **Response:** `{ message: "string" }`
  - **Features:** Soft delete (sets isActive to false), automatically sets new default if needed

---

## 📅 End User Bookings (Protected)

- **GET** `/api/v1/end-users/:endUserId/bookings?status=string&partnerId=string&categoryId=string&page=1&limit=20`
- **GET** `/api/v1/end-users/:endUserId/bookings/stats`
- **GET** `/api/v1/end-users/:endUserId/bookings/:id`
- **POST** `/api/v1/end-users/:endUserId/bookings`
  - **Body:** `{ "partnerId": "string", "categoryId": "string", "serviceDescription": "string", "scheduledDate": "string", "scheduledTime": "string", "priority": "string", "addressId": "string", "customAddress": "string", "lat": number, "lng": number, "quotedPrice": number }`
- **PATCH** `/api/v1/end-users/:endUserId/bookings/:id`
  - **Body:** `{ "serviceDescription": "string", "scheduledDate": "string", "scheduledTime": "string", "priority": "string", "status": "string", "quotedPrice": number, "finalPrice": number, "paymentStatus": "string" }`
- **DELETE** `/api/v1/end-users/:endUserId/bookings/:id`

---

## 💳 End User Billing (Protected)

- **GET** `/api/v1/end-users/:endUserId/billing?paymentStatus=string&paymentMethod=string&page=1&limit=20`
- **GET** `/api/v1/end-users/:endUserId/billing/stats`
- **GET** `/api/v1/end-users/:endUserId/billing/:id`
- **POST** `/api/v1/end-users/:endUserId/billing`
  - **Body:** `{ "bookingId": "string", "amount": number, "currency": "string", "taxAmount": number, "discountAmount": number, "paymentMethod": "string", "invoiceNumber": "string", "dueDate": "string" }`
- **PATCH** `/api/v1/end-users/:endUserId/billing/:id`
  - **Body:** `{ "amount": number, "taxAmount": number, "discountAmount": number, "paymentMethod": "string", "paymentStatus": "string", "transactionId": "string", "paidAt": "string", "invoiceNumber": "string", "dueDate": "string" }`
- **PATCH** `/api/v1/end-users/:endUserId/billing/:id/mark-paid`
  - **Body:** `{ "paymentMethod": "string", "transactionId": "string" }`

---

## 🚀 Getting Started

1. **Start the API server:**
   ```bash
   cd apps/api
   npm run start:dev
   ```

2. **Access Swagger documentation:**
   - Open: `http://localhost:4000/api/docs`

3. **Test endpoints:**
   - Use the provided `curl_examples.sh` file for testing
   - Or use Postman/Insomnia with the base URL: `http://localhost:4000`

---

## 📝 Notes

- All protected endpoints require JWT authentication
- Date fields should be in ISO format (YYYY-MM-DD)
- Boolean fields accept `true`/`false` values
- Number fields should be numeric values
- String fields should be trimmed and non-empty
- Pagination uses `page` and `limit` query parameters
- Search functionality is available on most list endpoints
