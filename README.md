# Peer-to-Peer Academic Book & Reviewer Exchange System

A complete, modern, responsive, and secure web-based academic marketplace designed for university students to lend, donate, sell, and exchange second-hand academic materials such as textbooks, board exam reviewers, lecture notes, study guides, and laboratory manuals.

---

## 🛠️ Technology Stack

- **Frontend:** React.js (Vite), Tailwind CSS, Lucide React Icons, Chart.js (`react-chartjs-2`), React Router v6
- **Backend:** Python 3.12, Django 5.1.x, Django REST Framework (DRF), `django-cors-headers`
- **Database:** MySQL (via `PyMySQL` / `mysqlclient`), with configurable SQLite fallback for zero-setup execution
- **Authentication:** Django Token Authentication & REST API Session Management
- **Styling & UI/UX:** Responsive Academic / University design (Navy Blue, Slate, Emerald & Amber tones)

---

## 📁 Project Folder Structure

```
c:\Finals Project\
├── backend\
│   ├── core\                     # Django Project configuration
│   │   ├── settings.py           # Database, CORS, DRF, Auth settings
│   │   ├── urls.py               # Root API routing
│   │   ├── stats_views.py        # Student & Admin Dashboard metrics APIs
│   │   ├── wsgi.py & asgi.py
│   ├── accounts\                 # User & Student Profile Module
│   │   ├── models.py             # StudentProfile, Role, Rating fields
│   │   ├── serializers.py        # User, Register, Profile serializers
│   │   ├── views.py              # Auth views, status moderation
│   │   ├── permissions.py        # IsOwnerOrReadOnly, IsAdminRole
│   │   └── urls.py
│   ├── marketplace\              # Marketplace & Catalog Module
│   │   ├── models.py             # Category, AcademicMaterial, Listing, Review, Report
│   │   ├── serializers.py        # Material, Listing, Review serializers
│   │   ├── views.py              # Feed, filters, search, moderation, reviews
│   │   └── urls.py
│   ├── transactions\             # Exchange Pathways Module
│   │   ├── models.py             # TransactionRequest, BorrowingRecord, ExchangeRequest
│   │   ├── serializers.py        # Transactions & Borrowing serializers
│   │   ├── views.py              # Lend/Borrow workflow, returns, purchase handover
│   │   └── urls.py
│   ├── communications\           # Chat & Alerts Module
│   │   ├── models.py             # Message, Notification
│   │   ├── serializers.py        # Direct messages & notifications
│   │   ├── views.py              # Threaded messaging & unread counts
│   │   └── urls.py
│   ├── seed_data.py              # Realistic university sample data seeder
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Environment configuration
│   └── manage.py
├── frontend\
│   ├── src\
│   │   ├── api\                  # Axios client with Token interceptor
│   │   ├── context\              # AuthContext, NotificationContext
│   │   ├── components\           # Navbar, Footer, Sidebars, Badges, Cards, Modals
│   │   ├── pages\
│   │   │   ├── Home.jsx          # Public landing, search, categories, how it works
│   │   │   ├── Marketplace.jsx   # Live search, filters (type, condition, price, category)
│   │   │   ├── MaterialDetail.jsx# Full details, buy/borrow/donate/exchange request modals
│   │   │   ├── Login.jsx         # Demo quick-fill & authentication
│   │   │   ├── Register.jsx      # Student registration with academic fields
│   │   │   ├── student\          # Student Portal (10 modules)
│   │   │   └── admin\            # Admin Portal (Analytics charts, moderation, reports)
│   │   ├── App.jsx               # Routes definition
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── database\
│   └── init_db.sql               # MySQL database schema & category seeds
├── run_backend.bat               # 1-Click backend launcher
├── run_frontend.bat              # 1-Click frontend launcher
├── run_all.bat                   # 1-Click complete system launcher
└── README.md
```

---

## 🚀 Quick Start Guide (Windows)

### 1. Launch with 1-Click Scripts
Simply double-click:
```bat
run_all.bat
```
This automatically starts:
- **Django API Server:** `http://127.0.0.1:8000`
- **React Frontend:** `http://localhost:5173`

Or start them individually in two command prompts:
```bat
run_backend.bat
run_frontend.bat
```

---

## 🗄️ Database Setup (MySQL & SQLite)

The system supports **MySQL** out of the box using PyMySQL (no C++ compiler needed on Windows).

### To connect your MySQL Database (e.g. XAMPP, WAMP, or MySQL 8.x):
1. Open MySQL (e.g., start Apache and MySQL in XAMPP).
2. Create the database:
   ```sql
   CREATE DATABASE academic_exchange_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   *(Or import `database/init_db.sql` via phpMyAdmin / MySQL CLI).*
3. In `backend/.env`, set:
   ```ini
   USE_SQLITE=False
   DB_ENGINE=django.db.backends.mysql
   DB_NAME=academic_exchange_db
   DB_USER=root
   DB_PASSWORD=
   DB_HOST=127.0.0.1
   DB_PORT=3306
   ```
4. Run migrations and seed sample data:
   ```bash
   cd backend
   .\venv\Scripts\python.exe manage.py migrate
   .\venv\Scripts\python.exe seed_data.py
   ```

*Note: By default, `USE_SQLITE=True` is set in `backend/.env` so the system runs immediately out-of-the-box without requiring an active MySQL daemon.*

---

## 🔑 Pre-Seeded Test Accounts

| Role | Username | Password | Full Name & Details |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | System Administrator (Full Admin Portal Access) |
| **Student** | `maria.santos` | `student123` | Maria Santos (BS Computer Science, 3rd Year) |
| **Student** | `juan.delacruz` | `student123` | Juan Dela Cruz (BS Nursing, 4th Year) |
| **Student** | `ana.reyes` | `student123` | Ana Reyes (BS Accountancy, 2nd Year) |
| **Student** | `david.lee` | `student123` | David Lee (BS Civil Engineering, 3rd Year) |
| **Student** | `clara.bautista`| `student123` | Clara Bautista (BS Psychology, 1st Year) |

*The Login page features **"Student Demo"** and **"Admin Demo"** quick-fill buttons for instant testing.*

---

## 📦 System Modules & Workflows

### Module 1: Authentication & User Profiles
- Student registration captures `student_id_number`, `university`, `college`, `degree_program`, `year_level`, and `contact_number`.
- Secure password hashing and token generation.
- Profile picture uploads, student bio, and dynamic rating calculations.

### Module 2: Academic Marketplace
- Public feed of verified textbooks, reviewers, and lecture notes.
- Real-time search across title, author, subject code (e.g. `CS201`, `MATH21`), course name, and description.
- Multi-dimensional filters: Transaction Type (Sale, Lend, Donation, Exchange), Condition (New, Good, Fair, Used), Category chips, and Price range.

### Module 3: Listing Management
- Students can add new materials with actual cover images, set condition, price, or exchange preferences.
- Toggle availability between `AVAILABLE` and `UNAVAILABLE` (reserved).
- Edit and delete listings with ownership permission checks.

### Module 4: Borrowing & Lending Management
- Students request to borrow materials for exam preparation.
- Owners accept requests and set agreed return windows (days).
- Tracks return dates, active borrowings in hand, and overdue flags.
- Lender confirms physical book return, which automatically restores the listing to `AVAILABLE` and marks the transaction `COMPLETED`.

### Module 5: Selling & Purchasing
- Purchase requests coordinate cash-on-meetup between students without payment gateway fees.
- Seller accepts/declines, coordinates campus pickup, and marks the item `SOLD`.

### Module 6: Donations & Book-for-Book Exchange
- Students can offer free learning resources to juniors.
- Propose direct material-for-material swaps (selecting an uploaded book or custom trade details).

### Module 7: Messaging & Notifications
- Two-pane student messenger with real-time conversations.
- Automated system notifications for new requests, acceptances, due dates, reviews, and direct messages.

### Module 8: Ratings & Feedback
- Only unlocked after a transaction is marked `COMPLETED`.
- 1 to 5 star ratings with written reviews that update the student's cumulative average.

### Module 9: Administrator Portal & Analytics
- Overview metrics: Registered students, active listings, pending moderations, borrowing transactions, and reports.
- **Chart.js Visualizations:**
  1. Monthly Student Registrations (Bar Chart)
  2. Popular Academic Categories (Doughnut Chart)
  3. Monthly Marketplace Transactions (Line Chart)
  4. Distribution of Transaction Types (Pie Chart)
- Listing moderation (Approve, Reject with reasons, or Remove).
- Student account moderation (Suspend, Reactivate, Promote to Admin).
- Subject categories management.
- Reported content and user safety investigation.

