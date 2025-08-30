import React, { useState, useEffect } from 'react';

interface Address {
  id: string;
  type: string;
  label: string;
  area: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EndUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

interface AddressFormData {
  type: string;
  label: string;
  area: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  lat: string;
  lng: string;
  isDefault: boolean;
}

interface PincodeOffice {
  pincode: string;
  district: string;
  city: string;
  state: string;
  area: string | null;
}

const AdminAddressManagement: React.FC = () => {
  const [endUsers, setEndUsers] = useState<EndUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [pincodeSuggestions, setPincodeSuggestions] = useState<any[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);

  const [formData, setFormData] = useState<AddressFormData>({
    type: 'home',
    label: '',
    area: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India',
    lat: '',
    lng: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchEndUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchAddresses(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchEndUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await fetch(`/api/v1/end-users?page=1&search=`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch end users`);
      }

      const data = await response.json();
      console.log('End users response:', data); // Debug log
      setEndUsers(data.users || []);
    } catch (error) {
      setError('Failed to load end users');
      console.error('Error fetching end users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddresses = async (userId: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/v1/end-users/${userId}/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      setAddresses(data.addresses || []);
    } catch (error) {
      setError('Failed to load addresses');
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    // Auto-fill city, state, district when pincode is entered
    if (name === 'pincode' && value.length === 6) {
      lookupPincode(value);
    }
  };

  const lookupPincode = async (pincode: string) => {
    if (pincode.length !== 6) return;
    
    setIsLoadingPincode(true);
    try {
      const response = await fetch(`/api/v1/pincode/lookup/${pincode}`);
      const data = await response.json();
      
      console.log('Pincode lookup response:', data); // Debug log
      
      if (data.found && data.offices && data.offices.length > 0) {
        // If multiple cities exist for this pincode, show them as suggestions
        if (data.offices.length > 1) {
          const uniqueCities = [...new Set(data.offices.map((office: PincodeOffice) => office.city))];
          const uniqueStates = [...new Set(data.offices.map((office: PincodeOffice) => office.state))];
          
          // Auto-fill with the first city/state, but show info about multiple options
          const office = data.offices[0] as PincodeOffice;
          setFormData(prev => ({
            ...prev,
            city: office.city,
            state: office.state,
            area: office.area || prev.area,
          }));
          
          if (uniqueCities.length > 1) {
            setSuccess(`✅ Auto-filled: ${office.city}, ${office.state} (Multiple cities available: ${uniqueCities.join(', ')})`);
          } else {
            setSuccess(`✅ Auto-filled: ${office.city}, ${office.state}`);
          }
        } else {
          // Single city, normal auto-fill
          const office = data.offices[0] as PincodeOffice;
          setFormData(prev => ({
            ...prev,
            city: office.city,
            state: office.state,
            area: office.area || prev.area,
          }));
          setSuccess(`✅ Auto-filled: ${office.city}, ${office.state}`);
        }
      } else {
        setError(`❌ Pincode ${pincode} not found in database`);
      }
    } catch (error) {
      console.error('Error looking up pincode:', error);
      setError('Failed to lookup pincode. Please try again.');
    } finally {
      setIsLoadingPincode(false);
    }
  };

  const searchPincodes = async (query: string) => {
    if (query.length < 3) {
      setPincodeSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/v1/pincode/search?q=${query}&limit=5`);
      const data = await response.json();
      setPincodeSuggestions(data.results || []);
    } catch (error) {
      console.error('Error searching pincodes:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      label: '',
      area: '',
      pincode: '',
      city: '',
      state: '',
      country: 'India',
      lat: '',
      lng: '',
      isDefault: false,
    });
    setEditingAddress(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    // Validate required fields
    if (!formData.type || !formData.label || !formData.area || !formData.pincode || !formData.city || !formData.state) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const url = editingAddress 
        ? `/api/v1/end-users/${selectedUserId}/addresses/${editingAddress.id}`
        : `/api/v1/end-users/${selectedUserId}/addresses`;

      const method = editingAddress ? 'PATCH' : 'POST';
      
      const payload = {
        type: formData.type,
        label: formData.label,
        area: formData.area,
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        country: formData.country || 'India',
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        isDefault: formData.isDefault,
      };

      console.log('Sending payload:', payload); // Debug log
      console.log('Request URL:', url); // Debug log
      console.log('Request method:', method); // Debug log

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', errorData); // Debug log
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: Failed to save address`);
      }

      const data = await response.json();
      setSuccess(data.message || 'Address saved successfully');
      
      // Refresh addresses
      await fetchAddresses(selectedUserId);
      
      // Reset form
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      label: address.label,
      area: address.area,
      pincode: address.pincode,
      city: address.city,
      state: address.state,
      country: address.country,
      lat: address.lat?.toString() || '',
      lng: address.lng?.toString() || '',
      isDefault: address.isDefault,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!selectedUserId || !confirm('Are you sure you want to delete this address?')) return;

    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/v1/end-users/${selectedUserId}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      setSuccess('Address deleted successfully');
      await fetchAddresses(selectedUserId);
    } catch (error) {
      setError('Failed to delete address');
      console.error('Error deleting address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!selectedUserId) return;

    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/v1/end-users/${selectedUserId}/addresses/${addressId}/set-default`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to set default address');
      }

      setSuccess('Default address updated successfully');
      await fetchAddresses(selectedUserId);
    } catch (error) {
      setError('Failed to set default address');
      console.error('Error setting default address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEndUsers = endUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Admin Address Management</h2>
        <p className="text-gray-600">Manage addresses for end users from the admin panel</p>
      </div>

      {/* Debug Info */}
      {/* <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-sm text-gray-800">
          <strong>Debug:</strong> Component loaded. Token: {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}. 
          Users loaded: {endUsers.length}. Selected user: {selectedUserId || 'None'}.
        </p>
        <div className="mt-2 space-y-2">
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem('accessToken');
                console.log('Testing users API...');
                const response = await fetch('/api/v1/end-users?page=1&search=', {
                  method: 'GET',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                console.log('Users API response:', response.status, data);
              } catch (error) {
                console.error('Users API error:', error);
              }
            }}
            className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Test Users API
          </button>
          
          {selectedUserId && (
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('accessToken');
                  console.log('Testing addresses API...');
                  const response = await fetch(`/api/v1/end-users/${selectedUserId}/addresses`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  const data = await response.json();
                  console.log('Addresses API response:', response.status, data);
                } catch (error) {
                  console.error('Addresses API error:', error);
                }
              }}
              className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Test Addresses API
            </button>
          )}
        </div>
      </div> */}

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* End User Selection */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select End User</h3>
                  <button
          onClick={fetchEndUsers}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh Users'}
        </button>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
          {filteredEndUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedUserId === user.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
              <div className="text-sm text-gray-600">{user.phone}</div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.status}
              </span>
            </div>
          ))}
        </div>

        {filteredEndUsers.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            {searchTerm ? 'No users found matching your search' : 'No end users found'}
          </div>
        )}
      </div>

      {/* Address Management for Selected User */}
      {selectedUserId && (
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              Addresses for {endUsers.find(u => u.id === selectedUserId)?.name}
            </h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              + Add New Address
            </button>
          </div>

          {/* Add/Edit Address Form */}
          {showAddForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h4 className="text-lg font-semibold mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h4>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      name="label"
                      value={formData.label}
                      onChange={handleInputChange}
                      placeholder="e.g., Primary Home, Office"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area/Location
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="e.g., Andheri West, Bandra East, Colaba"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      onFocus={() => searchPincodes(formData.pincode)}
                      placeholder="Enter 6-digit pincode"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                      maxLength={6}
                    />
                    {isLoadingPincode && (
                      <div className="absolute right-3 top-8">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      </div>
                    )}
                    {pincodeSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {pincodeSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                pincode: suggestion.pincode,
                                city: suggestion.city,
                                state: suggestion.state,
                                area: suggestion.area || prev.area,
                              }));
                              setPincodeSuggestions([]);
                              setSuccess(`✅ Selected: ${suggestion.city}, ${suggestion.state}`);
                            }}
                          >
                            <div className="font-medium">{suggestion.pincode}</div>
                            <div className="text-gray-600 text-xs">
                              {suggestion.area}, {suggestion.city}, {suggestion.state}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Country"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude (Optional)
                    </label>
                    <input
                      type="number"
                      name="lat"
                      value={formData.lat}
                      onChange={handleInputChange}
                      placeholder="Latitude"
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude (Optional)
                    </label>
                    <input
                      type="number"
                      name="lng"
                      value={formData.lng}
                      onChange={handleInputChange}
                      placeholder="Longitude"
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses List */}
          <div>
            <h4 className="text-lg font-semibold mb-4">User Addresses</h4>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No addresses found for this user. Add the first address to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 border rounded-lg ${
                      address.isDefault 
                        ? 'border-black bg-gray-100' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            address.isDefault 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {address.type}
                          </span>
                          
                          {address.isDefault && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Default
                            </span>
                          )}
                          
                          <span className="text-sm font-medium text-gray-700">
                            {address.label}
                          </span>
                        </div>
                        
                        <div className="text-gray-600">
                          <p className="font-medium">{address.area}</p>
                          <p>{address.city}, {address.state} - {address.pincode}</p>
                          <p className="text-sm text-gray-500">{address.country}</p>
                          {address.lat && address.lng && (
                            <p className="text-sm text-gray-500 mt-1">
                              📍 {address.lat.toFixed(6)}, {address.lng.toFixed(6)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {!address.isDefault && (
                                                   <button
                           onClick={() => handleSetDefault(address.id)}
                           disabled={isLoading}
                           className="px-3 py-1 text-xs bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                         >
                           Set Default
                         </button>
                        )}
                        
                                                 <button
                           onClick={() => handleEdit(address)}
                           disabled={isLoading}
                           className="px-3 py-1 text-xs bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                         >
                           Edit
                         </button>
                        
                        <button
                          onClick={() => handleDelete(address.id)}
                          disabled={isLoading}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedUserId && (
        <div className="text-center py-8 text-gray-500">
          <p>Please select an end user above to manage their addresses</p>
        </div>
      )}
    </div>
  );
};

export default AdminAddressManagement;
