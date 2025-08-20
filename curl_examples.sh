#!/bin/bash

# NearMate API - Simple cURL Examples
# Make sure your API is running on localhost:4000

echo "🔐 Step 1: Login to get access token"
echo "====================================="

# Login and save token to variable
TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nearmate.local","password":"admin123"}' \
  | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Login failed! Make sure API is running on localhost:4000"
    echo "Start API with: npm run dev"
    exit 1
fi

echo "✅ Login successful!"
echo "🔑 Token: $TOKEN"
echo ""

echo "📋 Step 2: Fetch all categories"
echo "================================"

# Fetch categories using the token
curl -s -X GET http://localhost:4000/api/v1/categories \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.[] | {key: .key, label: .label, icon: .icon}'

echo ""
echo "🎯 Step 3: Fetch all partners"
echo "=============================="

# Fetch partners using the token
curl -s -X GET http://localhost:4000/api/v1/partners \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.[] | {name: .name, phone: .phone, categories: [.categories[].serviceCategory.key]}'

echo ""
echo "✨ Done! Copy these commands for your own use:"
echo "=============================================="
echo ""
echo "# Login:"
echo "curl -X POST http://localhost:4000/api/v1/auth/login \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"admin@nearmate.local\",\"password\":\"admin123\"}'"
echo ""
echo "# Get categories (replace TOKEN with actual token):"
echo "curl -X GET http://localhost:4000/api/v1/categories \\"
echo "  -H \"Authorization: Bearer TOKEN\""
echo ""
echo "# Get partners:"
echo "curl -X GET http://localhost:4000/api/v1/partners \\"
echo "  -H \"Authorization: Bearer TOKEN\""
