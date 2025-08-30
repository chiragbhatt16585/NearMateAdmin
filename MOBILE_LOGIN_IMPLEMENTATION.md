# 📱 Mobile Login Implementation Guide

## Overview
This guide explains how to implement mobile-based login functionality in your NearMate app, allowing users to login with their mobile number and OTP.

---

## 🔄 Complete Login Flow

### 1. User Enters Mobile Number
### 2. Check if Mobile is Registered (Optional)
### 3. Request OTP
### 4. User Enters OTP
### 5. Login and Get User Information
### 6. Store Tokens and Display User Info

---

## 🚀 API Endpoints

### Base URL
```
http://localhost:4000
```

### Required Endpoints

| Endpoint | Method | Purpose | Body |
|----------|--------|---------|------|
| `/api/v1/auth/check-mobile-exists` | POST | Check if mobile exists | `{ mobile, userType }` |
| `/api/v1/auth/request-otp` | POST | Request OTP | `{ mobile, userType, purpose }` |
| `/api/v1/auth/login-with-mobile` | POST | Login with mobile + OTP | `{ mobile, otp, userType }` |

---

## 💻 React Implementation

### 1. Create Auth Context

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  status: string;
  type: 'end-user' | 'partner';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (mobile: string, otp: string, userType: string) => Promise<void>;
  logout: () => void;
  checkMobileExists: (mobile: string, userType: string) => Promise<boolean>;
  requestOTP: (mobile: string, userType: string, purpose: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in on app start
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      setUser(JSON.parse(userInfo));
      setIsAuthenticated(true);
    }
  }, []);

  const checkMobileExists = async (mobile: string, userType: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/check-mobile-exists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, userType }),
      });

      const data = await response.json();
      return data.isRegistered;
    } catch (error) {
      console.error('Error checking mobile:', error);
      return false;
    }
  };

  const requestOTP = async (mobile: string, userType: string, purpose: string): Promise<void> => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, userType, purpose }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to request OTP');
      }

      // Store OTP request info for verification
      localStorage.setItem('otpRequest', JSON.stringify({ mobile, userType, purpose }));
    } catch (error) {
      console.error('Error requesting OTP:', error);
      throw error;
    }
  };

  const login = async (mobile: string, otp: string, userType: string): Promise<void> => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/login-with-mobile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, otp, userType }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store tokens and user info
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      
      // Update state
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Clear OTP request info
      localStorage.removeItem('otpRequest');
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear all stored data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('otpRequest');
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    checkMobileExists,
    requestOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 2. Create Login Component

```typescript
// src/components/MobileLogin.tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const MobileLogin: React.FC = () => {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [userType, setUserType] = useState<'end_user' | 'partner'>('end_user');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const { login, checkMobileExists, requestOTP } = useAuth();

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check if mobile exists
      const exists = await checkMobileExists(mobile, userType);
      setIsRegistered(exists);

      // Request OTP
      await requestOTP(mobile, userType, exists ? 'login' : 'register');
      
      // Move to OTP step
      setStep('otp');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isRegistered) {
        // Login existing user
        await login(mobile, otp, userType);
      } else {
        // For new users, you might want to redirect to registration
        setError('New users need to register first');
        setStep('mobile');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMobile = () => {
    setStep('mobile');
    setOtp('');
    setError('');
  };

  if (step === 'otp') {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegistered ? 'Login' : 'Verify OTP'}
        </h2>
        
        <form onSubmit={handleOTPSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP sent to {mobile}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={6}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleBackToMobile}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : isRegistered ? 'Login' : 'Verify'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Didn't receive OTP? 
          <button
            onClick={() => requestOTP(mobile, userType, isRegistered ? 'login' : 'register')}
            className="text-blue-600 hover:underline ml-1"
          >
            Resend
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login with Mobile</h2>
      
      <form onSubmit={handleMobileSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Type
          </label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value as 'end_user' | 'partner')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="end_user">End User</option>
            <option value="partner">Partner</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number
          </label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="+91 12345 67890"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={isLoading || !mobile}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
};

export default MobileLogin;
```

### 3. Create User Profile Component

```typescript
// src/components/UserProfile.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Profile</h2>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-lg">{user.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-lg">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile</label>
            <p className="mt-1 text-lg">{user.phone}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">User Type</label>
            <p className="mt-1 text-lg capitalize">{user.type.replace('-', ' ')}</p>
          </div>
        </div>

        <div className="space-y-4">
          {user.dateOfBirth && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="mt-1 text-lg">
                {new Date(user.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          )}

          {user.gender && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <p className="mt-1 text-lg capitalize">{user.gender}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {user.status}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <p className="mt-1 text-lg">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Partner-specific fields */}
      {user.type === 'partner' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Partner Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Service Radius</label>
              <p className="mt-1">{user.serviceRadiusKm} km</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Available</label>
              <p className="mt-1">{user.isAvailable ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Plan</label>
              <p className="mt-1">{user.plan}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <p className="mt-1">{user.ratingAvg}/5 ({user.ratingCount} reviews)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
```

### 4. Update App Component

```typescript
// src/App.tsx
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import MobileLogin from './components/MobileLogin';
import UserProfile from './components/UserProfile';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated ? <UserProfile /> : <MobileLogin />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
```

---

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
cd apps/web
npm install
```

### 2. Create Context Directory
```bash
mkdir -p src/contexts
mkdir -p src/components
```

### 3. Copy Files
- Copy `AuthContext.tsx` to `src/contexts/`
- Copy `MobileLogin.tsx` to `src/components/`
- Copy `UserProfile.tsx` to `src/components/`
- Update your `App.tsx`

### 4. Start the App
```bash
npm run dev
```

---

## 📱 Usage Flow

1. **App starts** → Shows login screen
2. **User enters mobile** → App checks if registered
3. **OTP sent** → User enters OTP
4. **Login successful** → User info displayed
5. **User can logout** → Returns to login screen

---

## 🎯 Key Features

- ✅ **Mobile-based authentication**
- ✅ **OTP verification**
- ✅ **User type support** (end-user/partner)
- ✅ **Persistent login** (tokens stored)
- ✅ **Complete user profile display**
- ✅ **Responsive design**
- ✅ **Error handling**
- ✅ **Loading states**

---

## 🔒 Security Notes

- Tokens are stored in localStorage (consider httpOnly cookies for production)
- OTP expires after 5 minutes
- Implement rate limiting for OTP requests
- Add input validation and sanitization
- Consider adding biometric authentication for mobile apps

---

## 🚀 Next Steps

1. **Add registration flow** for new users
2. **Implement token refresh** logic
3. **Add password-based login** as alternative
4. **Implement forgot password** functionality
5. **Add profile editing** capabilities
6. **Implement push notifications** for OTP

---

## 📞 Support

For any issues or questions about the implementation, refer to:
- API Documentation: `API_DOCUMENTATION.md`
- Test Scripts: `test_mobile_login.sh`
- Curl Examples: `curl_all_endpoints.sh`
