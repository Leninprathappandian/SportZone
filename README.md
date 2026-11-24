# SportZone - Sports Equipment & Athletic Gear Platform

A full-stack sports e-commerce web application with a responsive modern UI, RESTful API backend, MySQL database, Nginx reverse proxy, and automated Docker & Jenkins CI/CD pipelines.

---

## 📁 Architecture & File Structure

```text
SportZone/
│
├── frontend/
│   ├── index.html           # Athletic gear store UI & interactive catalog
│   ├── css/
│   │   └── style.css        # Modern athletic sports aesthetic & responsive styles
│   ├── js/
│   │   └── script.js        # Catalog rendering, search, filters & shopping cart logic
│   ├── nginx.conf           # Reverse proxy configuration (serves UI & routes /api/)
│   └── Dockerfile           # Alpine Nginx container
│
├── backend/
│   ├── config/
│   │   └── db.js            # MySQL database connection pool
│   ├── controllers/
│   │   └── productController.js # REST endpoints (list, search, filter, details, create)
│   ├── routes/
│   │   └── productRoutes.js # Express router for products
│   ├── server.js            # Express application server
│   ├── package.json         # Backend dependencies & startup scripts
│   └── Dockerfile           # Node.js Alpine container
│
├── database/
│   └── init.sql             # Schema definition & pre-seeded sports equipment catalog
│
├── docker-compose.yml       # Multi-container orchestration (Nginx, Node.js API, MySQL 8.0)
├── Jenkinsfile              # Declarative CI/CD pipeline
└── .gitignore               # Ignored dependencies & build artifacts
```

---

## 🚀 Quick Start with Docker Compose

To start the entire stack (Database, Backend API, and Frontend):

```bash
cd SportZone
docker compose up -d --build
```

- **Frontend Web UI**: `http://localhost` (Port 80)
- **Backend REST API**: `http://localhost:5000/api/products`
- **MySQL Database**: `localhost:3306`

To shut down:
```bash
docker compose down
```

---

## 💻 Local Development Setup

### 1. Database
Import the schema and initial seed data from `database/init.sql` into your local MySQL instance:
```bash
mysql -u root -p < database/init.sql
```

### 2. Backend
```bash
cd backend
npm install
npm start
```
The API will run at `http://localhost:5000`.

### 3. Frontend
Open `frontend/index.html` directly in your browser or serve it with any local static HTTP server.
