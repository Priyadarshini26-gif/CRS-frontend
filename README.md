# A Community Driven Infrastructure Reporting And Prioritization Platform - Frontend

A React-based web application that enables citizens to report, track, and prioritize local infrastructure issues through an interactive map interface.

## Features

### Citizen Features
- User Registration & Login
- JWT-based Authentication
- Report Infrastructure Issues
- Interactive Map Location Selection
- Image Upload Support
- View Reported Issues
- Vote on Community Issues
- Track Issue Resolution Status

### Authority Features
- Review Submitted Issues
- Approve or Reject Reports
- Monitor Issue Priorities
- View Area-Specific Complaints

### Government Official Features
- View Assigned Issues
- Update Issue Status
- Upload Resolution Proof Images
- Add Resolution Notes

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Leaflet.js
- JWT Authentication

## Installation

### Clone Repository

git clone <frontend-repository-url>

cd frontend

### Install Dependencies

npm install

### Configure Environment Variables

Create a `.env` file in the root directory.

VITE_API_URL=http://localhost:5000/api

### Run Development Server

npm run dev

Application runs on:

http://localhost:5173

## Build for Production

npm run build

## User Roles

### Citizen
- Report Issues
- Vote on Issues
- Track Resolution Status

### Local Authority
- Verify Complaints
- Approve/Reject Reports

### Government Official
- Manage Approved Issues
- Upload Resolution Proof

## Map Features

- Interactive Leaflet Map
- Draggable Markers
- Geo-location Based Reporting
- Nearby Issue Detection

## Security Features

- JWT Authentication
- Protected Routes
- Role-Based Access Control
- Secure API Communication

## Performance Optimizations

- Vite Code Splitting
- Lazy Loading
- Tailwind CSS Optimization
- Efficient State Management

## Deployment

Frontend Deployment:

https://crs-frontend-tan.vercel.app

## Future Enhancements

- Mobile Application
- Push Notifications
- Real-Time Updates
- AI-Based Issue Classification
- Advanced Analytics Dashboard
