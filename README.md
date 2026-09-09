# Hospital Callyzer API

## Base URL

```text
http:localhost:3000/api
```

## Endpoints

### Hospitals

| Method | Endpoint          | Description        |
| ------ | ----------------- | ------------------ |
| POST   | `/hospitals`      | Create hospital    |
| GET    | `/hospitals`      | Get all hospitals  |
| GET    | `/hospitals/{id}` | Get hospital by ID |

**Create Hospital**

```json
{
  "hospitalName": "Apollo Hospital",
  "hospitalCode": "APH001",
  "address": "123 Main Road",
  "city": "Noida",
  "state": "Uttar Pradesh"
}
```

**Model**

```text
Hospital {
  id,
  hospitalName,
  hospitalCode,
  address,
  city,
  state,
  createdAt,
  updatedAt
}
```

---

### Users

| Method | Endpoint      | Description    |
| ------ | ------------- | -------------- |
| POST   | `/users`      | Create user    |
| GET    | `/users`      | Get all users  |
| GET    | `/users/{id}` | Get user by ID |

**Create User**

```json
{
  "hospitalId": "HOSP001",
  "roleId": "ROLE001",
  "userName": "john.doe",
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

**Model**

```text
User {
  id,
  hospitalId,
  roleId,
  userName,
  fullName,
  email,
  createdAt,
  updatedAt
}
```

---

### Role Masters

| Method | Endpoint            | Description    |
| ------ | ------------------- | -------------- |
| POST   | `/rolemasters`      | Create role    |
| GET    | `/rolemasters`      | Get all roles  |
| GET    | `/rolemasters/{id}` | Get role by ID |

**Create Role**

```json
{
  "roleName": "Hospital Admin",
  "roleCode": "HOSP_ADMIN",
  "parentRoleId": "ROLE001"
}
```

**Model**

```text
RoleMaster {
  id,
  roleName,
  roleCode,
  parentRoleId,
  createdAt,
  updatedAt
}
```

### User Relationships

User relationships define the relationship between a **Senior User** and a **Junior User** within a hospital.

#### Endpoints

| Method | Endpoint                                   | Description                                                |
| ------ | ------------------------------------------ | ---------------------------------------------------------- |
| POST   | `/users-relationship`                      | Create/Get user relationships with relationship validation |
| GET    | `/users-relationship`                      | Get all user relationships                                 |
| GET    | `/users-relationship/senior-id/{seniorId}` | Get user relationship by Senior User ID                    |
| GET    | `/users-relationship/junior-id/{juniorId}` | Get user relationship by Junior User ID                    |

> **Note:** The `POST` endpoint uses `validateUserRelationship` middleware before calling the user relationship controller.

**Create User Relationship**

```json
{
  "hospitalId": "HOSP001",
  "seniorId": "USER001",
  "juniorId": "USER002"
}
```

**Model**

```text
UserRelationship {
  id,
  hospitalId,
  seniorId,
  juniorId,
  createdAt,
  updatedAt
}
```

#### Relationship Structure

```text
Hospital 1 ─── N UserRelationship
User (Senior) 1 ─── N UserRelationship
User (Junior) 1 ─── N UserRelationship
```

#### Example

```text
Hospital
   │
   ├── Senior User
   │      │
   │      └── UserRelationship
   │              │
   │              └── Junior User
   │
   └── Junior User
```

**Get Relationship by Senior User ID**

```text
GET /users-relationship/senior-id/{seniorId}
```

Example:

```text
GET /users-relationship/senior-id/USER001
```

**Get Relationship by Junior User ID**

```text
GET /users-relationship/junior-id/{juniorId}
```

Example:

```text
GET /users-relationship/junior-id/USER002
```

**Get All User Relationships**

```text
GET /users-relationship
```

Returns all records from the `user_relationship` table.


### Relationships

```text
Hospital 1 ─── N User
RoleMaster 1 ─ N User
RoleMaster 1 ─ N RoleMaster (parent/child)
```
