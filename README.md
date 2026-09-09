# Hospital Callyzer API

## Base URL

text
/api

---

# 1. Hospital APIs

## 1.1 Create Hospital

### Endpoint

http
POST /api/hospitals

### Description

Creates a new hospital.

### Request Body

{
"hospitalName": "Apollo Hospital",
"hospitalCode": "APH001",
"address": "123 Main Road",
"city": "Noida",
"state": "Uttar Pradesh"
}

### Validation Rules

| Field          | Type          | Required | Max Length | Description          |
| -------------- | ------------- | -------: | ---------: | -------------------- |
| `hospitalName` | String        |      Yes |        200 | Hospital name        |
| `hospitalCode` | String        |      Yes |         50 | Unique hospital code |
| `address`      | String / Null |       No |          — | Hospital address     |
| `city`         | String / Null |       No |        100 | City                 |
| `state`        | String / Null |       No |        100 | State                |

### Response — `201 Created`

{
"success": true,
"message": "Hospital created successfully",
"data": {
"id": "HOSP001",
"hospitalName": "Apollo Hospital",
"hospitalCode": "APH001",
"address": "123 Main Road",
"city": "Noida",
"state": "Uttar Pradesh",
"createdAt": "2026-09-09T10:00:00.000Z",
"updatedAt": "2026-09-09T10:00:00.000Z"
}
}

---

## 1.2 Get Hospitals

### Endpoint

http
GET /api/hospitals

### Description

Returns a list of hospitals.

### Response — `200 OK`

{
"success": true,
"message": "Hospitals fetched successfully",
"data": [
{
"id": "HOSP001",
"hospitalName": "Apollo Hospital",
"hospitalCode": "APH001",
"address": "123 Main Road",
"city": "Noida",
"state": "Uttar Pradesh",
"createdAt": "2026-09-09T10:00:00.000Z",
"updatedAt": "2026-09-09T10:00:00.000Z"
}
]
}

---

## 1.3 Get Hospital By ID

### Endpoint

http
GET /api/hospitals/{id}

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------: | ----------- |
| `id`      | String |      Yes | Hospital ID |

### Example

http
GET /api/hospitals/HOSP001

### Response — `200 OK`

{
"success": true,
"message": "Hospital fetched successfully",
"data": {
"id": "HOSP001",
"hospitalName": "Apollo Hospital",
"hospitalCode": "APH001",
"address": "123 Main Road",
"city": "Noida",
"state": "Uttar Pradesh",
"createdAt": "2026-09-09T10:00:00.000Z",
"updatedAt": "2026-09-09T10:00:00.000Z"
}
}

---

# 2. User APIs

## 2.1 Create User

### Endpoint

http
POST /api/users

### Description

Creates a user associated with a hospital and role.

### Request Body

{
"hospitalId": "HOSP001",
"roleId": "ROLE001",
"userName": "john.doe",
"fullName": "John Doe",
"email": "john.doe@example.com"
}

### Validation Rules

| Field        | Type   | Required | Max Length | Description             |
| ------------ | ------ | -------: | ---------: | ----------------------- |
| `hospitalId` | String |      Yes |          — | ID of the hospital      |
| `roleId`     | String |      Yes |          — | ID of the assigned role |
| `userName`   | String |      Yes |         50 | Login/user name         |
| `fullName`   | String |      Yes |        100 | User's full name        |
| `email`      | String |      Yes |        100 | User email              |

### Response — `201 Created`

{
"success": true,
"message": "User created successfully",
"data": {
"id": "USER001",
"hospitalId": "HOSP001",
"roleId": "ROLE001",
"userName": "john.doe",
"fullName": "John Doe",
"email": "john.doe@example.com",
"createdAt": "2026-09-09T10:00:00.000Z",
"updatedAt": "2026-09-09T10:00:00.000Z"
}
}

---

## 2.2 Get Users

### Endpoint

http
GET /api/users

### Description

Returns all users.

### Response — `200 OK`

{
"success": true,
"message": "Users fetched successfully",
"data": [
{
"id": "USER001",
"hospitalId": "HOSP001",
"roleId": "ROLE001",
"userName": "john.doe",
"fullName": "John Doe",
"email": "john.doe@example.com",
"createdAt": "2026-09-09T10:00:00.000Z",
"updatedAt": "2026-09-09T10:00:00.000Z"
}
]
}

---

## 2.3 Get User By ID

### Endpoint

http
GET /api/users/{id}

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------: | ----------- |
| `id`      | String |      Yes | User ID     |

### Example

http
GET /api/users/USER001

### Response — `200 OK`

{
"success": true,
"message": "User fetched successfully",
"data": {
"id": "USER001",
"hospitalId": "HOSP001",
"roleId": "ROLE001",
"userName": "john.doe",
"fullName": "John Doe",
"email": "john.doe@example.com",
"createdAt": "2026-09-09T10:00:00.000Z",
"updatedAt": "2026-09-09T10:00:00.000Z"
}
}

---

# 3. Role Master APIs

## 3.1 Create Role

### Endpoint

http
POST /api/rolemasters

### Description

Creates a new role in the role master.

### Request Body

{
"roleName": "Hospital Administrator",
"roleCode": "HOSP_ADMIN",
"parentRoleId": "ROLE001"
}

### Validation Rules

| Field          | Type   | Required | Max Length | Description      |
| -------------- | ------ | -------: | ---------: | ---------------- |
| `roleName`     | String |      Yes |         50 | Role name        |
| `roleCode`     | String |      Yes |         20 | Unique role code |
| `parentRoleId` | String |      Yes |         10 | Parent role ID   |

### Response — `201 Created`

{
"success": true,
"message": "Role created successfully",
"data": {
"id": "ROLE002",
"roleName": "Hospital Administrator",
"roleCode": "HOSP_ADMIN",
"parentRoleId": "ROLE001",
"createdAt": "2026-09-09T10:00:00.000Z",
"updatedAt": "2026-09-09T10:00:00.000Z"
}
}

---

## 3.2 Get Roles

### Endpoint

http
GET /api/rolemasters

### Description

Returns all roles.

### Response — `200 OK`

{
"success": true,
"message": "Roles fetched successfully",
"data": [
{
"id": "ROLE001",
"roleName": "Super Admin",
"roleCode": "SUPER_ADMIN",
"parentRoleId": "ROLE000",
"createdAt": "2026-09-09T10:00:00.000Z",
"updatedAt": "2026-09-09T10:00:00.000Z"
},
{
"id": "ROLE002",
"roleName": "Hospital Administrator",
"roleCode": "HOSP_ADMIN",
"parentRoleId": "ROLE001",
"createdAt": "2026-09-09T10:00:00.000Z",
"updatedAt": "2026-09-09T10:00:00.000Z"
}
]
}

---

## 3.3 Get Role By ID

### Endpoint

http
GET /api/rolemasters/{id}

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------: | ----------- |
| `id`      | String |      Yes | Role ID     |

### Example

http
GET /api/rolemasters/ROLE001

### Response — `200 OK`

{
"success": true,
"message": "Role fetched successfully",
"data": {
"id": "ROLE001",
"roleName": "Super Admin",
"roleCode": "SUPER_ADMIN",
"parentRoleId": "ROLE000",
"createdAt": "2026-09-09T10:00:00.000Z",
"updatedAt": "2026-09-09T10:00:00.000Z"
}
}

---

# 4. Data Models

## Hospital Model

text
Hospital
├── id
├── hospitalName
├── hospitalCode
├── address
├── city
├── state
├── createdAt
└── updatedAt

### Model Definition

{
"id": "String",
"hospitalName": "String",
"hospitalCode": "String",
"address": "String | null",
"city": "String | null",
"state": "String | null",
"createdAt": "DateTime",
"updatedAt": "DateTime"
}

---

## User Model

text
User
├── id
├── hospitalId
├── roleId
├── userName
├── fullName
├── email
├── createdAt
└── updatedAt

### Model Definition

{
"id": "String",
"hospitalId": "String",
"roleId": "String",
"userName": "String",
"fullName": "String",
"email": "String",
"createdAt": "DateTime",
"updatedAt": "DateTime"
}

### Relationships

text
Hospital 1 ──────────── N User
Role 1 ──────────── N User

- `User.hospitalId` → `Hospital.id`
- `User.roleId` → `RoleMaster.id`

---

## RoleMaster Model

text
RoleMaster
├── id
├── roleName
├── roleCode
├── parentRoleId
├── createdAt
└── updatedAt

### Model Definition

{
"id": "String",
"roleName": "String",
"roleCode": "String",
"parentRoleId": "String",
"createdAt": "DateTime",
"updatedAt": "DateTime"
}

### Relationships

text
RoleMaster
│
├── parentRoleId ──> RoleMaster.id
│
└── id ────────────> User.roleId

This allows hierarchical roles, for example:

text
Super Admin
│
├── Hospital Admin
│ │
│ ├── Doctor
│ └── Nurse
│
└── Support Admin

---

# 5. API Summary

| Method | Endpoint                | Description        |
| ------ | ----------------------- | ------------------ |
| `POST` | `/api/hospitals`        | Create hospital    |
| `GET`  | `/api/hospitals`        | Get all hospitals  |
| `GET`  | `/api/hospitals/{id}`   | Get hospital by ID |
| `POST` | `/api/users`            | Create user        |
| `GET`  | `/api/users`            | Get all users      |
| `GET`  | `/api/users/{id}`       | Get user by ID     |
| `POST` | `/api/rolemasters`      | Create role        |
| `GET`  | `/api/rolemasters`      | Get all roles      |
| `GET`  | `/api/rolemasters/{id}` | Get role by ID     |

---

# 6. Common Error Responses

## Validation Error — `400 Bad Request`

{
"success": false,
"message": "Validation failed",
"errors": [
{
"field": "hospitalName",
"message": "\"hospitalName\" is required"
}
]
}

## Resource Not Found — `404 Not Found`

{
"success": false,
"message": "Hospital not found"
}

## Duplicate Resource — `409 Conflict`

{
"success": false,
"message": "Hospital code already exists"
}

## Internal Server Error — `500 Internal Server Error`

{
"success": false,
"message": "Internal server error"
}

> **Note:** The `email` validation above uses `.email()` because the field represents an email address. Your original schema only applied `string().trim().max(100).required()`, so add `.email()` if actual email-format validation is required.
