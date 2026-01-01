# Project Architecture & Logic Guide

This guide explains how the Lawyer App is structured, how data flows from Backend to Frontend, and how the core logic works.

---

## 🏗️ 1. Backend Scaffolding (`server/`)
The backend is built with **Node.js** and **Express**. It acts as the API that the frontend talks to.

### **A. Entry Point ([index.js](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/server/index.js))**
This is the heart of the server.
1.  **Connects to MongoDB**: Establishes link to the database.
2.  **Applies Global Middleware**:
    *   `cors()`: Allows the frontend (running on port 5173) to talk to the backend (port 5000).
    *   `express.json()`: Allows the server to understand JSON data sent in POST requests.
3.  **Registers Routes**: Tells the server "If a request comes to `/api/users`, send it to `userRoutes`".

### **B. Routing Layer (`routes/*.js`)**
Routes act as traffic cops. They check the URL and HTTP method (GET, POST) and forward the request to the correct Controller.
*   **Example**: `routes/userRoutes.js`
    ```javascript
    // If GET /api/users/profile, run authMiddleware first, then getProfile controller
    router.get('/profile', authMiddleware, getProfile);
    ```

### **C. Middleware ([middleware/authMiddleware.js](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/server/src/middleware/authMiddleware.js))**
Middlewares are "gatekeepers" that run *before* the controller.
*   **`authMiddleware`**:
    1.  Checks for a `Authorization: Bearer <token>` header.
    2.  Verifies the Token using `jsonwebtoken`.
    3.  If valid, it attaches the user info to `req.user` so the Controller knows who is asking.
    4.  If invalid, it rejects the request (401 Unauthorized) immediately.

### **D. Controllers (`controllers/*.js`)**
This is where the **Business Logic** lives.
*   **Example**: `userController.js` -> [getProfile](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/server/src/controllers/profileController.js#4-20)
    1.  Read `req.user.id` (set by middleware).
    2.  Call Database: `User.findById(req.user.id)`.
    3.  Send Response: `res.json(user)`.

### **E. Models (`models/*.js`)**
Defines the **Shape of Data** using Mongoose Schemas.
*   **Example**: [User.js](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/server/src/models/User.js) defines that a user has a `name` (String), `email` (String), `role` (Enum), etc.

---

## 🎨 2. Frontend Architecture (`client/`)
The frontend is built with **React** (Vite) and uses **Components** to build the UI.

### **A. Entry Point & Routing**
1.  **[main.jsx](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/client/src/main.jsx)**: Bootstraps React and renders [App.jsx](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/client/src/App.jsx).
2.  **[App.jsx](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/client/src/App.jsx)**: Defines the "Map" of your app using `react-router-dom`.
    *   **Routes**: URL `/login` -> Shows `<Login />` component.
    *   **Protection**: Routes wrapped in `<ProtectedRoute />` check if you are logged in. If not, they kick you back to Login.

### **B. State Management ([context/AuthContext.jsx](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/client/src/context/AuthContext.jsx))**
This is the **Global Memory** of the app.
*   It stores the current `user` object and `token`.
*   It provides [login()](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/client/src/context/AuthContext.jsx#19-26) and [logout()](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/client/src/context/AuthContext.jsx#35-40) functions to any component that needs them.
*   **Why?** So you don't have to pass "user" props down through 10 layers of components.

### **C. API Layer (`api/axios.js`)**
Instead of writing `fetch('http://localhost:5000/api/...')` everywhere, we use a configured **Axios** instance.
*   It automatically adds the `Authorization: Bearer token` header to every request.
*   It handles base URLs automatically.

### **D. Page Logic Flow (Example: "Find a Lawyer")**
How does [LawyerDirectory.jsx](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/client/src/pages/LawyerDirectory.jsx) actually work?

1.  **Mounting (`useEffect`)**: When the page loads, `useEffect` runs.
2.  **API Call**: It calls `axios.get('/lawyers')`.
3.  **Backend Hit**:
    *   Server receives GET `/api/lawyers`.
    *   `lawyerController.getLawyers` runs.
    *   Database queries `User.find({ role: 'LAWYER' })`.
    *   JSON data returns.
4.  **State Update**: React sees new data (`setLawyers(res.data)`).
5.  **Re-render**: React updates the screen, mapping over the `lawyers` array to display a Card for each one.

### **E. Real-Time Logic (Socket.io)**
*   **[components/NotificationBell.jsx](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/client/src/components/NotificationBell.jsx)**:
    *   Connects to the Socket server.
    *   Listens for events like `"notification"`.
    *   When an event arrives, it adds a red badge to the bell icon instantly, without refreshing the page.

---

## 🚀 Summary of Request Flow
**Scenario**: User clicks "Book Appointment".

1.  **Frontend**: [Appointments.jsx](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/client/src/pages/Appointments.jsx) sends `POST /appointments` with data `{ date, note }`.
2.  **Network**: Request travels to Port 5000.
3.  **Backend Middleware**: `authMiddleware` verifies token ("Okay, this is Client John").
4.  **Backend Route**: `appointmentRoutes.js` sees POST and calls [createAppointment](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/server/src/controllers/appointmentController.js#4-30).
5.  **Controller**:
    *   Validates data.
    *   Saves new [Appointment](file:///c:/Users/dynamic%20computer/Desktop/work/FAST/semester%207/webdev/project/client/src/pages/Appointments.jsx#9-395) to MongoDB.
    *   **Socket**: Emits "New Appointment" event to the Lawyer.
6.  **Database**: MongoDB stores the record.
7.  **Response**: Server sends `201 Created`.
8.  **Frontend**: React receives success, closes modal, and shows "Success!" toast.
