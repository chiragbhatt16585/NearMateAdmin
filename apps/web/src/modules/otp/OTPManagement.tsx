import React, { useState, useEffect } from 'react';
import Card from '../common/Card';

interface OTP {
  id: string;
  phone: string;
  code: string;
  purpose: string;
  actor: string;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
  userType: string;
}

interface OTPResponse {
  otps: OTP[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface OTPManagementProps {
  token: string;
}

const OTPManagement: React.FC<OTPManagementProps> = ({ token }) => {
  const [otps, setOtps] = useState<OTP[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<'phone' | 'purpose' | 'userType'>('phone');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'used'>('all');

  const loadOTPs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/auth/otps?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data: OTPResponse = await response.json();
        setOtps(data.otps);
      }
    } catch (error) {
      console.error('Failed to load OTPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOTPs = otps.filter(otp => {
    // Search filter
    if (searchTerm) {
      const searchValue = searchTerm.toLowerCase();
      const fieldValue = otp[searchField]?.toLowerCase() || '';
      if (!fieldValue.includes(searchValue)) {
        return false;
      }
    }
    
    // Status filter
    if (filterStatus === 'active' && otp.isUsed) return false;
    if (filterStatus === 'used' && !otp.isUsed) return false;
    
    return true;
  });
  
  const clearExpiredOTPs = async () => {
    try {
      const response = await fetch('/api/v1/auth/otps/expired', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Cleared ${result.deletedCount} expired OTPs`);
        loadOTPs(); // Reload the list
      }
    } catch (error) {
      console.error('Failed to clear OTPs:', error);
    }
  };
  
  const copyOTP = (otp: string) => {
    navigator.clipboard.writeText(otp);
    alert('OTP copied to clipboard!');
  };
  
  useEffect(() => {
    loadOTPs();
    // Refresh every 30 seconds
    const interval = setInterval(loadOTPs, 30000);
    return () => clearInterval(interval);
  }, [limit]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">OTP Management</h1>
        <div className="flex gap-3">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          >
            <option value={5}>5 OTPs</option>
            <option value={10}>10 OTPs</option>
            <option value={20}>20 OTPs</option>
            <option value={50}>50 OTPs</option>
          </select>
          <button
            onClick={loadOTPs}
            disabled={loading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={clearExpiredOTPs}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
          >
            Clear Expired
          </button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search Field Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search By</label>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as 'phone' | 'purpose' | 'userType')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              <option value="phone">Phone Number</option>
              <option value="purpose">Purpose</option>
              <option value="userType">User Type</option>
            </select>
          </div>
          
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Term</label>
            <input
              type="text"
              placeholder={`Search by ${searchField}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'used')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="used">Used Only</option>
            </select>
          </div>
          
          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredOTPs.length} of {otps.length} OTPs
          </div>
          
          {/* Clear Search */}
          {(searchTerm || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                OTP Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purpose
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOTPs.map(otp => (
              <tr key={otp.id} className={otp.isUsed ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {otp.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {otp.code}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    otp.purpose === 'register' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {otp.purpose}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {otp.userType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    otp.isUsed ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {otp.isUsed ? 'Used' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(otp.expiresAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(otp.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {!otp.isUsed && (
                    <button
                      onClick={() => copyOTP(otp.code)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Copy OTP
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredOTPs.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No OTPs found</p>
        </div>
      )}
    </div>
  );
};

export default OTPManagement;
