# MediLocker

A full-stack digital health records platform built with **FastAPI** (Python) and **React** (Vite).

## Features

- **Patient Portal** — View prescriptions, documents, appointments, reminders, medical history timeline
- **Doctor Portal** — Issue digital prescriptions, receive patient notifications, look up registered patients
- **Hospital Portal** — Manage doctors, upload documents, schedule appointments

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | FastAPI, SQLAlchemy, SQLite, JWT    |
| Frontend  | React 18, Vite, React Router v6    |
| Auth      | JWT (python-jose), bcrypt           |
| Storage   | Local filesystem (uploads/)         |

## Project Structure

```
MediLocker/
├── Backend/
│   ├── main.py
│   ├── database/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── utils/
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── services/
    ├── index.html
    └── package.json
```

## Getting Started

### Backend

```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`  
DB viewer at `http://localhost:8000/admin`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Environment

Copy `.env.example` to `.env` and set your secret key:

```
SECRET_KEY=your-secret-key-here
```

> **Note:** The mock OTP is `123456` for development.
