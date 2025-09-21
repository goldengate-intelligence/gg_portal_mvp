#\!/bin/bash

# Generate JWT token
TOKEN=$(bun test-jwt.js)

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Verifying All API Endpoints${NC}"
echo "======================================"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local description=$3
    local needs_auth=$4
    
    echo -n "$description: "
    
    if [ "$needs_auth" = "auth" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method -H "Authorization: Bearer $TOKEN" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$url")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "${GREEN}✓ OK ($response)${NC}"
    elif [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo -e "${YELLOW}⚠ Auth Required ($response)${NC}"
    elif [ "$response" = "404" ]; then
        echo -e "${RED}✗ NOT FOUND ($response)${NC}"
    elif [ "$response" = "400" ]; then
        echo -e "${YELLOW}⚠ Bad Request ($response)${NC}"
    elif [ "$response" = "500" ]; then
        echo -e "${RED}✗ SERVER ERROR ($response)${NC}"
    else
        echo -e "${RED}✗ UNEXPECTED ($response)${NC}"
    fi
}

echo -e "${GREEN}Health & Metadata Endpoints${NC}"
echo "------------------------------"
test_endpoint "GET" "http://localhost:4001/" "Root endpoint" "no"
test_endpoint "GET" "http://localhost:4001/health" "Health check" "no"
test_endpoint "GET" "http://localhost:4001/docs" "Swagger UI" "no"
test_endpoint "GET" "http://localhost:4001/docs/json" "OpenAPI JSON" "no"

echo ""
echo -e "${GREEN}Authentication Endpoints${NC}"
echo "------------------------------"
test_endpoint "GET" "http://localhost:4001/api/v1/auth/me" "/auth/me" "auth"
test_endpoint "POST" "http://localhost:4001/api/v1/auth/login" "/auth/login" "no"
test_endpoint "POST" "http://localhost:4001/api/v1/auth/register" "/auth/register" "no"
test_endpoint "POST" "http://localhost:4001/api/v1/auth/logout" "/auth/logout" "auth"

echo ""
echo -e "${GREEN}Contractor Lists Endpoints${NC}"
echo "------------------------------"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-lists" "GET /contractor-lists" "auth"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-lists/favorites" "GET /favorites" "auth"
test_endpoint "POST" "http://localhost:4001/api/v1/contractor-lists" "POST /contractor-lists" "auth"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-lists/7f10b7cf-5d70-4f77-bc82-8b7a4a942359" "GET /:listId" "auth"
test_endpoint "PATCH" "http://localhost:4001/api/v1/contractor-lists/7f10b7cf-5d70-4f77-bc82-8b7a4a942359" "PATCH /:listId" "auth"
test_endpoint "DELETE" "http://localhost:4001/api/v1/contractor-lists/test-delete" "DELETE /:listId" "auth"
test_endpoint "POST" "http://localhost:4001/api/v1/contractor-lists/toggle-favorite" "POST /toggle-favorite" "auth"
test_endpoint "POST" "http://localhost:4001/api/v1/contractor-lists/check-favorites" "POST /check-favorites" "auth"
test_endpoint "POST" "http://localhost:4001/api/v1/contractor-lists/ensure-default" "POST /ensure-default" "auth"
test_endpoint "POST" "http://localhost:4001/api/v1/contractor-lists/7f10b7cf-5d70-4f77-bc82-8b7a4a942359/items" "POST /:listId/items" "auth"
test_endpoint "DELETE" "http://localhost:4001/api/v1/contractor-lists/7f10b7cf-5d70-4f77-bc82-8b7a4a942359/items/test" "DELETE /:listId/items/:id" "auth"

echo ""
echo -e "${GREEN}Contractor Profiles Endpoints${NC}"
echo "------------------------------"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-profiles" "GET /contractor-profiles" "no"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-profiles/262c0a89-9812-4b8e-b869-1aed3df3822c" "GET /:profileId" "no"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-profiles/by-name/BOEING" "GET /by-name/:name" "no"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-profiles/top/totalObligated" "GET /top/:metric" "no"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-profiles/filters/options" "GET /filters/options" "no"
test_endpoint "POST" "http://localhost:4001/api/v1/contractor-profiles/aggregate" "POST /aggregate (admin)" "auth"
test_endpoint "POST" "http://localhost:4001/api/v1/contractor-profiles/aggregate/incremental" "POST /aggregate/incremental" "auth"
test_endpoint "GET" "http://localhost:4001/api/v1/contractor-profiles/aggregate/status" "GET /aggregate/status" "auth"

echo ""
echo -e "${GREEN}Contractors (Raw Data) Endpoints${NC}"
echo "------------------------------"
test_endpoint "GET" "http://localhost:4001/api/v1/contractors" "GET /contractors" "auth"
test_endpoint "GET" "http://localhost:4001/api/v1/contractors/XJQXD8HHB9Q7" "GET /:uei" "auth"
test_endpoint "GET" "http://localhost:4001/api/v1/contractors/search/boeing" "GET /search/:term" "auth"
test_endpoint "GET" "http://localhost:4001/api/v1/contractors/top/obligated_amount" "GET /top/:metric" "auth"
test_endpoint "GET" "http://localhost:4001/api/v1/contractors/stats/summary" "GET /stats/summary" "auth"
test_endpoint "GET" "http://localhost:4001/api/v1/contractors/filters/options" "GET /filters/options" "auth"
test_endpoint "POST" "http://localhost:4001/api/v1/contractors/admin/import/csv" "POST /admin/import/csv" "auth"
test_endpoint "POST" "http://localhost:4001/api/v1/contractors/admin/sync/snowflake" "POST /admin/sync/snowflake" "auth"

echo ""
echo -e "${GREEN}Snowflake Endpoints${NC}"
echo "------------------------------"
test_endpoint "GET" "http://localhost:4001/api/v1/snowflake/connection/test" "GET /connection/test" "auth"
test_endpoint "GET" "http://localhost:4001/api/v1/snowflake/metadata/tables" "GET /metadata/tables" "auth"
test_endpoint "GET" "http://localhost:4001/api/v1/snowflake/metadata/columns/CONTRACTS" "GET /metadata/columns/:table" "auth"
test_endpoint "POST" "http://localhost:4001/api/v1/snowflake/query/select" "POST /query/select" "auth"
test_endpoint "POST" "http://localhost:4001/api/v1/snowflake/query/execute" "POST /query/execute" "auth"
test_endpoint "GET" "http://localhost:4001/api/v1/snowflake/query/history" "GET /query/history" "auth"
test_endpoint "GET" "http://localhost:4001/api/v1/snowflake/cache/stats" "GET /cache/stats" "auth"
test_endpoint "POST" "http://localhost:4001/api/v1/snowflake/cache/clear" "POST /cache/clear" "auth"

echo ""
echo -e "${GREEN}Test Endpoints${NC}"
echo "------------------------------"
test_endpoint "GET" "http://localhost:4001/api/v1/test/hello" "GET /test/hello" "no"
test_endpoint "GET" "http://localhost:4001/api/v1/test/tenant/123" "GET /test/tenant/:id" "no"

echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "--------"
echo "Endpoints tested above should return 200/201 for success"
echo "401/403 for auth required is expected for protected endpoints"
echo "404 means the endpoint doesn't exist"
echo "500 means server error"
