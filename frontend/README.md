# URL Shortener Frontend

This is the frontend application for the MERN URL Shortener, built using React and Vite with a modern, glassmorphic aesthetic using Tailwind CSS and DaisyUI.

## Application Pages & Routing

The application is structured as a Single Page Application (SPA) with the following key pages:

### 1. Home Page (`/`)
* **Component**: `src/pages/Home.jsx`
* **Purpose**: This is the core application dashboard. Users can paste a long URL to generate a short, shareable link.
* **Features**:
  * Clean, interactive input form.
  * Dynamically generates a downloadable QR code for the short link.
  * "Copy to clipboard" functionality.

### 2. Sign Up Page (`/signup`)
* **Component**: `src/pages/Signup.jsx`
* **Purpose**: Handles new user registration.
* **Features**:
  * Collects the user's Name, Email, and Password.
  * Features a "peek" (hold to view) toggle on the password field for better UX.
  * Submits data to the backend and navigates the user to the OTP verification step upon success.

### 3. Verify OTP Page (`/verify`)
* **Component**: `src/pages/VerifyOTP.jsx`
* **Purpose**: Completes the two-step verification process for new signups.
* **Features**:
  * Prompts the user for the 6-digit OTP sent to their email via the backend.
  * Prevents unauthorized access until the email is verified.

### 4. Login Page (`/login`)
* **Component**: `src/pages/Login.jsx`
* **Purpose**: Authenticates returning users into the application.
* **Features**:
  * Accepts email and password (with the hold-to-view toggle).
  * Stores the returned JWT token, user email, and user name in `localStorage` via the global `AuthContext`.
  * **Forgot Password Modal**: Includes a seamless modal overlay where users can request a password reset OTP if they've forgotten their credentials. It provides clear visual feedback if the email doesn't exist.

### 5. Reset Password Page (`/reset-password`)
* **Component**: `src/pages/ResetPassword.jsx`
* **Purpose**: The final step in the account recovery flow.
* **Features**:
  * Users who requested an OTP in the Login modal are redirected here.
  * Requires the user to enter the 6-digit OTP and their new password (with hold-to-view toggle).
  * Upon success, redirects the user back to the Login page to authenticate with their new credentials.

## State Management

* **AuthContext**: A global React Context (`src/context/AuthContext.jsx`) is used to manage authentication state across the application. It persists the JWT token and basic user details (Name, Email) to ensure the user stays logged in across page reloads.

## Styling & Design

The app emphasizes visual excellence:
* Uses sleek dark modes, deep background orbs, and glassmorphism.
* Styling is handled directly via `index.css` and Tailwind classes.
* Components use micro-animations and intuitive hover effects.
