#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Generate JWT token
TOKEN=$(bun test-jwt.js)
echo -e "${GREEN}Generated JWT token${NC}"
echo "===================="
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local expected=$4
    local description=$5
    
    echo -n "$description: "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -H "Authorization: Bearer $TOKEN" "$url")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$data" "$url")
    elif [ "$method" = "PATCH" ]; then
        response=$(curl -s -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$data" "$url")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -X DELETE -H "Authorization: Bearer $TOKEN" "$url")
    fi
    
    success=$(echo "$response" | jq -r '.success')
    
    if [ "$success" = "$expected" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Response: $response"
    fi
}

echo -e "${GREEN}Testing Contractor Lists Endpoints${NC}"
echo "==================================="

# Get a list ID for testing
LIST_ID=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4001/api/v1/contractor-lists | jq -r '.data[0].id')
VALID_CONTRACTOR_ID="f3993126-9a38-4445-9d52-7f3fde91ad47"

test_endpoint "GET" "http://localhost:4001/api/v1/contractor-lists" "" "true" "GET /contractor-lists"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-lists/favorites" "" "true" "GET /contractor-lists/favorites"
test_endpoint "POST" "http://localhost:4001/api/v1/contractor-lists" '{"name":"Test List 2","description":"Testing"}' "true" "POST /contractor-lists (create)"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-lists/$LIST_ID" "" "true" "GET /contractor-lists/:id"
test_endpoint "PATCH" "http://localhost:4001/api/v1/contractor-lists/$LIST_ID" '{"description":"Updated description"}' "true" "PATCH /contractor-lists/:id"
test_endpoint "POST" "http://localhost:4001/api/v1/contractor-lists/toggle-favorite" "{\"contractorProfileId\":\"$VALID_CONTRACTOR_ID\"}" "true" "POST /toggle-favorite"
test_endpoint "POST" "http://localhost:4001/api/v1/contractor-lists/$LIST_ID/items" "{\"contractorProfileId\":\"$VALID_CONTRACTOR_ID\"}" "true" "POST /:id/items (add)"
test_endpoint "DELETE" "http://localhost:4001/api/v1/contractor-lists/$LIST_ID/items/$VALID_CONTRACTOR_ID" "" "true" "DELETE /:id/items/:contractorId"
test_endpoint "POST" "http://localhost:4001/api/v1/contractor-lists/check-favorites" '{"contractorProfileIds":["262c0a89-9812-4b8e-b869-1aed3df3822c"]}' "true" "POST /check-favorites"
test_endpoint "POST" "http://localhost:4001/api/v1/contractor-lists/ensure-default" "" "true" "POST /ensure-default"

echo ""
echo -e "${GREEN}Testing Contractor Profiles Endpoints${NC}"
echo "======================================"

test_endpoint "GET" "http://localhost:4001/api/v1/contractor-profiles?limit=2" "" "true" "GET /contractor-profiles"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-profiles/262c0a89-9812-4b8e-b869-1aed3df3822c" "" "true" "GET /contractor-profiles/:id"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-profiles/by-name/RAYTHEON" "" "true" "GET /by-name/:name"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-profiles/top/totalObligated?limit=2" "" "true" "GET /top/:metric"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-profiles/filters/options" "" "true" "GET /filters/options"

echo ""
echo -e "${GREEN}Testing Auth Requirements${NC}"
echo "========================="

# Test without token (should fail for contractor-lists)
echo -n "Contractor-lists without auth: "
response=$(curl -s "http://localhost:4001/api/v1/contractor-lists/favorites")
success=$(echo "$response" | jq -r '.success')
if [ "$success" = "false" ]; then
    echo -e "${GREEN}✓ PASS (correctly rejected)${NC}"
else
    echo -e "${RED}✗ FAIL (should require auth)${NC}"
fi

# Test profiles without token (should work - public data)
echo -n "Contractor-profiles without auth: "
response=$(curl -s "http://localhost:4001/api/v1/contractor-profiles?limit=1")
success=$(echo "$response" | jq -r '.success')
if [ "$success" = "true" ]; then
    echo -e "${GREEN}✓ PASS (public access works)${NC}"
else
    echo -e "${RED}✗ FAIL (should allow public access)${NC}"
fi

echo ""
echo "Testing complete!"