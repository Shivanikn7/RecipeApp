# RecipeApp

## Project Overview
RecipeApp is a full-stack web application designed to help users manage their personal recipe collection and create meal plans. The application allows users to perform CRUD operations on recipes, link recipes to specific dates and meal times, and authenticate securely.

## Features
- **User Authentication**: Secure registration and login using JSON Web Tokens (JWT).
- **Recipe Management**: Create, read, update, and delete personal recipes.
- **Meal Planning**: Create and manage meal plans by linking recipes to specific dates and meal times.

## Technology Stack
- **Backend**:
  - Node.js
  - Express.js
  - MongoDB (with Mongoose)
  - JWT for authentication
  - bcryptjs for password hashing
  - dotenv for environment variables
  - cors for cross-origin requests
  - express-async-handler for error handling


  **Frontend:** React.js (Components, Hooks, React 

## Project Structure
```
RecipeApp
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── utils
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
└── frontend
    ├──React.js

## Getting Started

### Prerequisites
- Node.js (v22.x.x)
- MongoDB

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the backend directory and add your MongoDB URI, JWT secret, and port number:
   ```
   MONGO_URI=<your_mongodb_uri>
   JWT_SECRET=<your_jwt_secret>
   PORT=5000
   ```
5. Start the server:
   ```
   npm run dev
   ```

### API Documentation
Refer to the individual route files in the `backend/routes` directory for detailed API endpoints and their usage.

## Future Enhancements
- Implement a dedicated frontend framework (e.g., React, Vue, Angular) for a more dynamic user experience.
- Add user roles and permissions for enhanced security and functionality.

## License
This project is licensed under the MIT License.
