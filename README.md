# Academic Wellness Risk Dashboard

A complete end-to-end MERN stack application to monitor student academic performance and wellness metrics, providing risk assessment for faculty and insights for students.

## Features

### Faculty
- **Registration & Login**: Secure JWT-based authentication.
- **Student Management**: Create, view, edit, and delete student profiles.
- **Departmental Filter**: Automatically scoped to the faculty's department (can be extended).
- **Risk Assessment**: Visual indicators for High, Medium, and Low risk students.

### Students
- **Dashboard**: View attendance, marks, and stress levels.
- **Wellness Insights**: Personalized feedback based on performance and stress.
- **Risk Status**: Transparent view of their academic standing.

## Tech Stack
- **Frontend**: React.js, React Router, Axios, TailwindCSS, Vite.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt.

## Setup Instructions

### 1. Prerequisites
- Node.js installed.
- MongoDB installed locally or a MongoDB Atlas URI.

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Create a `.env` file in the `backend` directory (one has been provided for you).
   - Ensure `MONGO_URI` is correct.
4. Start the backend:
   ```bash
   npm run dev
   ```
   *Backend runs on: http://localhost:5000*

### 3. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
   *Frontend runs on: http://localhost:3000 (standard Vite port is 5173, but can be configured)*

## Risk Logic
- **Attendance < 75%**: Medium Risk
- **Marks < 50%**: High Risk
- **Stress Level: High**: High Risk

## Folder Structure
```
academic-wellness-dashboard
│
├── backend
│   ├── config/          # DB connection
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── controllers/      # Route logic
│   ├── middleware/      # Auth & Error handling
│   └── server.js        # Entry point
│
└── frontend
    ├── src/
    │   ├── components/  # Shared components
    │   ├── pages/       # Route pages
    │   ├── services/    # API calls
    │   └── App.jsx      # Root component
    └── index.html       # Vite entry
```
