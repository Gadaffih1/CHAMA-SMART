# ChamaSmart

Use Node.js 22. Install dependencies, run `npm run build`, then run `npm start`.
The production server listens on `0.0.0.0` using `PORT` (default 3000), serves
the built frontend, and provides the database API. Use `npm run dev` for Vite's
development middleware.

## Authentication

Authentication and authorization are enforced by the server. Set
`SUPER_ADMIN_PASSWORD` to the Super Admin operator password; if it is unset, a
random one is generated and printed at startup.

- `POST /api/auth/login` (member phone, email, or membership number plus
  password) and `POST /api/auth/super-admin/login` issue an 8-hour session in an
  HttpOnly, SameSite=Strict cookie. `POST /api/auth/logout` and
  `GET /api/auth/me` end and inspect it.
- Passwords (minimum 8 characters) are hashed server-side with salted PBKDF2
  and stored in `user_credentials`; hashes are never returned by the API.
  Repeated failed logins are locked out for 15 minutes.
- The Super Admin has full rights over accounts, Chamas, categories,
  applications, and database dumps. Secretaries and Chama Admins can onboard
  members and set or reset passwords within their own Chama (only the Super
  Admin or the Chama Admin can reset a Chama Admin or assign officer roles).
  Other members only see and update their own Chama.
- Public endpoints: `GET /api/health`, `GET /api/db/categories`, and
  `POST /api/db/applications` (always stored as pending).
- Existing accounts without a password must have one set by the Super Admin,
  Secretary, or Chama Admin before those users can log in.
- Serve the app over HTTPS in production so the session cookie is marked
  `Secure` (behind a proxy, forward `X-Forwarded-Proto`).

The app uses an embedded SQLite database and does not require a MySQL or
PostgreSQL sidecar. Configure deployment health checks to probe
`GET /api/health`; it returns `200` when the database is queryable and `503`
when it is not.

The SQLite database and SQL dumps are stored in `database/` and
`export_sql_dump/` under the working directory by default. In a container,
set `CHAMASMART_DATA_DIR` to a writable persistent volume and mount that volume
across deployments; otherwise SQLite data and exports can be lost when the
container is replaced. Run a single application instance against a local SQLite
volume.
