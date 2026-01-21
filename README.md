# Contract Management Platform

A full-stack Contract Management Platform built with MERN stack (MongoDB, Express, React, Node.js) that enables users to create reusable contract templates (Blueprints), generate contracts from those templates, and manage contract lifecycles with strict state machine enforcement.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Setup Instructions](#setup-instructions)
- [API Design](#api-design)
- [Database Schema](#database-schema)
- [Assumptions and Trade-offs](#assumptions-and-trade-offs)
- [Project Structure](#project-structure)
- [Testing](#testing)

## ✨ Features

### 1. Blueprint Management
- Create reusable contract templates with configurable fields
- Supported field types: Text, Date, Signature, Checkbox
- Each field stores: type, label, and position (x/y coordinates)
- Full CRUD operations (Create, Read, Update, Delete)

### 2. Contract Creation
- Select an existing blueprint
- Generate contract instances from blueprints
- Contracts inherit all blueprint fields
- Enter values for contract fields
- Persistent contract data storage

### 3. Contract Lifecycle Management
- Strict state machine enforcement: `Created → Approved → Sent → Signed → Locked`
- Revocation allowed at `Created` or `Sent` stages
- Backend-enforced transitions (invalid transitions rejected)
- **Locked** is the final immutable state (no further transitions allowed)
- **Revoked** contracts are also immutable
- Frontend reflects current status and allowed actions

### 4. Dashboard & Contract Listing
- Table view showing all contracts
- Displays: Contract name, Blueprint name, Status, Created date
- Filter contracts by: All, Pending (Created/Approved/Sent), Signed
- Action buttons based on current contract status

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Environment**: dotenv for configuration

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **UI Libraries**: 
  - Framer Motion (animations)
  - Lucide React (icons)
  - React Hot Toast (notifications)
- **Styling**: Plain CSS (no external styling libraries)

### Why This Stack?
- **MongoDB**: Flexible schema for dynamic contract fields, easy to extend
- **Express**: Lightweight, fast, excellent for REST APIs
- **React**: Component-based architecture, great developer experience
- **Vite**: Fast development server and optimized builds
- **Plain CSS**: Full control, no external dependencies, better performance

## 🏗 Architecture Overview

### Backend Architecture
```
┌─────────────────┐
│   Express App   │
│   (index.js)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Routes  │
    └───┬─────┘
        │
   ┌────┴──────┐
   │Controllers│
   └────┬──────┘
        │
   ┌────┴────┐
   │ Models  │
   └────┬────┘
        │
   ┌────┴────┐
   │ MongoDB │
   └─────────┘
```

**Pattern**: MVC (Model-View-Controller)
- **Models**: Mongoose schemas (Blueprint, Contract)
- **Controllers**: Business logic and validation
- **Routes**: API endpoint definitions

### Frontend Architecture
```
┌─────────────────┐
│   App.jsx       │
│   (Router)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Layout  │
    └───┬─────┘
        │
   ┌────┴────┐
   │ Pages   │
   │ - Dashboard
   │ - Blueprints
   │ - Create Contract
   └────┬────┘
        │
   ┌────┴────┐
   │ Services│
   │ (API)   │
   └─────────┘
```

**Pattern**: Component-based with service layer
- **Components**: Reusable UI components
- **Services**: API communication layer
- **State Management**: React hooks (useState, useEffect)

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```env
   MONGODB_URI=mongodb://localhost:27017/contractmanagement
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   - Local: Ensure MongoDB service is running
   - Atlas: Use your connection string in `MONGODB_URI`

5. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL** (if needed)
   - Default: `http://localhost:5000/api`
   - Can be overridden with `VITE_API_URL` environment variable

4. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173` (or next available port)

5. **Build for production**
   ```bash
   npm run build
   ```

## 📡 API Design

### Base URL
```
http://localhost:5000/api
```

### Blueprint Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/blueprints` | Create a new blueprint | `{ name: string, fields: array }` |
| `GET` | `/blueprints` | Get all blueprints | - |
| `GET` | `/blueprints/:id` | Get blueprint by ID | - |
| `PUT` | `/blueprints/:id` | Update blueprint | `{ name: string, fields: array }` |
| `DELETE` | `/blueprints/:id` | Delete blueprint | - |

**Example Request (Create Blueprint)**:
```json
POST /api/blueprints
{
  "name": "Employment Contract",
  "fields": [
    {
      "label": "Employee Name",
      "fieldType": "text",
      "position": { "x": 0, "y": 0 }
    },
    {
      "label": "Start Date",
      "fieldType": "date",
      "position": { "x": 0, "y": 1 }
    }
  ]
}
```

### Contract Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/contracts` | Create a new contract | `{ blueprintId: string, data: object }` |
| `GET` | `/contracts` | Get all contracts | - |
| `PATCH` | `/contracts/:id/status` | Update contract status | `{ status: string }` |

**Example Request (Create Contract)**:
```json
POST /api/contracts
{
  "blueprintId": "507f1f77bcf86cd799439011",
  "data": {
    "Employee Name": "John Doe",
    "Start Date": "2024-01-15"
  }
}
```

**Example Request (Update Status)**:
```json
PATCH /api/contracts/507f1f77bcf86cd799439012/status
{
  "status": "Approved"
}
```

**Contract Lifecycle Flow:**
```
Created → Approved → Sent → Signed → Locked
   ↓         ↓         ↓
Revoked   Revoked   Revoked
```

**Valid Transitions:**
- `Created` → `Approved` or `Revoked`
- `Approved` → `Sent`
- `Sent` → `Signed` or `Revoked`
- `Signed` → `Locked`
- `Locked` → **No transitions allowed (final immutable state)**
- `Revoked` → **No transitions allowed (immutable state)**

### Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error, invalid transition)
- `404` - Not Found
- `500` - Internal Server Error

## 🗄 Database Schema

### Blueprint Schema
```javascript
{
  name: String (required, trimmed),
  fields: [{
    label: String (required),
    fieldType: String (enum: 'text', 'date', 'signature', 'checkbox'),
    position: {
      x: Number (default: 0),
      y: Number (default: 0)
    }
  }],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Contract Schema
```javascript
{
  blueprintId: ObjectId (required, ref: 'Blueprint'),
  status: String (enum: 'Created', 'Approved', 'Sent', 'Signed', 'Locked', 'Revoked', default: 'Created'),
  data: Map (key-value pairs for field values),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Contract Lifecycle States:**
- `Created` → Initial state when contract is created
- `Approved` → Contract has been approved for sending
- `Sent` → Contract has been sent to signatory
- `Signed` → Contract has been signed (can transition to Locked)
- `Locked` → **Final immutable state** - contract is locked and cannot be modified
- `Revoked` → Contract has been revoked (immutable state)

### Relationships
- **Contract → Blueprint**: One-to-Many (many contracts can use one blueprint)
- Contracts reference blueprints via `blueprintId` (ObjectId)

### Indexes
- Blueprint: `_id` (automatic)
- Contract: `_id`, `blueprintId` (automatic), `status` (could be indexed for filtering)

## 🤔 Assumptions and Trade-offs

### Assumptions

1. **Authentication**: Mock authentication is used (all requests have `req.user` attached). In production, implement JWT or session-based auth.

2. **Field Position**: Position (x/y) is stored but not actively used in the current UI. Assumed for future drag-and-drop functionality.

3. **Contract Naming**: Contracts are auto-named as `Contract-{last6chars}`. Could be enhanced to allow custom names.

4. **Data Storage**: Contract field values stored as Map (key-value pairs). Assumes field labels are unique within a blueprint.

5. **Single User**: No multi-tenancy or user isolation. All blueprints/contracts are shared.

### Trade-offs

1. **MongoDB vs SQL**: 
   - **Chose MongoDB**: Flexible schema for dynamic contract fields, easier to extend
   - **Trade-off**: No referential integrity constraints, need manual validation

2. **Plain CSS vs Tailwind/CSS-in-JS**:
   - **Chose Plain CSS**: No external dependencies, better performance, full control
   - **Trade-off**: More verbose, need to write more CSS

3. **No State Management Library**:
   - **Chose React Hooks**: Simpler for this scope, no extra dependencies
   - **Trade-off**: Could get complex with more features, might need Redux/Zustand later

4. **Backend Validation Only**:
   - **Chose**: Enforce rules on backend (single source of truth)
   - **Trade-off**: Frontend validation could improve UX but backend is authoritative

5. **No Pagination**:
   - **Current**: Fetch all contracts/blueprints
   - **Trade-off**: Works for small datasets, would need pagination for production scale

## 📁 Project Structure

```
Contract Management Platform/
├── README.md                 # This file
├── instructions.md          # Assignment requirements
├── .gitignore               # Git ignore rules
│
├── backend/
│   ├── index.js            # Express server entry point
│   ├── package.json        # Backend dependencies
│   ├── .env.example        # Environment variables template
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── controllers/
│   │   ├── blueprintController.js
│   │   └── contractController.js
│   ├── models/
│   │   ├── Blueprint.js    # Blueprint schema
│   │   └── Contract.js     # Contract schema
│   ├── routes/
│   │   ├── blueprints.js   # Blueprint routes
│   │   └── contracts.js   # Contract routes
│   └── test_lifecycle.js   # Lifecycle test script
│
└── frontend/
    ├── package.json        # Frontend dependencies
    ├── vite.config.js      # Vite configuration
    ├── index.html          # HTML entry point
    ├── src/
    │   ├── main.jsx        # React entry point
    │   ├── App.jsx         # Main app component with routing
    │   ├── index.css       # Global styles
    │   ├── components/
    │   │   ├── Layout.jsx          # App shell
    │   │   ├── Dashboard.jsx       # Contract listing
    │   │   ├── Blueprints.jsx      # Blueprint management
    │   │   ├── CreateContract.jsx  # Contract creation
    │   │   ├── StatusBadge.jsx     # Status display
    │   │   ├── LifecycleStepper.jsx # Progress indicator
    │   │   └── SkeletonLoader.jsx  # Loading states
    │   └── services/
    │       └── api.js      # API client (Axios)
```

## 🧪 Testing

### Manual Testing
1. **Test Lifecycle Script**: Run the provided test script
   ```bash
   cd backend
   node test_lifecycle.js
   ```

   This tests:
   - Blueprint creation
   - Contract creation
   - Invalid status transition (should fail)
   - Valid status transition (should succeed)

### API Testing
Use tools like Postman, Insomnia, or curl to test endpoints:

```bash
# Create Blueprint
curl -X POST http://localhost:5000/api/blueprints \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","fields":[]}'

# Create Contract
curl -X POST http://localhost:5000/api/contracts \
  -H "Content-Type: application/json" \
  -d '{"blueprintId":"<id>","data":{}}'

# Update Status
curl -X PATCH http://localhost:5000/api/contracts/<id>/status \
  -H "Content-Type: application/json" \
  -d '{"status":"Approved"}'
```

## 🚧 Future Enhancements

- [ ] API Documentation (Swagger/OpenAPI)
- [ ] Unit and Integration Tests
- [ ] Docker Setup
- [ ] Role-based Access Control
- [ ] Contract versioning
- [ ] Email notifications for status changes
- [ ] PDF export for contracts
- [ ] Advanced filtering and search
- [ ] Pagination for large datasets
- [ ] Real-time updates (WebSockets)

## 📝 License

ISC

## 👤 Author

Prathmesh More
