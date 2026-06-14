"""
Medical History — aggregates prescriptions, documents, and appointments
for a patient in reverse chronological order.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.db import get_db
from models.prescription import Prescription
from models.document import Document
from models.appointment import Appointment
from models.doctor import Doctor
from models.hospital import Hospital
from utils.auth_deps import get_current_user

router = APIRouter()


@router.get("/{patient_id}", status_code=status.HTTP_200_OK)
def get_medical_history(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Return a unified, time-sorted medical timeline for a patient."""
    role = current_user.get("role")
    # Patients can only see their own history; doctors can see any patient they
    # have a prescription for
    if role == "patient" and current_user.get("sub") != patient_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    events = []

    # ── Prescriptions ──────────────────────────────────────────────────────
    prescriptions = db.query(Prescription).filter(Prescription.patient_id == patient_id).all()
    for p in prescriptions:
        events.append({
            "event_type": "prescription",
            "date": p.upload_date,
            "title": f"Prescription – Dr. {p.doctor_name}",
            "description": p.notes or "No notes",
            "doctor_name": p.doctor_name,
            "hospital_name": None,
            "file_path": p.file_path,
            "file_name": p.file_name,
            "id": p.id,
            "created_at": p.created_at.isoformat() if p.created_at else p.upload_date,
        })

    # ── Documents ──────────────────────────────────────────────────────────
    documents = db.query(Document).filter(Document.patient_id == patient_id).all()
    for d in documents:
        events.append({
            "event_type": "document",
            "date": d.upload_date,
            "title": f"{d.document_type} – {d.hospital_name}",
            "description": f"Uploaded by {d.hospital_name}" + (f" / Dr. {d.doctor_name}" if d.doctor_name else ""),
            "doctor_name": d.doctor_name,
            "hospital_name": d.hospital_name,
            "file_path": d.file_path,
            "file_name": d.file_name,
            "id": d.id,
            "created_at": d.created_at.isoformat() if d.created_at else d.upload_date,
        })

    # ── Appointments ───────────────────────────────────────────────────────
    appointments = db.query(Appointment).filter(Appointment.patient_id == patient_id).all()
    for a in appointments:
        doc  = db.query(Doctor).filter(Doctor.id == a.doctor_id).first()
        hosp = db.query(Hospital).filter(Hospital.id == a.hospital_id).first()
        events.append({
            "event_type": "appointment",
            "date": a.appointment_date,
            "title": f"Appointment – {hosp.hospital_name if hosp else 'Unknown'}",
            "description": f"Dr. {doc.doctor_name if doc else a.doctor_id} · Status: {a.status}",
            "doctor_name": doc.doctor_name if doc else None,
            "hospital_name": hosp.hospital_name if hosp else None,
            "file_path": None,
            "file_name": None,
            "id": a.id,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else a.appointment_date,
        })

    # Sort by date descending (latest first)
    events.sort(key=lambda e: e.get("created_at") or e.get("date") or "", reverse=True)

    return {
        "patient_id": patient_id,
        "total_events": len(events),
        "timeline": events,
    }
