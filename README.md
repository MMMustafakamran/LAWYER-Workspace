# Lawyer App - Project Setup Guide

This guide will help you set up and run the Lawyer App on your local machine.

## Prerequisites

Ensure you have the following installed:
1.  **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2.  **PostgreSQL** (Database) - [Download](https://www.postgresql.org/download/)
3.  **Git** - [Download](https://git-scm.com/)

## 1. Clone the Repository

```bash
git clone <repository-url>
cd project
```

## 2. Backend Setup

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    - Create a `.env` file in the `server` folder.
    - Add the following (adjust `DATABASE_URL` with your Postgres credentials):
    ```env
    DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/lawyer_app?schema=public"
    PORT=5000
    JWT_SECRET="your_super_secret_key"
    ```
4.  Setup Database:
    ```bash
    # Generate Prisma Client
    npx prisma generate

    # Push Schema to Database
    npx prisma db push
    ```
5.  Start the Server:
    ```bash
    npx nodemon index.js
    ```
    *The server should run on `http://localhost:5000`.*

## 3. Frontend Setup

1.  Open a new terminal and navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the React App:
    ```bash
    npm run dev
    ```
    *The app should run on `http://localhost:5173`.*

## 4. Running the App

-   Open your browser and go to `http://localhost:5173`.
-   **Register** a new account to get started.

## Troubleshooting

-   **Database Connection Error**: Double-check your `DATABASE_URL` in `server/.env`. Ensure your PostgreSQL service is running.
-   **Prisma Error**: Try running `npx prisma generate` again if you change the schema.
-   **Port In Use**: If port 5000 is busy, change `PORT` in `.env` and restart the server.
