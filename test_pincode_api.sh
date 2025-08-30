#!/bin/bash

# Test Pincode API Endpoints
echo "🧪 Testing Pincode API Endpoints"
echo "=================================="

# Base URL
BASE_URL="http://localhost:4000"

# Test 1: Lookup specific pincode
echo -e "\n1️⃣ Testing Pincode Lookup (400058 - Andheri West)"
curl -s -X GET "$BASE_URL/api/v1/pincode/lookup/400058" | jq '.'

# Test 2: Search pincodes by query
echo -e "\n2️⃣ Testing Pincode Search (Mumbai)"
curl -s -X GET "$BASE_URL/api/v1/pincode/search?q=Mumbai&limit=5" | jq '.'

# Test 3: Get all states
echo -e "\n3️⃣ Testing Get All States"
curl -s -X GET "$BASE_URL/api/v1/pincode/states" | jq '.'

# Test 4: Get cities by state
echo -e "\n4️⃣ Testing Get Cities by State (Maharashtra)"
curl -s -X GET "$BASE_URL/api/v1/pincode/cities/Maharashtra" | jq '.'

# Test 5: Get districts by city
echo -e "\n5️⃣ Testing Get Districts by City (Mumbai)"
curl -s -X GET "$BASE_URL/api/v1/pincode/districts/Mumbai" | jq '.'

# Test 6: Search by pincode prefix
echo -e "\n6️⃣ Testing Search by Pincode Prefix (400)"
curl -s -X GET "$BASE_URL/api/v1/pincode/search?q=400&limit=10" | jq '.'

# Test 7: Search by city name
echo -e "\n7️⃣ Testing Search by City Name (Delhi)"
curl -s -X GET "$BASE_URL/api/v1/pincode/search?q=Delhi&limit=5" | jq '.'

echo -e "\n✅ Pincode API tests completed!"
echo -e "\n📋 Available Endpoints:"
echo "   GET /api/v1/pincode/lookup/{pincode} - Lookup specific pincode"
echo "   GET /api/v1/pincode/search?q={query}&limit={limit} - Search pincodes"
echo "   GET /api/v1/pincode/states - Get all states"
echo "   GET /api/v1/pincode/cities/{state} - Get cities by state"
echo "   GET /api/v1/pincode/districts/{city} - Get districts by city"
