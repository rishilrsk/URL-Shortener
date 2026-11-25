# 🔗 URL Shortener — MERN Stack

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Link-46E3B7?style=for-the-badge&logo=render)](https://frontend-elb7.onrender.com)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-blue.svg?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/react-%5E19.0.0-cyan.svg?style=for-the-badge&logo=react)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A premium, modern, and lightning-fast **MERN Stack URL Shortener** application. It has a clean, responsive interface that works on phones, tablets and desktops, and it allows users to instantly shorten long URLs, download generated QR codes, copy links with a single click, and track click counts in real-time.

---

## 🚀 Live Deployment Links

⚡ Access the live environment below:
| Layer | Platform | URL |
| :--- | :--- | :--- |
| **Frontend UI** | Render | 🌐 [frontend-elb7.onrender.com](https://frontend-elb7.onrender.com) |
| **Backend API** | Render | ⚙️ [backend-7kq8.onrender.com](https://backend-7kq8.onrender.com/health) |

---

## ✨ Features

*   **Instant URL Shortening:** Convert long, complex URLs into short, clean, and easily shareable links.
*   **Automated QR Code Generation:** Every shortened URL automatically generates a high-quality QR code.
*   **QR Code Download:** Directly download the generated QR code as a PNG file for offline sharing.
*   **One-Click Copy:** Convenient copy button with instant interactive visual feedback ("Copied!").
*   **Click Analytics:** Dynamically increments and tracks click counts every time the short link is visited.
*   **Clean, responsive design:** Works from 320px phones to wide desktops, follows the device's light or dark mode, and is keyboard and screen-reader friendly.
*   **Input Validation:** Validates URLs on both the frontend and backend to prevent broken redirects.
*   **Safe ID Generation:** Uses cryptographically secure `nanoid` (7 characters) to generate unique short IDs.

---

## 🛠️ Tech Stack

### Frontend
*   **React 19** – Modern library for building user interfaces.
*   **Vite** – Super fast frontend build tool.
*   **Plain CSS** with design tokens (`src/index.css`) and shared UI components (`src/components/ui.jsx`).
*   **Axios** – Promise-based HTTP client for API requests.
*   **react-qr-code** & **qrcode** – QR code rendering and downloading.

### Backend
*   **Node.js** – JavaScript runtime environment.
*   **Express 5** – Minimalist web framework for Node.js APIs.
*   **MongoDB & Mongoose** – NoSQL database and object modeling.
*   **Nanoid** – Safe, url-friendly, unique string ID generator.
*   **Cors** – Middleware to enable cross-origin requests.
*   **Dotenv** – Zero-dependency module to load environment variables.

---

## 📂 Project Structure

```text
├── backend/
│   ├── models/
│   │   └── Url.js         # Mongoose schema for the URL model
│   ├── routes/
│   │   └── url.js         # API endpoints (shortening and redirecting)
│   ├── .env               # Local environment variables configuration (ignored)
│   ├── .env.example       # Template for backend environment variables
│   ├── server.js          # Main entry point for the Express server
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── App.jsx        # Main React component with UI logic
    │   ├── index.css      # Core styles, variables, background orbs
    │   └── main.jsx       # React DOM rendering
    ├── .env               # Local environment variables configuration (ignored)
    ├── .env.example       # Template for frontend environment variables
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 💻 Local Setup & Installation

### Prerequisites
Make sure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18.x or higher recommended)
*   [MongoDB Compass](https://www.mongodb.com/try/download/compass) or a free [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)

### Step 1: Clone the Repository
```bash
git clone https://github.com/rishilrsk/URL-Shortener.git
cd URL-Shortener
```

### Step 2: Configure the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` and fill in your details:
   ```env
   # Database configuration
   MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

   # Server configuration
   PORT=5000
   BASE_URL=http://localhost:5000
   FRONTEND_URL=http://localhost:5173

   # Auth (required): a long random string
   JWT_SECRET=change-me-to-a-long-random-string

   # Email (Brevo SMTP) for verification and password-reset codes
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your-brevo-login-email@example.com
   SMTP_PASS=your-brevo-smtp-key
   EMAIL_FROM=no-reply@yourdomain.com
   ```
5. Start the backend development server (with nodemon auto-restart):
   ```bash
   npm run dev
   ```

### Step 3: Configure the Frontend
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` and configure the backend URL:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   ```
5. Start the frontend development server:
   ```bash
   npm run dev
   ```
6. Open your browser and navigate to the local address (usually `http://localhost:5173`).

---

## 🔌 API Endpoints

### 1. Shorten a URL
*   **Endpoint:** `/shorten`
*   **Method:** `POST`
*   **Content-Type:** `application/json`
*   **Request Body:**
    ```json
    {
      "originalUrl": "https://www.google.com/search?q=mern+stack+url+shortener"
    }
    ```
*   **Auth:** Optional. Guests (no `Authorization: Bearer <token>` header) can create 2 links per 24 hours per IP.
*   **Success Response (201 Created, or 200 OK when an existing link is reused):**
    ```json
    {
      "shortId": "xYz1A8b",
      "shortUrl": "http://localhost:5000/xYz1A8b"
    }
    ```
*   **Error Responses:**
    *   `400 Bad Request` – If `originalUrl` is missing or is an invalid URL format.
    *   `403 Forbidden` – Guest limit reached (`code: "GUEST_LIMIT"`).
    *   `500 Internal Server Error` – General server errors.

### 2. Redirect to Original URL
*   **Endpoint:** `/:shortId`
*   **Method:** `GET`
*   **Description:** Redirects the user to the corresponding `originalUrl` and increments the click counter by `1`.
*   **Success Response (302 Found):** Redirects automatically to the destination URL.
*   **Error Responses:**
    *   If the `shortId` does not exist or has expired, redirects to the frontend's `/not-found` page.

### 3. Other endpoints
*   `GET /health` – Returns `200` when the server and database are up, `503` otherwise.
*   `GET /api/urls/mine` – The logged-in user's links with click counts (requires login).
*   `POST /api/auth/signup`, `/verify`, `/resend-otp`, `/login`, `/forgot-password`, `/reset-password`, and `GET /api/auth/me`.

> Short links are deleted automatically 14 days after they are created.

---

## ☁️ Deploying on Render

**Backend (Web Service):** set `MONGO_URL`, `JWT_SECRET`, `BASE_URL` (the backend's own URL), `FRONTEND_URL` (the frontend URL, no trailing slash) and the `SMTP_*` / `EMAIL_FROM` variables. The server exits with a clear log message if any required variable is missing or MongoDB can't be reached. In MongoDB Atlas → Network Access, allow `0.0.0.0/0` because Render's IPs change.

**Frontend (Static Site):** set `VITE_BACKEND_URL` to the backend URL, then under *Redirects/Rewrites* add a rule: Source `/*`, Destination `/index.html`, Action `Rewrite`. Without it, refreshing any page other than `/` shows a 404.

---

## 🛠️ Production Build

To build the React application for production deployment:

1. Navigate to `/frontend`:
   ```bash
   cd frontend
   ```
2. Run the build command:
   ```bash
   npm run build
   ```
   This generates a production-optimized build in the `dist` folder, ready to be hosted on Vercel, Netlify, or static web servers.

---

## 👤 Author

*   **Rishi**
    *   GitHub: [@rishilrsk](https://github.com/rishilrsk)
    *   LinkedIn: [rishisivakesh](https://www.linkedin.com/in/rishisivakesh/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
