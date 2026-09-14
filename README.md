# Hospital Callyzer API

A multi-tenant hospital/patient management backend. Built with Express 5,
raw `pg` (no ORM — SQL is written by hand in the model layer), and Joi for
validation.

## Getting started

```bash
npm install
cp .env.example .env
# fill in PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD from Railway,
# and set a real JWT_SECRET
npm run dev
```

Tables are created automatically at startup via `src/config/database-init.js`
(uncomment the `initializeDatabase()` call in `src/server.js` the first time
you run against a fresh database — it's safe to re-run any time after that,
every statement uses `IF NOT EXISTS`/`ADD COLUMN IF NOT EXISTS`).

## Base URL

```text
http://localhost:3000/api
```

## Response shape

Every endpoint returns JSON in one of these shapes:

```json
{ "success": true, "data": { } }
{ "success": true, "message": "...", "data": { } }
{ "success": false, "message": "..." }
{ "success": false, "message": "validation failed", "errors": ["..."] }
```

---

## Authentication

Login issues a JWT. Every route under `/patients` requires this token in the
`Authorization: Bearer <token>` header. Users, hospitals, and roles are
currently unauthenticated (see "Known gaps" below).

| Method | Endpoint         | Description                    |
| ------ | ---------------- | ------------------------------ |
| POST   | `/auth/login`    | Log in, returns a JWT          |

**Login**

```json
POST /auth/login
{
  "username": "samreceptionist",
  "password": "SecurePass123"
}
```

Response:

```json
{
  "success": true,
  "message": "login successful",
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "1",
      "hospitalId": "1",
      "roleId": "1",
      "roleCode": "RECEPTIONIST",
      "username": "samreceptionist",
      "fullName": "Sam Receptionist",
      "email": "sam@citycare.com"
    }
  }
}
```

The token embeds `hospitalId` and `roleCode` — this is what makes
`authMiddleware` (attaches `req.user`) and `rbacMiddleware`'s `requireRole(...)`
possible without an extra DB lookup on every request.

---

## Hospitals

| Method | Endpoint                    | Description             |
| ------ | --------------------------- | ------------------------ |
| POST   | `/hospitals`                | Create hospital          |
| GET    | `/hospitals`                | Get all hospitals        |
| GET    | `/hospitals/{id}`           | Get hospital by ID       |
| PUT    | `/hospitals/{id}`           | Update hospital (partial)|
| PATCH  | `/hospitals/{id}/deactivate`| Soft-deactivate hospital |
| PATCH  | `/hospitals/{id}/activate`  | Reactivate hospital      |

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

---

## Users

| Method | Endpoint                        | Description                          |
| ------ | -------------------------------- | ------------------------------------- |
| POST   | `/users`                         | Create user (password required)      |
| GET    | `/users`                         | Get all users                        |
| GET    | `/users/{id}`                    | Get user by ID                       |
| PUT    | `/users/{id}`                    | Update fullName/email (partial)      |
| PATCH  | `/users/{id}/deactivate`         | Soft-deactivate user                 |
| PATCH  | `/users/{id}/activate`           | Reactivate user                      |
| PATCH  | `/users/{id}/reset-password`     | Admin resets someone else's password |
| PATCH  | `/users/{id}/change-password`    | User changes their own password      |

**Create User**

```json
{
  "hospitalId": 1,
  "roleId": 1,
  "userName": "john.doe",
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

`password_hash` is never returned by any endpoint — every SELECT in
`user.model.js` explicitly excludes it except the one internal query used by
the login flow.

**Reset another user's password** (no current password needed — meant for admins)

```json
PATCH /users/5/reset-password
{ "newPassword": "NewSecurePass456" }
```

**Change your own password** (must prove you know the current one)

```json
PATCH /users/5/change-password
{ "currentPassword": "SecurePass123", "newPassword": "NewSecurePass456" }
```

---

## Role Masters

| Method | Endpoint             | Description                       |
| ------ | -------------------- | ---------------------------------- |
| POST   | `/role-masters`       | Create role                       |
| GET    | `/role-masters`       | Get all roles                     |
| GET    | `/role-masters/{id}`  | Get role by ID                    |
| PUT    | `/role-masters/{id}`  | Update role (partial)             |

**Create Role**

```json
{
  "roleName": "Hospital Admin",
  "roleCode": "HOSPITAL_ADMIN",
  "parentRoleId": null
}
```

`parentRoleId` is optional/nullable — top-level roles (like Hospital Admin)
have no parent.

**No delete/deactivate endpoint exists for roles on purpose** — there's no
`is_active` column on `role_master`, and hard-deleting a role that users
still reference would break the foreign key. Decide on a soft-delete
strategy (add `is_active` to `role_master`, or a "reassign users before
delete" flow) before adding one.

---

## User Relationships

Defines a senior/junior reporting relationship between two users within a
hospital (e.g. a Manager supervising a Doctor).

| Method | Endpoint                                    | Description                          |
| ------ | -------------------------------------------- | ------------------------------------- |
| POST   | `/users-relationship`                        | Create a relationship                |
| GET    | `/users-relationship`                        | Get all relationships                |
| GET    | `/users-relationship/senior-id/{seniorId}`   | Get all relationships for a senior   |
| GET    | `/users-relationship/junior-id/{juniorId}`   | Get all relationships for a junior   |
| DELETE | `/users-relationship/{id}`                   | Delete a relationship                |

**Create User Relationship**

```json
{
  "hospitalId": 1,
  "seniorUserId": 2,
  "juniorUserId": 3
}
```

(Field names are `seniorUserId`/`juniorUserId` — matching the actual
`senior_user_id`/`junior_user_id` columns. An earlier version of this module
used `seniorId`/`juniorId`, which didn't match the database and meant the
create endpoint could never actually work.)

---

## Patients

**Every endpoint below requires `Authorization: Bearer <token>`.**
`hospitalId` is taken from the token, never from the request — a logged-in
user can only ever see or modify their own hospital's patients.

| Method | Endpoint                     | Description                              |
| ------ | ----------------------------- | ----------------------------------------- |
| POST   | `/patients`                   | Register a new patient                   |
| GET    | `/patients`                   | List patients (paginated)                |
| GET    | `/patients/search`            | Search by `name`, `mobile`, or `mrn`     |
| GET    | `/patients/check-duplicate`   | Check for likely duplicates before saving |
| GET    | `/patients/{id}`              | Get one patient                          |
| PUT    | `/patients/{id}`              | Update patient (partial)                 |
| PATCH  | `/patients/{id}/deactivate`   | Soft-deactivate patient                  |
| PATCH  | `/patients/{id}/activate`     | Reactivate patient                       |

**Register a patient**

```json
POST /patients
{
  "firstName": "Rahul",
  "lastName": "Sharma",
  "mobile": "9876543210",
  "dateOfBirth": "1990-05-15",
  "gender": "Male",
  "bloodGroup": "O+"
}
```

The MRN (Medical Record Number) is generated automatically as
`SOZO{hospitalId zero-padded to 3 digits}-{6-digit sequence}`, e.g.
`SOZO001-000022`. It's built from the hospital's numeric `id`, not its
editable `hospital_code` text field — the id never changes once a hospital
row exists, so the MRN stays permanently correct even if someone edits the
hospital's code later. Generation is atomic (`INSERT ... ON CONFLICT DO
UPDATE ... RETURNING` against a per-hospital sequence table) — verified
under 20 simultaneous concurrent requests with zero duplicate or skipped
numbers, and safe at any future scale since each hospital's counter is
independent of every other hospital's.

**Duplicate detection**

If a patient with the same `mobile` + `dateOfBirth` already exists in the
same hospital, the create request is rejected with `409 Conflict` and the
matching record(s) returned, instead of silently creating a duplicate:

```json
{
  "success": false,
  "message": "a patient with the same mobile number and date of birth already exists",
  "data": { "possibleDuplicates": [ /* existing patient records */ ] }
}
```

To proceed anyway (e.g. two family members genuinely share a phone and
happen to share a birth date), resend the same request with
`"confirmDuplicate": true` in the body.

**Search**

```text
GET /patients/search?name=rahul
GET /patients/search?mobile=9876543210
GET /patients/search?mrn=HOSP001-000021
```

---

## Known gaps / decisions still needed

- `hospitals`, `users`, and `role-masters` routes are currently
  **unauthenticated**. Only `patients` has `authMiddleware` applied. Decide
  whether hospital/role management should be locked down to
  `HOSPITAL_ADMIN` only using `rbacMiddleware`'s `requireRole(...)`.
- `role_master` has no delete/deactivate endpoint — needs a schema decision
  first (see above).
- No audit logging exists yet (who accessed/changed which patient record,
  and when) — expected for a healthcare system, not yet built.
- Appointments, clinical encounters, and billing modules are not built yet.
