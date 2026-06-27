# MERN Task Tracker

A full-stack task management application built with MongoDB, Express, React, and Node.js.

## Features

- Create, view, update, and delete tasks
- Set task status (Pending / In Progress / Completed)
- Set task priority (Low / Medium / High)
- Form validation on the frontend and backend
- Dynamic updates without page refresh
- Responsive design

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 18, Vite, Axios   |
| Backend  | Node.js, Express 4      |
| Database | MongoDB Atlas, Mongoose |

## Project Structure

```
mern-task-tracker/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── TaskForm.jsx # Create / edit form with validation
│   │   │   ├── TaskItem.jsx # Single task card
│   │   │   └── TaskList.jsx # Renders the list of tasks
│   │   ├── pages/
│   │   │   └── Home.jsx     # Main page — manages state & API calls
│   │   ├── services/
│   │   │   └── api.js       # Axios instance + API helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── server/                  # Express backend
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── controllers/
│   │   └── taskController.js # Route handler functions
│   ├── models/
│   │   └── Task.js          # Mongoose schema & model
│   ├── routes/
│   │   └── taskRoutes.js    # Express router
│   └── server.js            # App entry point
│
├── .env.example             # Environment variable template
├── .gitignore
├── package.json             # Root dependencies & scripts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/mern-task-tracker.git
cd mern-task-tracker
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/tasktracker
PORT=5000
```

### 3. Install dependencies

```bash
# Install server + root dependencies
npm install

# Install client dependencies
npm --prefix client install
```

### 4. Run in development

```bash
npm run dev
```

This starts both the Express server (port 5000) and the Vite dev server (port 5173) concurrently.

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for production

```bash
npm run build       # builds the React app into client/dist
npm start           # serves the API (serve client/dist separately or add static serving)
```

## REST API Reference

| Method | Endpoint          | Description       |
|--------|-------------------|-------------------|
| GET    | /api/tasks        | Get all tasks     |
| POST   | /api/tasks        | Create a task     |
| GET    | /api/tasks/:id    | Get a single task |
| PUT    | /api/tasks/:id    | Update a task     |
| DELETE | /api/tasks/:id    | Delete a task     |

### Task Schema

```json
{
  "_id":        "ObjectId",
  "title":      "string (required, max 200 chars)",
  "description":"string",
  "status":     "pending | in-progress | completed",
  "priority":   "low | medium | high",
  "createdAt":  "Date",
  "updatedAt":  "Date"
}
```
