# Expense Tracker Application

A simple full-stack expense tracker built with React, Node, Express, and MongoDB.

## Features

- User registration and login with JWT authentication
- Add, update, delete, and list transactions
- 5+ categories for income and expenses
- Balance, income, and expense summary cards
- Responsive layout for personal financial tracking

## Tech Stack

- React.js
- Node.js
- Express.js
- MongoDB
- JWT
- REST APIs

## Getting Started

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Start MongoDB

Make sure your MongoDB instance is running locally on:

```bash
mongodb://127.0.0.1:27017/expense-tracker
```

### 3. Start the app

From the project root:

```bash
npm run dev
```

This starts:

- Backend API on http://localhost:5000
- Frontend app on http://localhost:5173

## Demo login

Create a new account in the app, or use the registration form.

## API Endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/transactions
- POST /api/transactions
- GET /api/transactions/:id
- PUT /api/transactions/:id
- DELETE /api/transactions/:id
- GET /api/transactions/summary
- GET /api/transactions/categories
