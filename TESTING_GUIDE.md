# Lawyer App - Frontend Testing Guide

This document outlines the expected behavior and testing steps for each feature in the Lawyer App. Use this to verify the application's functionality.

## 1. Authentication
**Goal**: Verify users can register, login, and logout.

- [ ] **Registration**
    - Go to `/register`.
    - Sign up as a **Litigant** (Client).
    - Verify redirection to Dashboard.
    - **Test**: Try registering with an existing email (should fail).
- [ ] **Login**
    - Go to `/login`.
    - Enter valid credentials.
    - Verify redirection to Dashboard.
    - **Test**: Enter wrong password (should show error).
- [ ] **Logout**
    - Click "Logout" in the navbar.
    - Verify redirection to Login page.

## 2. Dashboard
**Goal**: Verify the dashboard displays relevant information.

- [ ] **Navigation**
    - Verify all links in the navbar work (Cases, Research, Directory, Market, Chat, Elections).
- [ ] **Content**
    - Verify "Welcome, [Name]" is displayed.
    - Verify "Quick Actions" buttons work.

## 3. Case Management
**Goal**: Verify users can manage their legal cases.

- [ ] **Create Case**
    - Go to `/cases`.
    - Click "New Case".
    - Fill form (Title, Court, Type, Status).
    - Submit and verify the new case appears in the list.
- [ ] **View Case**
    - Click on a case card.
    - Verify details (Case Number, Next Hearing).
- [ ] **Upload Document**
    - In Case Details, use the "Upload Document" section.
    - Select a file and upload.
    - Verify the document appears in the list below.

## 4. Legal Research Hub
**Goal**: Verify users can search for laws.

- [ ] **Search**
    - Go to `/research`.
    - Type a keyword (e.g., "Constitution", "Penal").
    - Verify results filter in real-time.
- [ ] **View Law**
    - Click "Read More" on a law card.
    - Verify the modal opens with the full text.

## 5. Lawyer Directory
**Goal**: Verify users can find and contact lawyers.

- [ ] **Browse**
    - Go to `/lawyers`.
    - Verify a grid of lawyer profiles.
- [ ] **Filter**
    - Use the search bar to filter by name or specialization.
- [ ] **Profile & Contact**
    - Click "View Profile".
    - Click the **"Message"** button.
    - Verify redirection to the Chat page with the lawyer selected.

## 6. Marketplace
**Goal**: Verify users can view and "buy" items.

- [ ] **Browse Items**
    - Go to `/marketplace`.
    - Verify items (books, templates) are listed.
- [ ] **Sell Item** (If Lawyer/Vendor)
    - Click "Sell Item".
    - Fill form and submit.
    - Verify item appears in the grid.
- [ ] **Buy Item**
    - Click "Buy Now".
    - Verify a success alert or modal appears.

## 7. Chat System
**Goal**: Verify real-time messaging.

- [ ] **Send Message**
    - Go to `/chat`.
    - Select a conversation from the sidebar (or start one via Directory).
    - Type a message and hit Send.
    - Verify the message appears immediately.
- [ ] **Receive Message**
    - Open the app in a second browser window (incognito) with a different user.
    - Send a message from User A to User B.
    - Verify User B sees the message in real-time.

## 8. Bar Elections
**Goal**: Verify voting functionality.

- [ ] **View Elections**
    - Go to `/elections`.
    - Verify active polls are listed.
- [ ] **Vote**
    - Select a candidate.
    - Click "Vote".
    - Verify the results chart updates (or shows "You have voted").

## 9. Notifications
**Goal**: Verify system alerts.

- [ ] **Check Notifications**
    - Click the **Bell Icon** in the navbar.
    - Verify a dropdown list of notifications appears.
- [ ] **Mark as Read**
    - Click on an unread notification (blue background).
    - Verify it turns white (read) and the badge count decreases.

## 10. Admin Dashboard (Admin Only)
**Goal**: Verify admin management tools.

- [ ] **Access**
    - Login as an Admin (role: `SYSTEM_ADMIN`).
    - Go to `/admin`.
- [ ] **Stats**
    - Verify charts (User Growth, Case Status) and stat cards are visible.
- [ ] **User Management**
    - Go to "Manage Users".
    - Verify the list of users.
    - **Test**: Change a "Litigant" to "Lawyer" using the action button.
