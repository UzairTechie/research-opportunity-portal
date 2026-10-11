# University Research Opportunity Portal

**Course:** Computer Networks (Fall 2026)  
**Assignment:** Assignment #01  
**Author:** M.UZAIR SHOAIB 
**Registration No:** 24P-0507  
**Class / Section:** BSCS 5A  
**GitHub Repository:** `https://github.com/UzairTechie/research-opportunity-portal`
**Demonstration Video Link:** `https://drive.google.com/file/d/1WnfZRwDV86_l11jmirdd2Vy0Auo9EELd/view?usp=sharing` 

---

## 1. Project Description
The **University Research Opportunity Portal** is a full-stack web application developed for university faculty members to post, view, update, and manage student research opportunities in one centralized location.

Traditionally, research opportunities are fragmented across emails, WhatsApp groups, and physical noticeboards, causing students to miss valuable openings and faculty members to struggle with application tracking. This portal solves the problem by providing:
- A structured **MySQL Database** enforcing data integrity and constraints.
- A **REST API Backend** built with Node.js and Express to handle all CRUD operations.
- A simple, clean, and responsive **Frontend Interface** (HTML, CSS, Vanilla JavaScript) that interacts dynamically with the backend without hard-coded data.
- An automated **Postman Test Collection** covering all standard and error scenarios.

---

## 2. Technologies Used

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Node.js & Express.js | Lightweight HTTP server and RESTful routing engine. |
| **Database** | MySQL | Relational database management system with connection pooling (`mysql2`). |
| **Frontend** | HTML5, Vanilla CSS3, JavaScript (ES6+) | Clean, responsive UI consuming the REST API via the native `fetch` API. |
| **Environment** | `dotenv` & `cors` | Environment isolation for credentials and cross-origin request handling. |
| **API Testing** | Postman | Automated collection with tests verifying status codes and responses. |

---

## 3. Project Structure

```
research-opportunity-portal/
├── backend/
│   ├── config/
│   │   └── db.js                        # MySQL connection pool configuration
│   ├── controllers/
│   │   └── opportunityController.js     # CRUD handlers, validation & status codes
│   ├── routes/
│   │   └── opportunityRoutes.js         # REST API route mappings
│   └── server.js                        # Express app entry point & static file server
├── frontend/
│   ├── css/
│   │   └── style.css                    # Responsive stylesheet
│   ├── js/
│   │   └── app.js                       # Frontend logic (fetch API, DOM updates, validation)
│   └── index.html                       # Portal dashboard and modal layouts
├── database/
│   └── schema.sql                       # Database creation, table schema & sample data
├── postman/
│   └── Research_Opportunity_Portal.postman_collection.json # Exported Postman test collection
├── test/
│   └── test_api_scenarios.js            # Automated backend integration test suite
├── .env.example                         # Template for local environment variables
├── .gitignore                           # Git ignore rules (node_modules, .env, OS files)
├── package.json                         # Node dependencies and execution scripts
└── README.md                            # Complete setup and execution documentation
```

---

## 4. Prerequisites

Before running the application, make sure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher) — [Download Node.js](https://nodejs.org/)
- **npm** (comes bundled with Node.js)
- **MySQL Server** (v8.0+ or via XAMPP / WAMP / MySQL Workbench)
- **Postman Desktop Agent / App** — [Download Postman](https://www.postman.com/downloads/)
- **Git** (optional, for cloning)

---

## 5. MySQL Database Setup

1. Start your local MySQL service (via Windows Services, XAMPP Control Panel, or terminal).
2. Run the database script located in `database/schema.sql`. You can use any of the following methods:

### Method A: Using MySQL Command Line
Open PowerShell or Command Prompt in the project folder and run:
```bash
mysql -u root -p < database/schema.sql
```
*(Enter your MySQL password when prompted.)*

### Method B: Using MySQL Workbench
1. Open **MySQL Workbench** and connect to your local MySQL instance.
2. Go to **File -> Open SQL Script...** and select `database/schema.sql`.
3. Click the **Execute (Lightning Bolt)** icon.
4. Refresh the *Schemas* list to verify that `research_portal_db` and table `research_opportunities` are created with sample records.

### Method C: Using phpMyAdmin (XAMPP)
1. Open your browser and navigate to `http://localhost/phpmyadmin`.
2. Go to the **Import** tab.
3. Select `database/schema.sql` and click **Import**.

---

## 6. Environment Variable Setup

1. Create a `.env` file in the project root directory by copying the provided `.env.example` template:
```bash
# In Windows PowerShell:
Copy-Item .env.example .env

# Or in Command Prompt / Git Bash:
cp .env.example .env
```
2. Open `.env` and set your local MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=research_portal_db
DB_PORT=3306
```
> **Security Note:** Never commit your `.env` file or database passwords to GitHub. The `.env` file is intentionally listed in `.gitignore`.

---

## 7. Backend Installation

Install all required Node.js dependencies:
```bash
npm install
```
*(On Windows systems where PowerShell execution policies restrict npm scripts, run: `npm.cmd install`)*

---

## 8. Running the Backend Server

To start the server in production mode:
```bash
npm start
```

Or start in development mode with automatic reload:
```bash
npm run dev
```

When successfully started, the terminal will display:
```
====================================================
🚀 Research Opportunity Portal Server is running!
📡 API Base URL:  http://localhost:5000/api/opportunities
🌐 Frontend UI:   http://localhost:5000
====================================================
✅ Connected successfully to MySQL database: research_portal_db
```

---

## 9. Running the Frontend Application

The Express backend automatically serves the frontend interface as static assets.
- Simply open your web browser and navigate to:
  ```
  http://localhost:5000
  ```
- The frontend will load and connect dynamically to the backend REST API at `/api/opportunities`.

---

## 10. How to Run the Complete Project (Quick Summary)

For a quick setup from scratch, follow these 4 commands:
```bash
# 1. Initialize Database
mysql -u root -p < database/schema.sql

# 2. Configure Environment
cp .env.example .env     # (Edit .env with your MySQL password)

# 3. Install Dependencies
npm install

# 4. Start Server and Frontend
npm start
```
Then open `http://localhost:5000` in your browser.

---

## 11. REST API Endpoint Documentation

Base URL: `http://localhost:5000/api/opportunities`

| Method | Endpoint | Description | Request Body | Success Status | Error Statuses |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **POST** | `/api/opportunities` | Create a new research opportunity | JSON with all 10 fields (see schema below) | `201 Created` | `400 Bad Request`<br>`500 Server Error` |
| **GET** | `/api/opportunities` | Retrieve all research opportunities | None | `200 OK` | `500 Server Error` |
| **GET** | `/api/opportunities/:id` | Retrieve single opportunity by ID | None | `200 OK` | `400 Invalid ID`<br>`404 Not Found`<br>`500 Server Error` |
| **PUT** | `/api/opportunities/:id` | Update existing opportunity details or status | JSON with fields to update | `200 OK` | `400 Invalid Data`<br>`404 Not Found`<br>`500 Server Error` |
| **DELETE** | `/api/opportunities/:id` | Delete an opportunity by ID | None | `200 OK` | `400 Invalid ID`<br>`404 Not Found`<br>`500 Server Error` |

### Sample JSON Request Body (POST /api/opportunities):
```json
{
  "title": "Quantum Machine Learning in Wireless Mesh Networks",
  "description": "Investigating variational quantum algorithms for routing topology optimization.",
  "research_area": "Quantum Computing & Networks",
  "faculty_name": "Dr. Zeeshan Ali",
  "department": "Computer Science",
  "required_skills": "Python, Qiskit, Linear Algebra, Network Basics",
  "available_positions": 2,
  "application_deadline": "2026-11-20",
  "status": "Open"
}
```

---

## 12. Postman Testing Guide & Collection Import

An exported Postman Collection is provided in the repository at:
`postman/Research_Opportunity_Portal.postman_collection.json`

### How to Import the Collection:
1. Open the **Postman** desktop application.
2. Click the **Import** button in the top left workspace header.
3. Select **Files** and browse to:
   `postman/Research_Opportunity_Portal.postman_collection.json`
4. Click **Import**.

### Collection Variables:
- `{{baseUrl}}`: Pre-configured to `http://localhost:5000/api/opportunities`.
- `{{opportunityId}}`: Dynamically captured when Opportunity #1 is created.
- `{{deletedOpportunityId}}`: Dynamically captured when Opportunity #3 is created.

### Demonstration Scenarios Covered:
1. **Create Opportunity #1** — `POST /api/opportunities` (Expects `201 Created`)
2. **Create Opportunity #2** — `POST /api/opportunities` (Expects `201 Created`)
3. **Create Opportunity #3** — `POST /api/opportunities` (Expects `201 Created`)
4. **Retrieve All Opportunities** — `GET /api/opportunities` (Expects `200 OK`)
5. **Retrieve One Opportunity by ID** — `GET /api/opportunities/{{opportunityId}}` (Expects `200 OK`)
6. **Update an Opportunity** — `PUT /api/opportunities/{{opportunityId}}` (Expects `200 OK`)
7. **Change Status from Open to Closed** — `PUT /api/opportunities/{{opportunityId}}` (Expects `200 OK`)
8. **Delete an Opportunity** — `DELETE /api/opportunities/{{deletedOpportunityId}}` (Expects `200 OK`)
9. **Request Deleted Opportunity** — `GET /api/opportunities/{{deletedOpportunityId}}` (Expects `404 Not Found`)
10. **Send Invalid / Incomplete Data** — `POST /api/opportunities` (Expects `400 Bad Request`)

You can execute them individually by clicking **Send** on each request, or run the entire suite using Postman's **Run collection** feature.

---

## 13. Automated Unit/Integration Testing (Optional)

You can also run the built-in automated backend test suite without opening Postman:
```bash
node test/test_api_scenarios.js
```
This script runs an automated HTTP test harness validating all 20 test assertions across status codes `200`, `201`, `400`, and `404`.

---

