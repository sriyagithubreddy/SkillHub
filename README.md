# SkillHub — Production-Ready Full-Stack Student Platform

SkillHub is a full-stack learning and career platform for students. It combines a searchable course catalogue, saved-course/progress tracking, certificates, profile management, public portfolios, and an ATS-friendly resume builder.

This package is prepared for **real multi-user deployment**. It uses a real MongoDB database and server-side JWT authentication. It does **not** use localStorage as a fake authentication/database fallback.

## Included features

- Real registration and login with bcrypt password hashing
- JWT-protected API routes
- Rate-limited authentication and API requests
- MongoDB/Mongoose persistence
- Course search, filters, sorting and pagination
- Save courses and track progress/completion
- Certificate management
- Profile, skills and education management
- Public portfolio pages
- ATS-friendly resume builder with PDF export
- Admin dashboard and course/user statistics
- Broken-link verification job architecture
- PWA/offline support
- Production build where Express serves the React app and API from the same service
- Health endpoint for deployment monitoring

## Production architecture

```text
Students
   |
   v
SkillHub React + Vite
   |
   v
Express API (/api)
   |
   v
MongoDB Atlas
```

The included Render configuration deploys the React frontend and Express backend as **one web service**, so students use one URL.

## Requirements

- Node.js 20+
- A MongoDB Atlas database for production
- A deployment provider such as Render

## Deploy with Render (recommended)

### 1. Create a MongoDB Atlas database

Create a MongoDB Atlas cluster and a database user. Copy the application's MongoDB connection string. Replace the username/password placeholders in the connection string with the database user's credentials.

Use a database name such as `skillhub`.

For production, restrict MongoDB network access appropriately. Do not commit the connection string to GitHub.

### 2. Put this project in GitHub

Upload the **contents of this project folder** to a GitHub repository. Do not upload `.env` files or `node_modules`.

### 3. Create the Render service

The included `render.yaml` already defines:

- Node runtime
- `npm run build` as the build command
- `npm start` as the start command
- `/api/health` as the health check

Create a Render Web Service from the GitHub repository. If Render asks for the commands manually, use:

```text
Build Command: npm run build
Start Command: npm start
```

### 4. Add the production environment variables

Set these in Render:

```text
NODE_ENV=production
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<long random secret, at least 32 characters>
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=<your admin email>
ADMIN_PASSWORD=<strong unique admin password>
```

Do not copy the example values into production.

### 5. Deploy

The build performs:

```text
npm ci in server
npm ci in client
npm run build in client
```

The resulting React `client/dist` folder is served by the Express server in production.

Your final application URL will look like:

```text
https://your-service-name.onrender.com
```

### 6. Seed courses and create your admin account

After the first deployment, run the seed command from the deployment provider's shell if available:

```bash
npm run seed
```

The seed command:

- inserts the sample course catalogue
- creates the admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- never uses a hard-coded public admin password

If you run the seed command more than once, seeded courses are refreshed and the existing admin account is preserved.

## Local development

### Backend

```bash
cd server
cp .env.example .env
```

Edit `.env` with a MongoDB URI and a JWT secret, then:

```bash
npm install
npm run seed
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

### Frontend

In another terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The development frontend uses `VITE_API_URL=http://localhost:5000/api`.

## One-service production build locally

From the project root:

```bash
npm run build
```

Then configure production environment variables and run:

```bash
npm start
```

The server will serve both the React application and `/api`.

## Environment variables

### Server

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWTs; use a long random value |
| `JWT_EXPIRES_IN` | JWT lifetime, e.g. `7d` |
| `ADMIN_EMAIL` | Admin email used by the seed command |
| `ADMIN_PASSWORD` | Admin password used by the seed command |
| `PORT` | Server port; Render supplies this automatically |
| `NODE_ENV` | Use `production` for deployment |
| `CLIENT_URL` | Optional comma-separated frontend origins if frontend is hosted separately |

### Frontend

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API base URL. Production uses `/api` for the included one-service deployment |

Never put `MONGO_URI`, `JWT_SECRET`, admin passwords, or other private server secrets in the frontend environment.

## Authentication flow

```text
Register
   -> POST /api/auth/register
   -> password hashed with bcrypt
   -> user saved in MongoDB
   -> JWT returned
   -> dashboard

Login
   -> POST /api/auth/login
   -> bcrypt password verification
   -> JWT returned
   -> dashboard
```

The browser stores the JWT needed for authenticated API calls. The server still validates every protected request against the database.

## Important production notes

- Use HTTPS in production; Render provides HTTPS for the deployed service.
- Use a unique `JWT_SECRET` that is not reused elsewhere.
- Use a unique admin password and do not publish it in the repository.
- Do not commit `.env` files.
- MongoDB Atlas credentials belong only in deployment secrets.
- Course links are external links and can change; the admin dashboard can review flagged links.
- The sample course data is a starting catalogue. Replace or expand it with verified course links before presenting the catalogue as comprehensive.

## Main API routes

All API routes are under `/api`.

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/me` | User |
| GET | `/courses` | Public |
| GET | `/courses/:id` | Public |
| POST | `/courses` | Admin |
| PUT | `/courses/:id` | Admin |
| DELETE | `/courses/:id` | Admin |
| GET | `/saved-courses` | User |
| POST | `/saved-courses` | User |
| PUT | `/saved-courses/:id` | User |
| DELETE | `/saved-courses/:id` | User |
| GET | `/certificates` | User |
| POST | `/certificates` | User |
| PUT | `/certificates/:id` | User |
| DELETE | `/certificates/:id` | User |
| GET | `/profile` | User |
| PUT | `/profile` | User |
| GET | `/portfolio/:username` | Public |
| GET | `/resume` | User |
| PUT | `/resume` | User |
| GET | `/admin/stats` | Admin |
| GET | `/admin/users` | Admin |
| GET | `/admin/courses/broken` | Admin |
| GET | `/health` | Public |

## Before presenting SkillHub to real students

1. Deploy the application.
2. Register a new student account from a different browser/device.
3. Log out and log back in.
4. Save a course and mark it completed.
5. Add a certificate.
6. Update the profile.
7. Create a resume and export the PDF.
8. Test the public portfolio with a separate browser.
9. Log in as the admin and verify the dashboard.
10. Test the site on both desktop and mobile.

This package is the **deployment-ready application source**. The only external resources that must be supplied by the deployer are the MongoDB Atlas database and deployment-provider environment secrets; those cannot safely be embedded in a ZIP file.
