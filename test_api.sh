#!/bin/bash

echo "🚀 NearMate API Test Script"
echo "=========================="
echo ""

# Test 1: Health check
echo "1️⃣ Testing health endpoint..."
curl -s http://localhost:4000/api/v1/health | jq .
echo ""

# Test 2: Login
echo "2️⃣ Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nearmate.local","password":"admin123"}')

echo "Login response:"
echo $LOGIN_RESPONSE | jq .

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
echo ""
echo "🔑 Token extracted: ${TOKEN:0:50}..."
echo ""

# Test 3: Get categories
echo "3️⃣ Testing categories endpoint..."
curl -s -X GET http://localhost:4000/api/v1/categories \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.[0:3] | .[] | {key: .key, label: .label, icon: .icon}'
echo ""

# Test 4: Get partners
echo "4️⃣ Testing partners endpoint..."
curl -s -X GET http://localhost:4000/api/v1/partners \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.[0:2] | .[] | {name: .name, phone: .phone, categories: [.categories[].serviceCategory.key]}'
echo ""

echo "✅ All tests completed successfully!"
echo ""
echo "📝 Copy these commands for your own use:"
echo "========================================"
echo ""
echo "# Login:"
echo "curl -X POST http://localhost:4000/api/v1/auth/login \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"admin@nearmate.local\",\"password\":\"admin123\"}'"
echo ""
echo "# Get categories:"
echo "curl -X GET http://localhost:4000/api/v1/categories \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN_HERE\""
echo ""
echo "# Get partners:"
echo "curl -X GET http://localhost:4000/api/v1/partners \\"
echo "  -H \"Authorization: Bearer YOUR_TOKEN_HERE\""
