# BuildTrack — Dynamic MongoDB Client/Admin Upgrade

This version converts the Client/Admin settings, project-client assignment, payment records, and gallery into MongoDB-backed CRUD workflows.

## Features
- Client profile GET/PUT and password change: `GET/PUT /api/users/me`
- Admin client list: `GET /api/users/clients`
- Admin project assignment via `clientId`: create/update `/api/projects`
- Payment CRUD: `GET/POST /api/payments`, `PUT/DELETE /api/payments/:id`
- Admin Payment Records page: `/admin/payments`
- Gallery CRUD: `GET/POST /api/gallery`, `PUT/DELETE /api/gallery/:id`
- Admin Gallery upload page: `/admin/gallery`
- Gallery image files can be selected in the browser and stored as a data URL in MongoDB (10 MB UI limit).
- Client payment ledger now reads real Payment documents instead of generating invoice rows from milestones.

## Run
### Backend
1. Keep your existing `backend/.env` with MongoDB connection and JWT settings.
2. `cd backend`
3. `npm install`
4. `npm run dev` (or `npm start`)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Important
For a project to appear for a client, assign a client from **Admin → Projects → Edit/Create → Assign Client**. The assignment writes the client's MongoDB `_id` to `Project.clientId`.
