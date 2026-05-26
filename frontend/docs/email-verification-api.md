# Signup email verification API (backend contract)

Base URL: `REACT_APP_API_URL` (default `http://localhost:5000/api`)

## 1. Send verification email (after account step)

`POST /auth/verify-email/send`

```json
{ "email": "user@example.com", "portal": "professional" }
```

`portal` is `"professional"` or `"business"`.

Email link should point to:

- Professional: `{FRONTEND_ORIGIN}/professional/onboarding/verify-email/confirm?token={token}`
- Business: `{FRONTEND_ORIGIN}/verify-email/confirm?token={token}`

Token TTL: **15 minutes** (must match frontend `EMAIL_VERIFY_TTL_SECONDS`).

## 2. Resend verification email

`POST /auth/verify-email/resend`

```json
{ "email": "user@example.com", "portal": "business" }
```

Frontend only allows resend after the 15-minute countdown reaches zero.

## 3. Validate token (user clicks email link)

`GET /auth/verify-email/validate?token={token}&portal={portal}`

Response example:

```json
{ "valid": true, "email": "user@example.com" }
```

On success the frontend redirects to the next onboarding step (profile or company setup).
