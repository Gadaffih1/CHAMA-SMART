# ChamaSmart

Use Node.js 22. Install dependencies, run `npm run build`, then run `npm start`.
The production server listens on `0.0.0.0` using `PORT` (default 3000), serves
the built frontend, and provides the database API. Use `npm run dev` for Vite's
development middleware.

The SQLite database and SQL dumps are stored in `database/` and
`export_sql_dump/` under the working directory by default. In a container,
set `CHAMASMART_DATA_DIR` to a writable persistent volume and mount that volume
across deployments; otherwise SQLite data and exports can be lost when the
container is replaced. Run a single application instance against a local SQLite
volume.
