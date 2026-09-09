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

### Relationships

```text
Hospital 1 ─── N User
RoleMaster 1 ─ N User
RoleMaster 1 ─ N RoleMaster (parent/child)
```
