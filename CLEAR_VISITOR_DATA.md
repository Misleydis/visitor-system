# How to Clear Visitor Data

## Method 1: Using the Admin Dashboard (Recommended)

1. Login as an admin user
2. Navigate to the Admin Dashboard
3. Scroll to the "Data Management" section
4. Click the "Clear All Visitors" button
5. Confirm the action when prompted

## Method 2: Using MongoDB Atlas (Manual)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to your cluster
3. Go to the "Collections" tab
4. Select the `visitors` collection
5. Click on the "Delete" button to delete all documents
6. Confirm the deletion

## Method 3: Using MongoDB Shell

```bash
# Connect to your MongoDB database
mongosh "mongodb+srv://mislchir1_db_user:Mislchir0@visitors.zr7dpx0.mongodb.net/?appName=visitors"

# Switch to your database
use visitors

# Delete all visitor records
db.visitors.deleteMany({})
```

## Method 4: Using Backend API (REST)

```bash
# Requires admin authentication
curl -X DELETE http://192.168.1.55:5000/api/visitors/clear-all \
  -H "x-auth-token: YOUR_ADMIN_TOKEN"
```

## Method 5: Using GraphQL

```graphql
mutation {
  clearAllVisitors {
    msg
  }
}
```

## Important Notes

- **Data Loss**: Clearing visitor data is permanent and cannot be undone
- **Permissions**: Only users with `admin` role can clear visitor data
- **Activity Logs**: The clear action is logged in the activity logs for audit purposes
- **Real-time Updates**: If the app is connected via socket.io, the clear action will be broadcast to all connected clients

## Backend Implementation Details

The clear all visitors functionality is implemented in:

- **Controller**: `apps/api/src/controllers/visitors/deleteVisitorController.js`
- **Route**: `apps/api/src/routes/visitors.routes.js` (DELETE /api/visitors/clear-all)
- **GraphQL Schema**: `apps/api/src/graphql/typeDefs.js`
- **GraphQL Resolver**: `apps/api/src/graphql/resolvers.js`
- **Frontend**: `apps/mobile/screens/AdminScreen.js`
