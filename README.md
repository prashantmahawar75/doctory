# Doctory - Doctor Schedule and Patient Appointment Application

Doctory is a comprehensive web application for managing doctor schedules and patient appointments. It features separate interfaces for doctors and patients, secure authentication, and a robust backend API.

## Features

- **User Authentication**: Secure login and registration for both doctors and patients using Firebase Authentication
- **Doctor Dashboard**: Manage schedule, view upcoming appointments, and track patient history
- **Patient Dashboard**: Book appointments, view appointment history, and manage favorite doctors
- **Schedule Management**: Doctors can set regular hours, block time off, and manage availability
- **Appointment Booking**: Patients can search for doctors by specialty, view available time slots, and book appointments
- **Real-time Updates**: Get notifications for appointment confirmations, cancellations, and reminders

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Firebase Authentication

### Backend
- TypeScript
- Express.js
- Firebase Admin SDK

### Database
- Supabase (PostgreSQL)

## Project Structure

```
doctory/
├── frontend/             # Frontend code
│   ├── assets/           # Images, icons, etc.
│   ├── css/              # CSS stylesheets
│   ├── js/               # JavaScript files
│   ├── pages/            # HTML pages
│   └── index.html        # Main entry point
├── backend/              # Backend code
│   ├── src/              # TypeScript source files
│   │   ├── database/     # Database models and connection
│   │   ├── routes/       # API routes
│   │   └── index.ts      # Main entry point
│   ├── dist/             # Compiled JavaScript files
│   ├── package.json      # Dependencies and scripts
│   └── tsconfig.json     # TypeScript configuration
└── README.md             # Project documentation
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Supabase account

### Frontend Setup

1. Configure Firebase:
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password provider
   - Update the Firebase configuration in `frontend/js/firebase-config.js`

### Backend Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update with your Firebase and Supabase credentials

3. Set up Supabase:
   - Create a Supabase project at [https://app.supabase.io/](https://app.supabase.io/)
   - Run the SQL commands from `backend/src/database/schema.sql` in the Supabase SQL editor

4. Build and run the backend:
   ```bash
   npm run build
   npm start
   ```

## Running the Application

### Development Mode

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Open the frontend in a web browser:
   - Open `frontend/index.html` in your browser
   - Or use a local development server like Live Server in VS Code

## API Documentation

The backend provides the following API endpoints:

### Authentication
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/doctor-profile` - Create or update doctor profile
- `POST /api/auth/patient-profile` - Create or update patient profile

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/search` - Search doctors by name or specialty
- `GET /api/doctors/:id/schedule` - Get doctor's schedule
- `GET /api/doctors/:id/appointments` - Get doctor's appointments

### Patients
- `GET /api/patients/:id` - Get patient by ID
- `GET /api/patients/:id/appointments` - Get patient's appointments
- `POST /api/patients/:id/favorites` - Add doctor to favorites
- `DELETE /api/patients/:id/favorites/:doctorId` - Remove doctor from favorites
- `GET /api/patients/:id/favorites` - Get favorite doctors

### Appointments
- `POST /api/appointments` - Create a new appointment
- `GET /api/appointments/:id` - Get appointment by ID
- `PATCH /api/appointments/:id/status` - Update appointment status

### Schedules
- `POST /api/schedules` - Create or update doctor schedule
- `POST /api/schedules/regular` - Set regular schedule
- `GET /api/schedules/available` - Get available time slots
- `POST /api/schedules/block` - Block time off
- `DELETE /api/schedules` - Clear schedule

## License

This project is licensed under the ISC License.