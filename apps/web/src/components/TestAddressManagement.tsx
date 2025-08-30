import React from 'react';
import AdminAddressManagement from './AdminAddressManagement';

const TestAddressManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Address Management</h1>
        <AdminAddressManagement />
      </div>
    </div>
  );
};

export default TestAddressManagement;
