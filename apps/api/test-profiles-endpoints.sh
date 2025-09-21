#\!/bin/bash

# Generate JWT token
TOKEN=$(bun test-jwt.js)
echo "Testing Contractor Profiles Endpoints"
echo "======================================"
echo ""

echo "1. GET /contractor-profiles (Get profiles list)"
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:4001/api/v1/contractor-profiles?limit=2" | jq '.success, .data | length'
echo ""

echo "2. GET /contractor-profiles/:id (Get specific profile)"
PROFILE_ID="262c0a89-9812-4b8e-b869-1aed3df3822c"
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:4001/api/v1/contractor-profiles/$PROFILE_ID" | jq '.success, .data.profile.displayName'
echo ""

echo "3. GET /contractor-profiles/by-name/:name (Get by name)"
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:4001/api/v1/contractor-profiles/by-name/RAYTHEON" | jq '.success, .data.displayName'
echo ""

echo "4. GET /contractor-profiles/top/:metric (Get top by metric)"
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:4001/api/v1/contractor-profiles/top/totalObligated?limit=2" | jq '.success, .data | length'
echo ""

echo "5. GET /contractor-profiles/filters/options (Get filter options)"
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:4001/api/v1/contractor-profiles/filters/options" | jq '.success, .data | keys'
echo ""

echo "6. Testing without auth (should work - profiles are public)"
curl -s "http://localhost:4001/api/v1/contractor-profiles?limit=1" | jq '.success'
echo ""

echo "7. Testing admin endpoint without admin role (should fail)"
curl -s -X POST -H "Authorization: Bearer $TOKEN" "http://localhost:4001/api/v1/contractor-profiles/aggregate" | jq '.success, .error'
echo ""
