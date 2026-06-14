# MediLocker — Command Reference 📋

> Quick-access guide for setup, running, database, git, and API operations.

---

## 📥 One-Time Setup

```bash
# 1. Clone the repository
git clone https://github.com/Sandesh-Pandey/MediProject.git
cd MediProject

# 2. Install backend Python dependencies
cd Backend
pip install -r requirements.txt

# 3. Install frontend Node dependencies
cd ../frontend
npm install
```

---

## 🚀 Start the Project

> Open TWO terminals — one for backend, one for frontend.

```bash
# Terminal 1 — Backend (runs at http://localhost:8000)
cd Backend
uvicorn main:app --reload

# Terminal 2 — Frontend (runs at http://localhost:5173)
cd frontend
npm run dev
```

---

## 🌐 Important URLs

| URL                              | Description                        |
|----------------------------------|------------------------------------|
| http://localhost:5173            | Main React app                     |
| http://localhost:8000            | API health check                   |
| http://localhost:8000/docs       | Swagger UI — test all endpoints    |
| http://localhost:8000/redoc      | ReDoc — clean API documentation    |
| http://localhost:8000/admin      | Live DB viewer (auto-refresh 5s)   |

---

## 🗄️ Database Commands

```bash
# View all tables and row counts
cd Backend
python check_db.py

# Clear ALL data (schema kept, IDs reset)
cd Backend
python clear_db.py

# Open SQLite interactive shell
cd Backend
sqlite3 medilocker.db
```

### SQLite Shell Queries

```sql
.tables                          -- list all tables
.schema patients                 -- show table structure

SELECT * FROM patients;
SELECT * FROM doctor_users;
SELECT * FROM hospitals;
SELECT * FROM prescriptions;
SELECT * FROM appointments;
SELECT * FROM documents;
SELECT * FROM reminders;
SELECT * FROM notifications;

.quit                            -- exit shell
```

---

## 🔨 Build & Preview

```bash
# Build frontend for production
cd frontend
npm run build

# Preview the production build locally (http://localhost:4173)
cd frontend
npm run preview
```

---

## 🐙 Git Commands

```bash
# Check current status
git status

# See what changed in files
git diff

# Stage all changes
git add .

# Commit with a message
git commit -m "your message here"

# Push to GitHub
git push

# Pull latest from GitHub
git pull

# View commit history (short)
git log --oneline
```

---

## 🧪 Test API via curl (Windows CMD)

```bash
# Health check
curl http://localhost:8000

# Register a patient
curl -X POST http://localhost:8000/api/v1/patient/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Patient\",\"mobile\":\"9876543210\",\"abha_id\":\"ABHA001\",\"otp\":\"123456\"}"

# Login as patient
curl -X POST http://localhost:8000/api/v1/patient/login ^
  -H "Content-Type: application/json" ^
  -d "{\"identifier\":\"ABHA001\",\"otp\":\"123456\"}"

# Register a doctor
curl -X POST http://localhost:8000/api/v1/doctor/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Dr. Test\",\"email\":\"doc@test.com\",\"mobile\":\"9111111111\",\"specialization\":\"Cardiology\",\"qualification\":\"MBBS\",\"password\":\"pass123\"}"

# Login as doctor
curl -X POST http://localhost:8000/api/v1/doctor/login ^
  -H "Content-Type: application/json" ^
  -d "{\"identifier\":\"doc@test.com\",\"password\":\"pass123\"}"
```

---

## 📦 Add New Dependencies

```bash
# Add a Python package and save to requirements
cd Backend
pip install <package-name>
pip freeze > requirements.txt

# Add an npm package
cd frontend
npm install <package-name>
```

---

## 🔄 Daily Workflow

```
1.  git pull                          ← get latest code from GitHub
2.  uvicorn main:app --reload         ← start backend server
3.  npm run dev                       ← start frontend
4.  open http://localhost:5173        ← use the app
5.  open http://localhost:8000/admin  ← watch live DB changes
6.  git add . && git commit -m "..."  ← save your changes
7.  git push                          ← upload to GitHub
```

---

## 🔑 Quick Reference

| Item                  | Value                  |
|-----------------------|------------------------|
| Mock OTP              | `123456`               |
| Backend port          | `8000`                 |
| Frontend port         | `5173`                 |
| Database file         | `Backend/medilocker.db`|
| Uploads folder        | `Backend/uploads/`     |
| GitHub repo           | https://github.com/Sandesh-Pandey/MediProject |
