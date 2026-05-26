# Password reset API (backend contract)

The frontend expects these endpoints at `http://localhost:5000/api` (see `src/services/api.js`).

## 1. Request reset email

`POST /auth/forgot-password`

```json
{ "email": "user@example.com" }
```

- Send an email with a link: `{FRONTEND_ORIGIN}/reset-password?token={resetToken}`
- Token should expire in **15 minutes**

## 2. Resend reset email

`POST /auth/forgot-password/resend`

```json
{ "email": "user@example.com" }
```

- Same behaviour as step 1; frontend only enables this after the 15-minute countdown reaches zero

## 3. Validate token (email link)

`GET /auth/reset-password/validate?token={resetToken}`

- `200` if token is valid and not expired
- `4xx` with `{ "message": "..." }` if invalid/expired

## 4. Complete reset

`POST /auth/reset-password`

```json
{ "token": "...", "password": "newSecurePassword1" }
```

- `200` on success; invalidate token after use
