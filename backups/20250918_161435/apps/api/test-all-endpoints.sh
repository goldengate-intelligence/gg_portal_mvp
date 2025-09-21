#\!/bin/bash

# Generate JWT token
TOKEN=$(bun test-jwt.js)
echo "Generated JWT token"
echo "===================="
echo ""

# Test contractor-lists endpoints
echo "Testing Contractor Lists Endpoints"
echo "==================================="
echo ""

echo "1. GET /contractor-lists (Get all lists)"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4001/api/v1/contractor-lists | jq '.'
echo ""

echo "2. GET /contractor-lists/favorites (Get favorites)"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4001/api/v1/contractor-lists/favorites | jq '.success, .data.contractorIds'
echo ""

echo "3. POST /contractor-lists (Create new list)"
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Test List","description":"Testing auth","color":"#FF0000"}' \
  http://localhost:4001/api/v1/contractor-lists | jq '.'
echo ""

echo "4. GET /contractor-lists/:id (Get specific list)"
# First get the list ID from the previous response
LIST_ID=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4001/api/v1/contractor-lists | jq -r '.data[0].id')
echo "Using list ID: $LIST_ID"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4001/api/v1/contractor-lists/$LIST_ID | jq '.success, .data.list.name'
echo ""

echo "5. POST /contractor-lists/toggle-favorite (Toggle favorite)"
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"contractorProfileId":"8a9b50a3-22f0-42e5-88b0-e25a26f8e8cf"}' \
  http://localhost:4001/api/v1/contractor-lists/toggle-favorite | jq '.'
echo ""

echo "6. PATCH /contractor-lists/:id (Update list)"
curl -s -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Updated List Name"}' \
  http://localhost:4001/api/v1/contractor-lists/$LIST_ID | jq '.success'
echo ""

echo "7. POST /contractor-lists/:id/items (Add item to list)"
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"contractorProfileId":"8a9b50a3-22f0-42e5-88b0-e25a26f8e8cf"}' \
  http://localhost:4001/api/v1/contractor-lists/$LIST_ID/items | jq '.success'
echo ""

echo "8. DELETE /contractor-lists/:id/items/:contractorId (Remove from list)"
curl -s -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:4001/api/v1/contractor-lists/$LIST_ID/items/8a9b50a3-22f0-42e5-88b0-e25a26f8e8cf | jq '.'
echo ""

echo "9. POST /contractor-lists/check-favorites (Check multiple favorites)"
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"contractorProfileIds":["262c0a89-9812-4b8e-b869-1aed3df3822c","8a9b50a3-22f0-42e5-88b0-e25a26f8e8cf"]}' \
  http://localhost:4001/api/v1/contractor-lists/check-favorites | jq '.'
echo ""

echo "10. POST /contractor-lists/ensure-default (Ensure default list)"
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:4001/api/v1/contractor-lists/ensure-default | jq '.success, .data.name'
echo ""
