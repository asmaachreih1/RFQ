# RFQ Marketplace

A Real-time Request for Quotation (RFQ) platform connecting Users (Buyers) and Companies (Suppliers). Users can post requests for materials or services, and Companies can submit quotations in real-time.

##  Folder Structure

```
RFQ/
├── backend/               # PHP Yii2 Backend API & WebSocket Server
│   ├── backend/           # API Controllers & Models
│   ├── console/           # WebSocket Server & Migrations
│   ├── common/            # Shared Configurations (DB)
│   └── ...
├── frontend/              # Next.js 14+ Frontend (App Router)
│   ├── app/               # Pages & Components
│   ├── lib/               # API & Utils
│   └── ...
└── README.md              # Project Documentation
```

---

## Technologies Used

-   **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI (Glassmorphism Design).
-   **Backend**: PHP Yii2 Framework (REST API).
-   **Database**: MySQL.
-   **Real-time**: Custom PHP WebSocket Server (Ratchet/ReactPHP).
-   **Deployment**: Vercel (Frontend), VPS (Backend).

---

## Setup Instructions

### 1. Database Setup
1.  Create a MySQL database named `rfq_db`.
2.  Update database credentials in `backend/common/config/main-local.php`:
    ```php
    'dsn' => 'mysql:host=localhost;dbname=rfq_db',
    'username' => 'root',
    'password' => '',
    ```

### 2. Backend Setup (Yii2)
Prerequisites: PHP 8.1+, Composer.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    composer install
    ```
3.  Run migrations to create tables:
    ```bash
    php yii migrate
    ```
4.  Start the API server:
    ```bash
    php yii serve --docroot="backend/web" --port=8080
    ```
    *API will run at `http://localhost:8080/api`*

5.  **Start the WebSocket Server** (Required for real-time notifications):
    Open a new terminal in `backend/` and run:
    ```bash
    php console/server.php
    ```
    *Runs on port `8082`*

### 3. Frontend Setup (Next.js)
Prerequisites: Node.js 18+.

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables & Configuration

### Frontend (`frontend/.env.local` or Vercel Config)
Set these if deploying or if your local ports differ.
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://127.0.0.1:8082
```

### Backend (`backend/common/config/main-local.php`)
Configure your DB connection here.

---

## Demo Credentials

Since the database is initially empty, please **Register** using the "Get Started" button on the homepage.

Recommended Test Scenarios:

**1. Test User (Buyer)**
*   **Role**: User
*   **Email**: `user@demo.com`
*   **Password**: `password123`
*   *Action: Post a new RFQ.*

**2. Test Company (Supplier)**
*   **Role**: Company
*   **Email**: `company@demo.com`
*   **Password**: `password123`
*   *Action: Go to Dashboard -> Available Requests -> Submit a Quote.*

---

## WebSocket & Real-time Features

The platform uses a custom WebSocket server to handle real-time events.

*   **New RFQ**: When a User posts a request, companies subscribed to that category receive a **Banner Notification**.
*   **New Quotation**: When a Company submits a quote, the Request Owner receives a **Banner Notification**.
*   **Status Updates**: Dashboard statistics (Available Requests, Active Quotes) update in real-time.

---

## API Documentation

The backend exposes a REST API at `/api`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | Login and get JWT |
| `POST` | `/auth/register` | Register new account |
| `GET` | `/rfq` | Get requests (filtered by role) |
| `POST` | `/rfq` | Create a new RFQ |
| `POST` | `/quotation` | Submit a quotation |
| `GET` | `/subscription` | Get user/company subscriptions |
| `POST` | `/subscription/toggle` | Subscribe/Unsubscribe category |

*(Authentication: Bearer Token required for most endpoints)*
