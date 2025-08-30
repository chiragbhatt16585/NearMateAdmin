#!/bin/bash

set -euo pipefail

# NearMate API - Complete cURL Requests Catalogue
# - Logs in to obtain an access token
# - Prints copy-paste-ready curl commands for EVERY documented endpoint
# - Uses your live token in the printed commands for convenience
# - Non-destructive by default: commands are printed, not executed

# Requirements: jq
if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required. Install with: brew install jq (macOS) or apt/yum." >&2
  exit 1
fi

# Configuration
BASE_URL=${BASE_URL:-"http://localhost:4000"}
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@nearmate.local"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"admin123"}

echo "Using BASE_URL=$BASE_URL"

echo "\n🔐 Logging in to obtain token..."
TOKEN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | jq -r '.accessToken')

if [ -z "${TOKEN:-}" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Login failed. Check BASE_URL or credentials." >&2
  exit 1
fi

echo "✅ Token acquired."

print() {
  printf "%s\n" "$1"
}

hr() {
  printf "\n%s\n" "# -----------------------------------------------------------------------------"
}

section() {
  hr
  printf "# %s\n" "$1"
  hr
}

print "\n# Tip: Copy commands directly. They already include your Authorization header."
print "# Set environment variables to tweak defaults: BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD."

################################################################################
#  📱 Auth Endpoints
################################################################################
section "Auth: Login"
print "curl -X POST $BASE_URL/api/v1/auth/login \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"email":"$ADMIN_EMAIL","password":"$ADMIN_PASSWORD"}'"

section "Auth: OTP Management"
print "curl -X POST $BASE_URL/api/v1/auth/request-otp \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"mobile":"+911234567890","userType":"end_user","purpose":"register"}'"

print "curl -X POST $BASE_URL/api/v1/auth/verify-otp-register \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"mobile":"+911234567890","otp":"123456","userType":"end_user","userData":{"name":"John Doe","email":"john@example.com"}}'"

print "curl -X POST $BASE_URL/api/v1/auth/verify-otp-login \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"mobile":"+911234567890","otp":"123456","userType":"end_user"}'"

section "Auth: Mobile Login & Registration Check"
print "curl -X POST $BASE_URL/api/v1/auth/check-mobile-exists \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{\"mobile\":\"+911234567890\",\"userType\":\"end_user\"}'"

print "curl -X POST $BASE_URL/api/v1/auth/login-with-mobile \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{\"mobile\":\"+911234567890\",\"otp\":\"123456\",\"userType\":\"end_user\"}'"

section "Auth: Admin OTP Management (Protected)"
print "curl -X GET $BASE_URL/api/v1/auth/otps?limit=10 \\\n+  -H \"Authorization: Bearer $TOKEN\""

print "curl -X DELETE $BASE_URL/api/v1/auth/otps/expired \\\n+  -H \"Authorization: Bearer $TOKEN\""

################################################################################
#  👥 Users Management (Protected)
################################################################################
section "Users: List/Search"
print "curl -X GET \"$BASE_URL/api/v1/users?search=john\" \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Users: Get by ID"
print "curl -X GET $BASE_URL/api/v1/users/USER_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Users: Create"
print "curl -X POST $BASE_URL/api/v1/users \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"email":"new.user@example.com","name":"New User","password":"secret123","role":"admin"}'"

section "Users: Update"
print "curl -X PATCH $BASE_URL/api/v1/users/USER_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"name":"Updated Name","role":"manager","status":"active","password":"newpass"}'"

section "Users: Delete"
print "curl -X DELETE $BASE_URL/api/v1/users/USER_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

################################################################################
#  📦 Items Management (Protected)
################################################################################
section "Items: List/Search"
print "curl -X GET \"$BASE_URL/api/v1/items?search=drill&skip=0&take=20\" \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Items: Get by ID"
print "curl -X GET $BASE_URL/api/v1/items/ITEM_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Items: Create"
print "curl -X POST $BASE_URL/api/v1/items \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"name":"Power Drill","description":"Cordless 18V drill"}'"

section "Items: Update"
print "curl -X PATCH $BASE_URL/api/v1/items/ITEM_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"name":"Power Drill Pro","description":"Upgraded model","status":"active"}'"

section "Items: Delete"
print "curl -X DELETE $BASE_URL/api/v1/items/ITEM_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

################################################################################
#  🏷️ Categories Management (Protected)
################################################################################
section "Categories: List"
print "curl -X GET $BASE_URL/api/v1/categories \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Categories: Get by ID"
print "curl -X GET $BASE_URL/api/v1/categories/CATEGORY_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Categories: Create"
print "curl -X POST $BASE_URL/api/v1/categories \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"key":"cleaning","label":"Cleaning","icon":"broom","tone":"green","popular":true}'"

section "Categories: Update"
print "curl -X PATCH $BASE_URL/api/v1/categories/CATEGORY_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"label":"Home Cleaning","icon":"broom","tone":"emerald","popular":false}'"

section "Categories: Delete"
print "curl -X DELETE $BASE_URL/api/v1/categories/CATEGORY_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

################################################################################
#  🤝 Partners Management (Protected)
################################################################################
section "Partners: List/Search"
print "curl -X GET \"$BASE_URL/api/v1/partners?search=clean\" \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Partners: Get by ID"
print "curl -X GET $BASE_URL/api/v1/partners/PARTNER_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Partners: Create"
print "curl -X POST $BASE_URL/api/v1/partners \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{
  "name":"Sparkle Services",
  "phone":"+911234500000",
  "email":"sparkle@example.com",
  "categoryKeys":["cleaning"],
  "bank":{"accountName":"Sparkle LLP","accountNumber":"1234567890","ifsc":"HDFC0000001"},
  "serviceRadiusKm":10,
  "isAvailable":true,
  "pricingType":"fixed",
  "priceMin":500,
  "priceMax":2000,
  "plan":"pro",
  "planStatus":"active",
  "boostActive":false,
  "boostStart":"2025-08-01T09:00:00Z",
  "boostEnd":"2025-08-31T17:00:00Z"
}'"

section "Partners: Update"
print "curl -X PATCH $BASE_URL/api/v1/partners/PARTNER_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"isAvailable":false,"priceMax":2500,"plan":"enterprise"}'"

section "Partners: Delete"
print "curl -X DELETE $BASE_URL/api/v1/partners/PARTNER_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Partners: KYC List"
print "curl -X GET $BASE_URL/api/v1/partners/PARTNER_ID_HERE/kyc \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Partners: KYC Create"
print "curl -X POST $BASE_URL/api/v1/partners/PARTNER_ID_HERE/kyc \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"idType":"aadhaar","idNumber":"1234-5678-9012","status":"submitted","docUrl":"https://example.com/doc.pdf"}'"

section "Partners: KYC Update"
print "curl -X PATCH $BASE_URL/api/v1/partners/PARTNER_ID_HERE/kyc/KYC_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"status":"approved"}'"

section "Partners: KYC Delete"
print "curl -X DELETE $BASE_URL/api/v1/partners/PARTNER_ID_HERE/kyc/KYC_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

################################################################################
#  👤 End Users Management (Protected)
################################################################################
section "End Users: List with filters"
print "curl -X GET \"$BASE_URL/api/v1/end-users?search=jane&status=active&page=1&limit=20\" \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "End Users: Get by ID"
print "curl -X GET $BASE_URL/api/v1/end-users/END_USER_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "End Users: Stats"
print "curl -X GET $BASE_URL/api/v1/end-users/END_USER_ID_HERE/stats \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "End Users: Create"
print "curl -X POST $BASE_URL/api/v1/end-users \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"email":"jane@example.com","phone":"+911234567001","name":"Jane Doe","dateOfBirth":"1990-01-01","gender":"female"}'"

section "End Users: Update"
print "curl -X PATCH $BASE_URL/api/v1/end-users/END_USER_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"name":"Jane Smith","status":"active"}'"

section "End Users: Delete"
print "curl -X DELETE $BASE_URL/api/v1/end-users/END_USER_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

################################################################################
#  📍 End User Addresses (Protected)
################################################################################
section "Addresses: List"
print "curl -X GET $BASE_URL/api/v1/end-users/END_USER_ID_HERE/addresses \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Addresses: Get by ID"
print "curl -X GET $BASE_URL/api/v1/end-users/END_USER_ID_HERE/addresses/ADDRESS_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Addresses: Create"
print "curl -X POST $BASE_URL/api/v1/end-users/END_USER_ID_HERE/addresses \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{
  "type":"home",
  "label":"Primary Home",
  "area":"Andheri West",
  "city":"Mumbai",
  "state":"Maharashtra",
  "pincode":"400058",
  "country":"India",
  "lat":19.1197,
  "lng":72.8464,
  "isDefault":true
}'"

section "Addresses: Update"
print "curl -X PATCH $BASE_URL/api/v1/end-users/END_USER_ID_HERE/addresses/ADDRESS_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"label":"Home (Updated)","isDefault":false}'"

section "Addresses: Set Default"
print "curl -X PATCH $BASE_URL/api/v1/end-users/END_USER_ID_HERE/addresses/ADDRESS_ID_HERE/set-default \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Addresses: Delete"
print "curl -X DELETE $BASE_URL/api/v1/end-users/END_USER_ID_HERE/addresses/ADDRESS_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

################################################################################
#  📅 End User Bookings (Protected)
################################################################################
section "Bookings: List with filters"
print "curl -X GET \"$BASE_URL/api/v1/end-users/END_USER_ID_HERE/bookings?status=pending&partnerId=PARTNER_ID_HERE&categoryId=CATEGORY_ID_HERE&page=1&limit=20\" \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Bookings: Stats"
print "curl -X GET $BASE_URL/api/v1/end-users/END_USER_ID_HERE/bookings/stats \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Bookings: Get by ID"
print "curl -X GET $BASE_URL/api/v1/end-users/END_USER_ID_HERE/bookings/BOOKING_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Bookings: Create"
print "curl -X POST $BASE_URL/api/v1/end-users/END_USER_ID_HERE/bookings \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{
  "partnerId":"PARTNER_ID_HERE",
  "categoryId":"CATEGORY_ID_HERE",
  "serviceDescription":"Deep cleaning 2BHK",
  "scheduledDate":"2025-08-25",
  "scheduledTime":"10:00",
  "priority":"normal",
  "addressId":"ADDRESS_ID_HERE",
  "customAddress":"",
  "lat":51.5238,
  "lng":-0.1586,
  "quotedPrice":1500
}'"

section "Bookings: Update"
print "curl -X PATCH $BASE_URL/api/v1/end-users/END_USER_ID_HERE/bookings/BOOKING_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"status":"confirmed","finalPrice":1600,"paymentStatus":"pending"}'"

section "Bookings: Delete"
print "curl -X DELETE $BASE_URL/api/v1/end-users/END_USER_ID_HERE/bookings/BOOKING_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

################################################################################
#  💳 End User Billing (Protected)
################################################################################
section "Billing: List with filters"
print "curl -X GET \"$BASE_URL/api/v1/end-users/END_USER_ID_HERE/billing?paymentStatus=paid&paymentMethod=upi&page=1&limit=20\" \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Billing: Stats"
print "curl -X GET $BASE_URL/api/v1/end-users/END_USER_ID_HERE/billing/stats \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Billing: Get by ID"
print "curl -X GET $BASE_URL/api/v1/end-users/END_USER_ID_HERE/billing/BILLING_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\""

section "Billing: Create"
print "curl -X POST $BASE_URL/api/v1/end-users/END_USER_ID_HERE/billing \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{
  "bookingId":"BOOKING_ID_HERE",
  "amount":1600,
  "currency":"INR",
  "taxAmount":100,
  "discountAmount":0,
  "paymentMethod":"upi",
  "invoiceNumber":"INV-2025-0001",
  "dueDate":"2025-08-30"
}'"

section "Billing: Update"
print "curl -X PATCH $BASE_URL/api/v1/end-users/END_USER_ID_HERE/billing/BILLING_ID_HERE \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{
  "amount":1600,
  "taxAmount":100,
  "discountAmount":0,
  "paymentMethod":"upi",
  "paymentStatus":"paid",
  "transactionId":"TXN123456",
  "paidAt":"2025-08-25T12:30:00Z",
  "invoiceNumber":"INV-2025-0001",
  "dueDate":"2025-08-30"
}'"

section "Billing: Mark Paid"
print "curl -X PATCH $BASE_URL/api/v1/end-users/END_USER_ID_HERE/billing/BILLING_ID_HERE/mark-paid \\\n+  -H \"Authorization: Bearer $TOKEN\" \\\n+  -H \"Content-Type: application/json\" \\\n+  -d '{"paymentMethod":"upi","transactionId":"TXN123456"}'"

echo "\n✨ All commands printed. Replace placeholders like USER_ID_HERE, PARTNER_ID_HERE as needed."


