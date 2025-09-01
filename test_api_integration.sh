#!/bin/bash

# NearMate API Integration Test Script
# This script demonstrates how to use the dedicated API integration user

echo "🔌 NearMate API Integration Test"
echo "================================="
echo ""

# API Configuration
API_KEY="78b5e5feeb7b225ab5925e73376797c7"
BASE_URL="http://localhost:4000/api/v1"

echo "🔑 Using API Key: ${API_KEY:0:8}..."
echo "🌐 Base URL: $BASE_URL"
echo ""

# Test 1: Get Categories
echo "📋 Testing Categories API..."
response=$(curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/categories")
if [ $? -eq 0 ]; then
    echo "✅ Categories API: Success"
    echo "   Response length: ${#response} characters"
else
    echo "❌ Categories API: Failed"
fi
echo ""

# Test 2: Get Pincode States
echo "📍 Testing Pincode States API..."
response=$(curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/pincode/states")
if [ $? -eq 0 ]; then
    echo "✅ Pincode States API: Success"
    echo "   Response length: ${#response} characters"
else
    echo "❌ Pincode States API: Failed"
fi
echo ""

# Test 3: Get Partners
echo "🤝 Testing Partners API..."
response=$(curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/partners")
if [ $? -eq 0 ]; then
    echo "✅ Partners API: Success"
    echo "   Response length: ${#response} characters"
else
    echo "❌ Partners API: Failed"
fi
echo ""

# Test 4: Get End Users
echo "👥 Testing End Users API..."
response=$(curl -s -H "X-API-Key: $API_KEY" "$BASE_URL/end-users")
if [ $? -eq 0 ]; then
    echo "✅ End Users API: Success"
    echo "   Response length: ${#response} characters"
else
    echo "❌ End Users API: Failed"
fi
echo ""

# Test 5: Test without API key (should fail)
echo "🚫 Testing API without key (should fail)..."
response=$(curl -s "$BASE_URL/categories")
if [ $? -eq 0 ]; then
    echo "❌ API without key: Unexpected success"
else
    echo "✅ API without key: Correctly failed"
fi
echo ""

echo "🎉 API Integration Test Complete!"
echo ""
echo "📖 Next Steps:"
echo "1. Use the API key in your integration code"
echo "2. Test more endpoints as needed"
echo "3. Monitor API usage in the dashboard"
echo "4. Keep the API key secure"
echo ""
echo "🔗 Access the API Integration Dashboard at: http://localhost:5174/api-integration"
