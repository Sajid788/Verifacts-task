# VeriFacts Task

VeriFacts Task is a full-stack case management application built for a manager and agent workflow. Managers can create and assign cases, while agents can work on assigned cases, update case status, upload documents, and add comments. The project is split into a `client` frontend and a `server` API.

## Features

- Role-based authentication with `manager` and `agent` users
- Secure login and registration with JWT-based auth
- Case creation for managers
- Case assignment and reassignment to agents
- Workflow-based case status transitions:
  `New -> Assigned -> In Progress -> Submitted -> Cleared/Discrepant`
- Case listing with search and filtering
- Case detail view with comments, documents, and audit history
- Add comment flow with loading state on submit
- Document upload support for images, PDF, and DOC/DOCX files
- Cloudinary-based file storage for uploaded documents
- Protected frontend routes for public and authenticated pages

## Tech Stack

- Frontend: React, Vite, Redux Toolkit, React Router, Tailwind CSS, Radix UI
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT, bcryptjs
- File uploads: Multer, Cloudinary

## Project Structure

```text
VeriFacts-Task/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── lib/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   ├── vercel.json
│   └── index.js
│
├── README.md

```

## Main User Flows

### Manager

- Register or log in as a manager
- Create a new case
- Assign or reassign a case to an agent
- View all cases
- Filter cases by status or agent
- Review submitted work
- Mark a submitted case as `Cleared` or `Discrepant`

### Agent

- Register or log in as an agent
- View only assigned cases
- Move case status from `Assigned` to `In Progress` to `Submitted`
- Upload documents to open cases
- Add comments to a case timeline

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Users

- `GET /api/users/agents`

### Cases

- `GET /api/cases`
- `POST /api/cases`
- `GET /api/cases/:id`
- `PATCH /api/cases/:id/assign`
- `PATCH /api/cases/:id/status`
- `POST /api/cases/:id/comments`
- `POST /api/cases/:id/documents`

## Local Setup

### 1. Clone the project

```bash
git clone <your-repo-url>
cd VeriFacts-Task
```

### 2. Install dependencies

```bash
cd server
npm install
cd ../client
npm install
```

### 3. Configure backend environment

Create a `.env` file inside `server/` with the values used by the API:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_FOLDER=verifacts-documents
```


### 5. Start the project

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

## Notes

- Auth state is stored in local storage on the frontend.
- Agents can only access cases assigned to them.
- Closed cases (`Cleared` and `Discrepant`) cannot receive new document uploads.
- The case detail page includes comments, uploaded documents, and status timeline history.
