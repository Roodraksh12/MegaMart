# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | ✅        |

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security issue, please report it by emailing the repository owner directly via GitHub. Include:

- A description of the vulnerability
- Steps to reproduce
- Potential impact

You will receive a response within 72 hours. If the issue is confirmed, a patch will be prioritised and released as soon as possible.

## Security Best Practices for Self-Hosting

- **Never commit `.env` files** to version control
- **Never commit `serviceAccountKey.json`** or any Firebase admin credentials
- Use a **strong, unique `JWT_SECRET`** (minimum 32 characters)
- Use a **strong `ADMIN_PASSWORD`** — change the default immediately
- Set the `FRONTEND_URL` environment variable correctly to restrict CORS
- Rotate your Supabase service role key if you believe it has been compromised
