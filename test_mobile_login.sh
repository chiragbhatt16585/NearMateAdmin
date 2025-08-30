#!/bin/bash

# Test script for new mobile login functionality
# This demonstrates the flow: check mobile exists -> request OTP -> login with mobile

BASE_URL="http://localhost:4000"
MOBILE="+911234567890"
USER_TYPE="end_user"

echo "🧪 Testing Mobile Login Flow"
echo "=============================="
echo "Base URL: $BASE_URL"
echo "Mobile: $MOBILE"
echo "User Type: $USER_TYPE"
echo ""

echo "1️⃣ Step 1: Check if mobile number exists"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/check-mobile-exists" \
  -H "Content-Type: application/json" \
  -d "{\"mobile\":\"$MOBILE\",\"userType\":\"$USER_TYPE\"}")

echo "Response: $RESPONSE"
echo ""

# Check if user exists
IS_REGISTERED=$(echo $RESPONSE | jq -r '.isRegistered')

if [ "$IS_REGISTERED" = "true" ]; then
  echo "✅ Mobile number is registered. Proceeding with login flow..."
  
  echo ""
  echo "2️⃣ Step 2: Request OTP for login"
  echo "--------------------------------"
  OTP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/request-otp" \
    -H "Content-Type: application/json" \
    -d "{\"mobile\":\"$MOBILE\",\"userType\":\"$USER_TYPE\",\"purpose\":\"login\"}")
  
  echo "OTP Response: $OTP_RESPONSE"
  echo ""
  
  echo "3️⃣ Step 3: Enter OTP (you'll need to check your logs/DB for the OTP)"
  echo "------------------------------------------------------------------------"
  echo "Note: In production, this would be sent via SMS. For testing, check your database."
  echo ""
  
  echo "4️⃣ Step 4: Login with mobile and OTP"
  echo "-------------------------------------"
  echo "Replace OTP_HERE with the actual OTP from step 3:"
  echo ""
  echo "curl -X POST $BASE_URL/api/v1/auth/login-with-mobile \\"
  echo "  -H \"Content-Type: application/json\" \\"
  echo "  -d '{\"mobile\":\"$MOBILE\",\"otp\":\"OTP_HERE\",\"userType\":\"$USER_TYPE\"}'"
  
else
  echo "❌ Mobile number is not registered. User needs to register first."
  echo ""
  echo "To register, use:"
  echo "curl -X POST $BASE_URL/api/v1/auth/request-otp \\"
  echo "  -H \"Content-Type: application/json\" \\"
  echo "  -d '{\"mobile\":\"$MOBILE\",\"userType\":\"$USER_TYPE\",\"purpose\":\"register\"}'"
fi

echo ""
echo "📚 Available endpoints for mobile login:"
echo "========================================"
echo "• POST /api/v1/auth/check-mobile-exists - Check if mobile exists"
echo "• POST /api/v1/auth/request-otp - Request OTP"
echo "• POST /api/v1/auth/login-with-mobile - Login with mobile + OTP"
echo "• POST /api/v1/auth/verify-otp-register - Register new user with OTP"
echo ""
echo "💡 Usage in your app:"
echo "====================="
echo "1. User enters mobile number"
echo "2. Call check-mobile-exists to see if user is registered"
echo "3. If registered: request OTP and login with login-with-mobile"
echo "4. If not registered: request OTP and register with verify-otp-register"
