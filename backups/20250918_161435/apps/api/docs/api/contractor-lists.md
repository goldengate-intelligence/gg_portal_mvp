# Contractor Lists API

API endpoints for managing contractor portfolios, favorites, and custom lists.

## Overview

Contractor Lists allow users to organize contractors into portfolios for tracking, comparison, and analysis. Each user can have multiple lists including a default favorites list. Lists can be shared with other users or made public.

## Endpoints

### Get User's Lists

Get all lists belonging to the authenticated user.

**Endpoint:** `GET /api/v1/contractor-lists`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| includeShared | boolean | No | Include lists shared with user |
| includePublic | boolean | No | Include public lists |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "list-001",
      "userId": "user-001",
      "name": "Favorites",
      "description": "My favorite contractors",
      "isDefault": true,
      "isPublic": false,
      "color": "#FF5733",
      "icon": "star",
      "sortOrder": 0,
      "itemCount": 25,
      "totalValue": "125000000",
      "lastItemAddedAt": "2024-01-15T10:30:00Z",
      "settings": {
        "notifications": true,
        "autoUpdate": true,
        "defaultView": "grid"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "list-002",
      "userId": "user-001",
      "name": "IT Services Vendors",
      "description": "Potential IT service providers",
      "isDefault": false,
      "isPublic": false,
      "color": "#3498DB",
      "icon": "folder",
      "sortOrder": 1,
      "itemCount": 45,
      "totalValue": "250000000",
      "lastItemAddedAt": "2024-01-14T15:20:00Z",
      "settings": {
        "notifications": false,
        "autoUpdate": false,
        "defaultView": "table"
      },
      "createdAt": "2024-01-05T00:00:00Z",
      "updatedAt": "2024-01-14T15:20:00Z"
    }
  ]
}
```

### Create New List

Create a new contractor list.

**Endpoint:** `POST /api/v1/contractor-lists`

**Authentication:** Required

**Request Body:**

```json
{
  "name": "Defense Contractors",
  "description": "Top defense contractors for upcoming RFP",
  "isPublic": false,
  "color": "#2ECC71",
  "icon": "shield",
  "settings": {
    "notifications": true,
    "autoUpdate": false,
    "defaultView": "table"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "list-003",
    "userId": "user-001",
    "name": "Defense Contractors",
    "description": "Top defense contractors for upcoming RFP",
    "isDefault": false,
    "isPublic": false,
    "color": "#2ECC71",
    "icon": "shield",
    "sortOrder": 2,
    "itemCount": 0,
    "totalValue": "0",
    "lastItemAddedAt": null,
    "settings": {
      "notifications": true,
      "autoUpdate": false,
      "defaultView": "table"
    },
    "createdAt": "2024-01-16T00:00:00Z",
    "updatedAt": "2024-01-16T00:00:00Z"
  }
}
```

### Get List Details

Get detailed information about a specific list.

**Endpoint:** `GET /api/v1/contractor-lists/:id`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | List UUID |

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "list-001",
    "userId": "user-001",
    "name": "Favorites",
    "description": "My favorite contractors",
    "isDefault": true,
    "isPublic": false,
    "color": "#FF5733",
    "icon": "star",
    "sortOrder": 0,
    "itemCount": 25,
    "totalValue": "125000000",
    "lastItemAddedAt": "2024-01-15T10:30:00Z",
    "settings": {
      "notifications": true,
      "autoUpdate": true,
      "defaultView": "grid"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "owner": {
      "id": "user-001",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "shareCount": 3,
    "viewCount": 150
  }
}
```

### Update List

Update list properties.

**Endpoint:** `PUT /api/v1/contractor-lists/:id`

**Authentication:** Required

**Request Body:**

```json
{
  "name": "Updated List Name",
  "description": "Updated description",
  "color": "#E74C3C",
  "icon": "star-filled",
  "isPublic": true,
  "settings": {
    "notifications": false,
    "defaultView": "table"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    // Updated list object
  }
}
```

### Delete List

Delete a contractor list.

**Endpoint:** `DELETE /api/v1/contractor-lists/:id`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "List deleted successfully"
}
```

**Note:** Cannot delete the default list.

### Get List Items

Get all contractors in a list.

**Endpoint:** `GET /api/v1/contractor-lists/:id/items`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20) |
| sort | string | No | Sort field |
| order | string | No | Sort order (asc/desc) |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "item-001",
      "listId": "list-001",
      "contractorProfileId": "contractor-001",
      "notes": "Great past performance on similar projects",
      "tags": ["preferred", "tier-1"],
      "rating": 5,
      "priority": "high",
      "addedBy": "user-001",
      "addedAt": "2024-01-10T00:00:00Z",
      "lastViewedAt": "2024-01-15T10:00:00Z",
      "viewCount": 12,
      "customData": {
        "internalScore": 95,
        "lastContact": "2024-01-14"
      },
      "contractor": {
        "id": "contractor-001",
        "name": "ACME TECHNOLOGIES INC",
        "uei": "ZQGGHJH74DW7",
        "state": "VA",
        "totalContractValue": "125000000",
        "employeeCount": 150,
        "certifications": {
          "sba8a": true,
          "womanOwned": true
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2,
    "hasMore": true
  }
}
```

### Add Contractor to List

Add a contractor to a list.

**Endpoint:** `POST /api/v1/contractor-lists/:id/items`

**Authentication:** Required

**Request Body:**

```json
{
  "contractorProfileId": "contractor-002",
  "notes": "Recommended by procurement team",
  "tags": ["recommended", "small-business"],
  "rating": 4,
  "priority": "medium",
  "customData": {
    "reviewedBy": "Jane Smith",
    "reviewDate": "2024-01-16"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "item-002",
    "listId": "list-001",
    "contractorProfileId": "contractor-002",
    "notes": "Recommended by procurement team",
    "tags": ["recommended", "small-business"],
    "rating": 4,
    "priority": "medium",
    "addedBy": "user-001",
    "addedAt": "2024-01-16T00:00:00Z",
    "customData": {
      "reviewedBy": "Jane Smith",
      "reviewDate": "2024-01-16"
    }
  }
}
```

### Remove Contractor from List

Remove a contractor from a list.

**Endpoint:** `DELETE /api/v1/contractor-lists/:listId/items/:itemId`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Contractor removed from list"
}
```

### Update List Item

Update properties of a contractor in a list.

**Endpoint:** `PUT /api/v1/contractor-lists/:listId/items/:itemId`

**Authentication:** Required

**Request Body:**

```json
{
  "notes": "Updated notes about this contractor",
  "tags": ["verified", "tier-1", "preferred"],
  "rating": 5,
  "priority": "high",
  "customData": {
    "lastReview": "2024-01-16",
    "nextReviewDate": "2024-04-16"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    // Updated item object
  }
}
```

### Batch Add Contractors

Add multiple contractors to a list at once.

**Endpoint:** `POST /api/v1/contractor-lists/:id/items/batch`

**Authentication:** Required

**Request Body:**

```json
{
  "contractors": [
    {
      "contractorProfileId": "contractor-003",
      "notes": "Batch added",
      "tags": ["bulk-import"]
    },
    {
      "contractorProfileId": "contractor-004",
      "notes": "Batch added",
      "tags": ["bulk-import"]
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "added": 2,
    "skipped": 0,
    "errors": [],
    "items": [
      // Array of created items
    ]
  }
}
```

### Toggle Favorite

Quick toggle to add/remove contractor from default favorites list.

**Endpoint:** `POST /api/v1/contractor-lists/toggle-favorite`

**Authentication:** Required

**Request Body:**

```json
{
  "contractorProfileId": "contractor-001"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "isFavorite": true,
    "listId": "list-001",
    "itemId": "item-001"
  }
}
```

### Check Favorite Status

Check if contractors are in the user's favorites list.

**Endpoint:** `POST /api/v1/contractor-lists/check-favorites`

**Authentication:** Required

**Request Body:**

```json
{
  "contractorProfileIds": ["contractor-001", "contractor-002", "contractor-003"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "contractor-001": true,
    "contractor-002": false,
    "contractor-003": true
  }
}
```

### Share List

Share a list with other users.

**Endpoint:** `POST /api/v1/contractor-lists/:id/share`

**Authentication:** Required

**Request Body:**

```json
{
  "sharedWithUserId": "user-002", // OR
  "sharedWithEmail": "jane@example.com",
  "permission": "view", // view or edit
  "expiresAt": "2024-12-31T23:59:59Z" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "share-001",
    "listId": "list-001",
    "sharedWithUserId": "user-002",
    "permission": "view",
    "sharedBy": "user-001",
    "sharedAt": "2024-01-16T00:00:00Z",
    "accessToken": "share_token_123", // For email sharing
    "expiresAt": "2024-12-31T23:59:59Z"
  }
}
```

### Get List Activity

Get activity log for a list.

**Endpoint:** `GET /api/v1/contractor-lists/:id/activity`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| startDate | string | No | Filter activities after date |
| endDate | string | No | Filter activities before date |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "activity-001",
      "listId": "list-001",
      "userId": "user-001",
      "action": "added",
      "itemId": "item-001",
      "metadata": {
        "contractorName": "ACME TECHNOLOGIES INC",
        "contractorId": "contractor-001"
      },
      "createdAt": "2024-01-16T10:00:00Z"
    },
    {
      "id": "activity-002",
      "listId": "list-001",
      "userId": "user-001",
      "action": "shared",
      "metadata": {
        "sharedWith": "jane@example.com",
        "permission": "view"
      },
      "createdAt": "2024-01-16T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}
```

### Export List

Export list data in various formats.

**Endpoint:** `POST /api/v1/contractor-lists/:id/export`

**Authentication:** Required

**Request Body:**

```json
{
  "format": "csv", // csv, excel, json, pdf
  "includeContractorDetails": true,
  "includeNotes": true,
  "includeTags": true,
  "includeCustomData": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "exportId": "export-001",
    "status": "processing",
    "format": "csv",
    "downloadUrl": null,
    "expiresAt": "2024-01-17T00:00:00Z"
  }
}
```

### Copy List

Create a copy of an existing list.

**Endpoint:** `POST /api/v1/contractor-lists/:id/copy`

**Authentication:** Required

**Request Body:**

```json
{
  "name": "Copy of Defense Contractors",
  "includeItems": true,
  "includeSettings": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    // New list object with copied data
  }
}
```

## Data Models

### List Schema

```typescript
interface ContractorList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  color?: string;
  icon?: string;
  sortOrder: number;
  itemCount: number;
  totalValue: string;
  lastItemAddedAt?: Date;
  settings: {
    notifications?: boolean;
    autoUpdate?: boolean;
    defaultView?: 'grid' | 'table';
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### List Item Schema

```typescript
interface ContractorListItem {
  id: string;
  listId: string;
  contractorProfileId: string;
  notes?: string;
  tags: string[];
  rating?: number;
  priority?: 'high' | 'medium' | 'low';
  addedBy: string;
  addedAt: Date;
  lastViewedAt?: Date;
  viewCount: number;
  customData?: Record<string, any>;
}
```

## Error Responses

### 404 Not Found

```json
{
  "success": false,
  "error": "LIST_NOT_FOUND",
  "message": "Contractor list not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "error": "CONTRACTOR_ALREADY_IN_LIST",
  "message": "Contractor is already in this list"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "INSUFFICIENT_PERMISSIONS",
  "message": "You don't have permission to modify this list"
}
```

## Webhooks

Configure webhooks to receive notifications about list events:

```json
{
  "event": "list.item.added",
  "listId": "list-001",
  "itemId": "item-001",
  "contractorId": "contractor-001",
  "userId": "user-001",
  "timestamp": "2024-01-16T10:00:00Z"
}
```

Available events:
- `list.created`
- `list.updated`
- `list.deleted`
- `list.item.added`
- `list.item.removed`
- `list.item.updated`
- `list.shared`
- `list.exported`

## Best Practices

1. **Default List**: Each user automatically has a default favorites list that cannot be deleted
2. **Batch Operations**: Use batch endpoints when adding multiple contractors
3. **Sharing**: Use time-limited shares for temporary access
4. **Tags**: Use consistent tag naming for better organization
5. **Custom Data**: Store additional metadata specific to your use case
6. **Activity Tracking**: Monitor list activity for audit purposes

## Related APIs

- [Contractor Profiles API](./contractor-profiles.md) - Get contractor details
- [Authentication API](./authentication.md) - User authentication
- [Snowflake API](./snowflake.md) - Advanced list analytics