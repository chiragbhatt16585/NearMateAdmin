import React, { useState, useEffect } from 'react';

interface ApiIntegrationInfo {
  user: {
    email: string;
    role: string;
    id: string;
  };
  apiKey: {
    key: string;
    permissions: string[];
    expiresAt: string;
  };
}

const ApiIntegrationDashboard: React.FC = () => {
  const [integrationInfo, setIntegrationInfo] = useState<ApiIntegrationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>({});
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for the API integration user we created
  const mockIntegrationInfo: ApiIntegrationInfo = {
    user: {
      email: 'api@nearmate.local',
      role: 'api_integration',
      id: 'f6fb1821-46a3-4524-9ccb-8d4d3f069e1f'
    },
    apiKey: {
      key: '78b5e5feeb7b225ab5925e73376797c7',
      permissions: [
        'categories:read',
        'pincodes:read',
        'partners:read',
        'end-users:read',
        'bookings:read',
        'public:read'
      ],
      expiresAt: '2026-08-30T08:35:25.345Z'
    }
  };

  useEffect(() => {
    // In a real app, you'd fetch this from the API
    setIntegrationInfo(mockIntegrationInfo);
  }, []);

  const testApiEndpoint = async (endpoint: string, method: string = 'GET', body?: any) => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {
        'X-API-Key': mockIntegrationInfo.apiKey.key,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`/api/v1${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          data,
          timestamp: new Date().toISOString()
        }
      }));

      return { success: response.ok, status: response.status, data };
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          status: 'ERROR',
          data: { error: error instanceof Error ? error.message : 'Unknown error' },
          timestamp: new Date().toISOString()
        }
      }));
      return { success: false, status: 'ERROR', data: { error: 'Network error' } };
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (!integrationInfo) {
    return (
      <div className="max-w-7xl mx-auto mt-8 p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔌 API Integration Dashboard</h1>
        <p className="text-gray-600">Complete guide for integrating with NearMate API using your dedicated integration user</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📋' },
            { id: 'credentials', label: 'Credentials', icon: '🔑' },
            { id: 'examples', label: 'API Examples', icon: '💻' },
            { id: 'testing', label: 'Test Endpoints', icon: '🧪' },
            { id: 'documentation', label: 'Documentation', icon: '📚' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">🎯 What This Dashboard Provides</h2>
            <ul className="space-y-2 text-blue-700">
              <li>• <strong>Dedicated API User:</strong> Separate from your main admin account for security</li>
              <li>• <strong>API Key Management:</strong> Secure authentication for all API calls</li>
              <li>• <strong>Live Testing:</strong> Test API endpoints directly from this dashboard</li>
              <li>• <strong>Code Examples:</strong> Ready-to-use integration code snippets</li>
              <li>• <strong>Documentation:</strong> Complete API reference and usage guides</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">🔒 Security Benefits</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Isolated from admin operations</li>
                <li>• Limited permissions (read-only)</li>
                <li>• Expiring API keys</li>
                <li>• Audit trail for all API calls</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">📊 Available APIs</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Service Categories</li>
                <li>• Pincode Data</li>
                <li>• Partner Information</li>
                <li>• End User Data</li>
                <li>• Booking Information</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Tab */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">👤 API Integration User</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={integrationInfo.user.email}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={() => copyToClipboard(integrationInfo.user.email)}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={integrationInfo.user.role}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">🔑 API Key</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={integrationInfo.apiKey.key}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(integrationInfo.apiKey.key)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Keep this key secure and don't share it publicly</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                <div className="flex flex-wrap gap-2">
                  {integrationInfo.apiKey.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                <input
                  type="text"
                  value={new Date(integrationInfo.apiKey.expiresAt).toLocaleString()}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ Important Security Notes</h3>
            <ul className="space-y-2 text-yellow-700">
              <li>• Never commit API keys to version control</li>
              <li>• Use environment variables for production</li>
              <li>• Rotate keys regularly</li>
              <li>• Monitor API usage for suspicious activity</li>
              <li>• This key has read-only access for safety</li>
            </ul>
          </div>
        </div>
      )}

      {/* API Examples Tab */}
      {activeTab === 'examples' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">💻 Code Examples</h2>
            
            <div className="space-y-6">
              {/* JavaScript/Node.js */}
              <div>
                <h3 className="text-lg font-medium mb-3">JavaScript/Node.js</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`const API_KEY = '${integrationInfo.apiKey.key}';
const BASE_URL = 'http://localhost:4000/api/v1';

// Fetch categories
async function getCategories() {
  const response = await fetch(\`\${BASE_URL}/categories\`, {
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
}

// Fetch pincode data
async function getPincodeData(pincode) {
  const response = await fetch(\`\${BASE_URL}/pincode/lookup/\${pincode}\`, {
    headers: {
      'X-API-Key': API_KEY
    }
  });
  return await response.json();
}

// Usage
getCategories().then(console.log);
getPincodeData('110001').then(console.log);`}
                  </pre>
                </div>
              </div>

              {/* cURL */}
              <div>
                <h3 className="text-lg font-medium mb-3">cURL</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`# Get categories
curl -H "X-API-Key: ${integrationInfo.apiKey.key}" \\
     http://localhost:4000/api/v1/categories

# Get pincode data
curl -H "X-API-Key: ${integrationInfo.apiKey.key}" \\
     http://localhost:4000/api/v1/pincode/lookup/110001

# Get partners
curl -H "X-API-Key: ${integrationInfo.apiKey.key}" \\
     http://localhost:4000/api/v1/partners`}
                  </pre>
                </div>
              </div>

              {/* Python */}
              <div>
                <h3 className="text-lg font-medium mb-3">Python</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`import requests

API_KEY = '${integrationInfo.apiKey.key}'
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
print(pincode_data)`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Endpoints Tab */}
      {activeTab === 'testing' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">🧪 Test API Endpoints</h2>
            <p className="text-gray-600 mb-4">Test the API endpoints directly from this dashboard to verify your integration</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => testApiEndpoint('/categories')}
                disabled={isLoading}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Test Categories API
              </button>
              <button
                onClick={() => testApiEndpoint('/pincode/states')}
                disabled={isLoading}
                className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Test Pincode States API
              </button>
              <button
                onClick={() => testApiEndpoint('/partners')}
                disabled={isLoading}
                className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Test Partners API
              </button>
              <button
                onClick={() => testApiEndpoint('/end-users')}
                disabled={isLoading}
                className="p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                Test End Users API
              </button>
            </div>

            {/* Test Results */}
            {Object.keys(testResults).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Test Results</h3>
                {Object.entries(testResults).map(([endpoint, result]) => (
                  <div
                    key={endpoint}
                    className={`p-4 rounded-lg border ${
                      result.status === 200
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{endpoint}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.status === 200
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.status === 200 ? 'Success' : `Error ${result.status}`}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Status: {result.status}</p>
                      <p>Timestamp: {new Date(result.timestamp).toLocaleString()}</p>
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-600">View Response</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documentation Tab */}
      {activeTab === 'documentation' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">📚 API Documentation</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Authentication</h3>
                <p className="text-gray-600 mb-2">All API requests must include your API key in one of these ways:</p>
                <ul className="space-y-2 text-gray-600">
                  <li>• <code className="bg-gray-100 px-1 rounded">X-API-Key: YOUR_API_KEY</code> header</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">Authorization: Bearer YOUR_API_KEY</code> header</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">?api_key=YOUR_API_KEY</code> query parameter</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Base URL</h3>
                <p className="text-gray-600">All API endpoints are relative to: <code className="bg-gray-100 px-1 rounded">http://localhost:4000/api/v1</code></p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Available Endpoints</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Categories</h4>
                    <p className="text-sm text-gray-600">GET /categories - List all service categories</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium">Pincode Data</h4>
                    <p className="text-sm text-gray-600">GET /pincode/lookup/:pincode - Get pincode details</p>
                    <p className="text-sm text-gray-600">GET /pincode/states - List all states</p>
                    <p className="text-sm text-gray-600">GET /pincode/cities/:state - List cities in a state</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium">Partners</h4>
                    <p className="text-sm text-gray-600">GET /partners - List all partners</p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-medium">End Users</h4>
                    <p className="text-sm text-gray-600">GET /end-users - List all end users</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Rate Limits</h3>
                <p className="text-gray-600">Currently no rate limits are enforced, but please be respectful of the API.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Error Handling</h3>
                <p className="text-gray-600 mb-2">All errors return appropriate HTTP status codes and error messages:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• 400 - Bad Request (invalid parameters)</li>
                  <li>• 401 - Unauthorized (invalid or missing API key)</li>
                  <li>• 403 - Forbidden (insufficient permissions)</li>
                  <li>• 404 - Not Found (endpoint or resource not found)</li>
                  <li>• 500 - Internal Server Error</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiIntegrationDashboard;
