from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database.db import Base, engine

# ── models (must be imported before create_all) ──────────────────────────────
from models.patient import Patient
from models.hospital import Hospital
from models.doctor import Doctor
from models.doctor_user import DoctorUser
from models.appointment import Appointment
from models.document import Document
from models.prescription import Prescription
from models.reminder import Reminder
from models.notification import Notification

# ── routes ────────────────────────────────────────────────────────────────────
from routes.auth import router as auth_router
from routes.doctor import router as doctor_router
from routes.appointment import router as appointment_router
from routes.document import router as document_router
from routes.prescription import router as prescription_router
from routes.reminder import router as reminder_router
from routes.notification import router as notification_router
from routes.medical_history import router as history_router
from routes.admin import router as admin_router

# Initialize database tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(
    title="MediLocker API",
    description="Medical document management system",
    version="2.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/", tags=["Health"])
def health_check():
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "message": "MediLocker API is running",
            "version": "2.0.0",
        },
    )


PREFIX = "/api/v1"

app.include_router(auth_router,         prefix=f"{PREFIX}",                 tags=["Authentication"])
app.include_router(doctor_router,       prefix=f"{PREFIX}/doctor",          tags=["Doctors"])
app.include_router(appointment_router,  prefix=f"{PREFIX}/appointment",     tags=["Appointments"])
app.include_router(document_router,     prefix=f"{PREFIX}/documents",       tags=["Documents"])
app.include_router(prescription_router, prefix=f"{PREFIX}/prescriptions",   tags=["Prescriptions"])
app.include_router(reminder_router,     prefix=f"{PREFIX}/reminders",       tags=["Reminders"])
app.include_router(notification_router, prefix=f"{PREFIX}/notifications",   tags=["Notifications"])
app.include_router(history_router,      prefix=f"{PREFIX}/history",         tags=["Medical History"])
app.include_router(admin_router,        tags=["Admin"])
