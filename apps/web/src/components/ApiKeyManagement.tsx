import React, { useState, useEffect } from 'react';

interface ApiKey {
  id: string;
  name: string;
  permissions: string[];
  isActive: boolean;
  lastUsed: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateApiKeyData {
  name: string;
  permissions: string[];
  expiresAt: string;
}

const ApiKeyManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newApiKey, setNewApiKey] = useState<string>('');

  const [formData, setFormData] = useState<CreateApiKeyData>({
    name: '',
    permissions: ['categories', 'pincodes'],
    expiresAt: '',
  });

  const availablePermissions = [
    { key: 'categories', label: 'Categories API' },
    { key: 'pincodes', label: 'Pincode API' },
    { key: 'public', label: 'Public Data' },
  ];

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const response = await fetch('/api/v1/api-keys', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch API keys`);
      }

      const data = await response.json();
      setApiKeys(data.apiKeys || []);
    } catch (error) {
      setError('Failed to load API keys');
      console.error('Error fetching API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'permissions') {
      // Handle multiple select for permissions
      const select = e.target as HTMLSelectElement;
      const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
      setFormData(prev => ({
        ...prev,
        permissions: selectedOptions,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.permissions.length === 0) {
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

      const payload = {
        name: formData.name,
        permissions: formData.permissions,
        expiresAt: formData.expiresAt || undefined,
      };

      const response = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to create API key`);
      }

      const data = await response.json();
      setSuccess('API key created successfully');
      setNewApiKey(data.apiKey.key);
      
      // Refresh API keys
      await fetchApiKeys();
      
      // Reset form
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create API key');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      permissions: ['categories', 'pincodes'],
      expiresAt: '',
    });
    setShowCreateForm(false);
    setNewApiKey('');
  };

  const handleToggleActive = async (apiKeyId: string, currentStatus: boolean) => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/v1/api-keys/${apiKeyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update API key');
      }

      setSuccess(`API key ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      await fetchApiKeys();
    } catch (error) {
      setError('Failed to update API key');
      console.error('Error updating API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (apiKeyId: string) => {
    if (!confirm('Are you sure you want to regenerate this API key? The old key will become invalid.')) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/v1/api-keys/${apiKeyId}/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate API key');
      }

      const data = await response.json();
      setNewApiKey(data.apiKey.key);
      setSuccess('API key regenerated successfully');
      await fetchApiKeys();
    } catch (error) {
      setError('Failed to regenerate API key');
      console.error('Error regenerating API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (apiKeyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/v1/api-keys/${apiKeyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      setSuccess('API key deleted successfully');
      await fetchApiKeys();
    } catch (error) {
      setError('Failed to delete API key');
      console.error('Error deleting API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">API Key Management</h2>
        <p className="text-gray-600">Manage API keys for third-party integrations and public access</p>
      </div>

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

      {/* New API Key Display */}
      {newApiKey && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">🔑 New API Key Generated</h3>
          <div className="bg-white p-3 rounded border font-mono text-sm break-all">
            {newApiKey}
          </div>
          <p className="text-blue-600 text-sm mt-2">
            ⚠️ Copy this key now! It won't be shown again.
          </p>
          <button
            onClick={() => setNewApiKey('')}
            className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create New API Key */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          {showCreateForm ? 'Cancel' : '+ Create New API Key'}
        </button>

        {showCreateForm && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Mobile App, Web App, Third Party Integration"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions *
                </label>
                <div className="space-y-2">
                  {availablePermissions.map(permission => (
                    <label key={permission.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.key)}
                        onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create API Key'}
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
      </div>

      {/* API Keys List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your API Keys</h3>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading API keys...</p>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No API keys found. Create your first API key to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className={`p-4 border rounded-lg ${
                  apiKey.isActive 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold">{apiKey.name}</h4>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        apiKey.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {apiKey.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <p><strong>Permissions:</strong> {apiKey.permissions.join(', ')}</p>
                      <p><strong>Created:</strong> {new Date(apiKey.createdAt).toLocaleDateString()}</p>
                      {apiKey.lastUsed && (
                        <p><strong>Last Used:</strong> {new Date(apiKey.lastUsed).toLocaleDateString()}</p>
                      )}
                      {apiKey.expiresAt && (
                        <p><strong>Expires:</strong> {new Date(apiKey.expiresAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(apiKey.id, apiKey.isActive)}
                      disabled={isLoading}
                      className={`px-3 py-1 text-xs rounded hover:opacity-80 disabled:opacity-50 ${
                        apiKey.isActive
                          ? 'bg-red-600 text-white'
                          : 'bg-green-600 text-white'
                      }`}
                    >
                      {apiKey.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <button
                      onClick={() => handleRegenerate(apiKey.id)}
                      disabled={isLoading}
                      className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                    >
                      Regenerate
                    </button>
                    
                    <button
                      onClick={() => handleDelete(apiKey.id)}
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

      {/* Usage Instructions */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">📖 How to Use API Keys</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>1. Header Method:</strong> <code>Authorization: Bearer YOUR_API_KEY</code></p>
          <p><strong>2. X-API-Key Header:</strong> <code>X-API-Key: YOUR_API_KEY</code></p>
          <p><strong>3. Query Parameter:</strong> <code>?api_key=YOUR_API_KEY</code></p>
          <p><strong>Example:</strong> <code>GET /api/v1/public/categories?api_key=abc123...</code></p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManagement;
