# 🏠 Address API Implementation Guide

## Overview
This guide explains the complete Address API implementation for NearMate, allowing end users to manage multiple addresses with full CRUD operations.

---

## 🚀 API Endpoints

### Base URL
```
http://localhost:4000
```

### Address Management Endpoints

| Endpoint | Method | Purpose | Authentication |
|----------|--------|---------|----------------|
| `/api/v1/end-users/:endUserId/addresses` | GET | List all addresses | JWT Required |
| `/api/v1/end-users/:endUserId/addresses/:id` | GET | Get specific address | JWT Required |
| `/api/v1/end-users/:endUserId/addresses` | POST | Create new address | JWT Required |
| `/api/v1/end-users/:endUserId/addresses/:id` | PATCH | Update address | JWT Required |
| `/api/v1/end-users/:endUserId/addresses/:id/set-default` | PATCH | Set as default | JWT Required |
| `/api/v1/end-users/:endUserId/addresses/:id` | DELETE | Delete address | JWT Required |

---

## 📊 Data Models

### Address Schema
```typescript
interface EndUserAddress {
  id: string;
  endUserId: string;
  type: string;           // 'home', 'work', 'other'
  label: string;          // Custom label (e.g., "Primary Home", "Office")
  area: string;           // Area/Location (e.g., "Andheri West", "Bandra East")
  pincode: string;        // Pincode (e.g., "400058", "400050")
  city: string;           // City (e.g., "Mumbai", "Delhi")
  state: string;          // State (e.g., "Maharashtra", "Delhi")
  country: string;        // Defaults to "India"
  lat?: number;           // Optional latitude
  lng?: number;           // Optional longitude
  isDefault: boolean;     // Only one address can be default
  isActive: boolean;      // Soft delete flag
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Create Address Request
```typescript
interface CreateAddressRequest {
  type: string;
  label: string;
  area: string;
  pincode: string;
  city: string;
  state: string;
  country?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}
```

---

## 🔧 Backend Implementation

### 1. Controller (`end-user-addresses.controller.ts`)
```typescript
@Controller('api/v1/end-users/:endUserId/addresses')
@UseGuards(JwtAuthGuard)
export class EndUserAddressesController {
  // GET / - List all addresses
  @Get()
  async getAddresses(@Param('endUserId') endUserId: string)
  
  // GET /:id - Get specific address
  @Get(':id')
  async getAddress(@Param('endUserId') endUserId: string, @Param('id') addressId: string)
  
  // POST / - Create new address
  @Post()
  async createAddress(@Param('endUserId') endUserId: string, @Body() createAddressDto: CreateAddressRequest)
  
  // PATCH /:id - Update address
  @Patch(':id')
  async updateAddress(@Param('endUserId') endUserId: string, @Param('id') addressId: string, @Body() updateAddressDto: Partial<CreateAddressRequest>)
  
  // PATCH /:id/set-default - Set as default
  @Patch(':id/set-default')
  async setDefaultAddress(@Param('endUserId') endUserId: string, @Param('id') addressId: string)
  
  // DELETE /:id - Delete address
  @Delete(':id')
  async deleteAddress(@Param('endUserId') endUserId: string, @Param('id') addressId: string)
}
```

### 2. Service (`end-user-addresses.service.ts`)
```typescript
@Injectable()
export class EndUserAddressesService {
  // Get all addresses for a user
  async getAddresses(endUserId: string)
  
  // Get specific address
  async getAddress(endUserId: string, addressId: string)
  
  // Create new address
  async createAddress(endUserId: string, createAddressDto: CreateAddressRequest)
  
  // Update existing address
  async updateAddress(endUserId: string, addressId: string, updateAddressDto: Partial<CreateAddressRequest>)
  
  // Set address as default
  async setDefaultAddress(endUserId: string, addressId: string)
  
  // Soft delete address
  async deleteAddress(endUserId: string, addressId: string)
}
```

---

## 🎯 Key Features

### 1. **Default Address Management**
- Only one address can be default per user
- Automatically sets first address as default
- When setting new default, automatically unsets others
- When deleting default, automatically sets new default

### 2. **Soft Delete**
- Addresses are not permanently deleted
- Sets `isActive: false` instead
- Maintains referential integrity with bookings

### 3. **Smart Ordering**
- Default address appears first
- Then ordered by creation date (newest first)

### 4. **Validation & Security**
- JWT authentication required for all endpoints
- User can only access their own addresses
- Input validation and sanitization

---

## 📱 Frontend Implementation

### 1. Address Management Component
```typescript
// src/components/AddressManagement.tsx
const AddressManagement: React.FC = () => {
  // State management
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  // API calls
  const fetchAddresses = async () => { /* ... */ };
  const createAddress = async (data: CreateAddressRequest) => { /* ... */ };
  const updateAddress = async (id: string, data: Partial<CreateAddressRequest>) => { /* ... */ };
  const deleteAddress = async (id: string) => { /* ... */ };
  const setDefaultAddress = async (id: string) => { /* ... */ };
  
  // UI rendering
  return (
    <div>
      {/* Add/Edit Form */}
      {/* Addresses List */}
      {/* Action Buttons */}
    </div>
  );
};
```

### 2. Integration with User Profile
```typescript
// src/components/UserProfile.tsx
const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
  
  return (
    <div>
      {/* Navigation Tabs */}
      <nav>
        <button onClick={() => setActiveTab('profile')}>Profile Information</button>
        <button onClick={() => setActiveTab('addresses')}>Address Management</button>
      </nav>
      
      {/* Tab Content */}
      {activeTab === 'profile' ? (
        <ProfileInformation />
      ) : (
        <AddressManagement />
      )}
    </div>
  );
};
```

---

## 🔄 API Response Examples

### 1. List Addresses
```json
{
  "addresses": [
    {
      "id": "uuid-1",
      "type": "home",
      "label": "Primary Home",
      "area": "Andheri West",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400058",
      "country": "India",
      "isDefault": true,
      "isActive": true,
      "createdAt": "2025-01-20T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 2. Create Address Success
```json
{
  "message": "Address created successfully",
  "address": {
    "id": "uuid-2",
    "type": "work",
    "label": "Office",
    "area": "Bandra East",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400050",
    "country": "India",
    "isDefault": false,
    "isActive": true,
    "createdAt": "2025-01-20T11:00:00.000Z"
  }
}
```

### 3. Set Default Success
```json
{
  "message": "Default address updated successfully",
  "address": {
    "id": "uuid-2",
    "isDefault": true,
    "updatedAt": "2025-01-20T12:00:00.000Z"
  }
}
```

---

## 🧪 Testing

### 1. Test with Curl
```bash
# Get addresses
curl -X GET "http://localhost:4000/api/v1/end-users/USER_ID/addresses" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create address
curl -X POST "http://localhost:4000/api/v1/end-users/USER_ID/addresses" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "home",
    "label": "Test Home",
    "addressLine1": "123 Test Street",
    "city": "Test City",
    "state": "Test State",
    "postalCode": "12345",
    "country": "India"
  }'
```

### 2. Test with Postman
- Import the endpoints
- Set Authorization header: `Bearer YOUR_TOKEN`
- Test all CRUD operations

---

## 🔒 Security Considerations

### 1. **Authentication**
- All endpoints require JWT token
- Token validated on every request

### 2. **Authorization**
- Users can only access their own addresses
- `endUserId` from token must match URL parameter

### 3. **Input Validation**
- Required fields validation
- Data type validation
- SQL injection prevention via Prisma

### 4. **Rate Limiting**
- Consider implementing rate limiting for address operations
- Prevent abuse of create/update endpoints

---

## 🚀 Performance Optimizations

### 1. **Database Indexing**
```sql
-- Already defined in Prisma schema
@@index([endUserId])
```

### 2. **Query Optimization**
- Only fetch active addresses (`isActive: true`)
- Efficient ordering by `isDefault` and `createdAt`
- Use `findFirst` for single record queries

### 3. **Caching**
- Consider caching user addresses
- Implement cache invalidation on updates

---

## 📱 UI/UX Features

### 1. **Responsive Design**
- Mobile-first approach
- Grid layout for different screen sizes
- Touch-friendly buttons

### 2. **User Experience**
- Loading states during API calls
- Success/error messages
- Confirmation dialogs for destructive actions
- Form validation with real-time feedback

### 3. **Visual Hierarchy**
- Default address highlighted
- Clear action buttons
- Consistent spacing and typography

---

## 🔧 Setup Instructions

### 1. **Backend Setup**
```bash
# The address module is already integrated
# No additional setup required
```

### 2. **Frontend Setup**
```bash
# Copy components to your project
cp AddressManagement.tsx apps/web/src/components/
cp UserProfile.tsx apps/web/src/components/

# Update your App.tsx to use UserProfile
```

### 3. **Database**
```bash
# Run migrations if needed
cd apps/api
npx prisma migrate dev
```

---

## 🎯 Usage Examples

### 1. **Add Home Address**
```typescript
const homeAddress = {
  type: 'home',
  label: 'Primary Home',
  area: 'Andheri West',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400058',
  country: 'India',
  isDefault: true
};

await createAddress(homeAddress);
```

### 2. **Add Work Address**
```typescript
const workAddress = {
  type: 'work',
  label: 'Office',
  area: 'Bandra East',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400050',
  country: 'India',
  isDefault: false
};

await createAddress(workAddress);
```

### 3. **Update Address**
```typescript
const updates = {
  label: 'Updated Home',
  city: 'New Mumbai'
};

await updateAddress(addressId, updates);
```

### 4. **Set Default Address**
```typescript
await setDefaultAddress(addressId);
```

---

## 🚀 Next Steps

### 1. **Enhanced Features**
- Address validation (Google Maps API integration)
- Bulk address import/export
- Address templates for common locations

### 2. **Integration**
- Booking system integration
- Delivery address selection
- Service area calculation for partners

### 3. **Analytics**
- Address usage statistics
- Popular service areas
- Geographic insights

---

## 📞 Support

For any issues or questions about the Address API implementation:
- Check API documentation: `API_DOCUMENTATION.md`
- Review curl examples: `curl_all_endpoints.sh`
- Test with provided scripts: `test_mobile_login.sh`
- Check Prisma schema for data structure
