# 🏦 Banking + DevOps Project

A production-grade **Banking REST API** with a **React Dashboard**, fully containerized and deployed through a complete DevOps pipeline.

---

## 🏗️ Architecture

```
Developer → GitHub → GitHub Actions CI/CD → Docker Hub → Kubernetes (EKS)
                                                              ↓
                                                 Backend API + Frontend + MongoDB
                                                              ↓
                                                    Prometheus + Grafana
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 20+, npm
- MongoDB (local) or Docker
- Docker & Docker Compose

### 1. Backend

```bash
# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Seed the database (requires MongoDB running)
node scripts/seed-db.js

# Start backend in dev mode
npm run dev
# API running at http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
# React app at http://localhost:3000
```

### 3. Full Stack with Docker

```bash
docker-compose up --build
# Backend:    http://localhost:5000
# Frontend:   http://localhost:3000
# Prometheus: http://localhost:9090
# Grafana:    http://localhost:3001
```

---

## 📋 Demo Credentials (after seeding)

| Role     | Email                | Password   | Balance   |
|----------|---------------------|------------|-----------|
| Admin    | <admin@bank.com>      | Admin@1234 | —         |
| Customer | <alice@example.com>   | Alice@1234 | ₹50,000   |
| Customer | <bob@example.com>     | Bob@1234   | ₹25,000   |

---

## 🧪 Running Tests

```bash
npm test
# Runs all Jest tests with coverage report
```

Test coverage:

- ✅ Auth: Register, Login, JWT protected routes
- ✅ Accounts: Create, List, Deposit, Withdraw
- ✅ Transactions: Transfer, History, Error cases

---

## 📡 API Reference

### Auth

| Method | Endpoint             | Access  | Description        |
|--------|---------------------|---------|--------------------|
| POST   | `/api/auth/register`| Public  | Create account     |
| POST   | `/api/auth/login`   | Public  | Get JWT token      |
| GET    | `/api/auth/me`      | Private | My profile         |

### Accounts

| Method | Endpoint                       | Description        |
|--------|--------------------------------|--------------------|
| GET    | `/api/accounts`               | List my accounts   |
| POST   | `/api/accounts`               | Create account     |
| POST   | `/api/accounts/:id/deposit`   | Deposit money      |
| POST   | `/api/accounts/:id/withdraw`  | Withdraw money     |

### Transactions

| Method | Endpoint                          | Description        |
|--------|-----------------------------------|--------------------|
| POST   | `/api/transactions/transfer`     | Transfer funds     |
| GET    | `/api/transactions`              | All my transactions|
| GET    | `/api/transactions/:accountId`   | Account history    |

---

## 🐳 Docker

```bash
# Build backend image
docker build -t banking-api --target production .

# Build frontend image
docker build -t banking-frontend ./client

# Run full stack
docker-compose up -d
```

---

## ☸️ Kubernetes Deployment

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check pods
kubectl get pods -n banking

# View logs
kubectl logs -f deployment/banking-backend -n banking
```

---

## 🏗️ Terraform (AWS EKS)

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

---

## 📊 Monitoring

- **Prometheus**: `http://localhost:9090` — metrics from `/metrics`
- **Grafana**: `http://localhost:3001` — admin/admin123

---

## 🤖 Ansible

```bash
# Provision servers
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml

# Run for specific host
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml --limit server1
```

---

## 📁 Project Structure

```
project1/
├── src/                    # Backend source
│   ├── app.js              # Express app entry
│   ├── config/db.js        # MongoDB connection
│   ├── models/             # User, Account, Transaction
│   ├── controllers/        # Auth, Account, Transaction logic
│   ├── routes/             # API routes
│   ├── middleware/         # JWT auth, error handler
│   └── utils/logger.js     # Winston logger
├── client/                 # React frontend
│   ├── src/pages/          # Login, Dashboard, Transactions
│   └── src/services/api.js # Axios service layer
├── tests/                  # Jest tests
├── k8s/                    # Kubernetes manifests
├── terraform/              # AWS EKS infrastructure
├── monitoring/             # Prometheus + alerts
├── ansible/                # Server automation
├── scripts/                # Deploy, backup, health-check
├── Dockerfile              # Backend container
├── docker-compose.yml      # Local dev stack
├── Jenkinsfile             # Jenkins pipeline
└── .github/workflows/      # GitHub Actions CI/CD
```

---

## 🔐 Security Features

- JWT authentication (7-day expiry)
- `bcrypt` password hashing (salt rounds: 12)
- Rate limiting (100 req / 15 min)
- Helmet.js security headers
- Non-root Docker user
- Role-based access control (customer / admin)

---

## 📜 License

MIT — Built for learning DevOps & Banking systems.
