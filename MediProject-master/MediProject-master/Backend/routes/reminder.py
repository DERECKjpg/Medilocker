"""
Reminders: patients set them; when a reminder targets a doctor it auto-creates
a Notification for that doctor.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database.db import get_db
from models.reminder import Reminder
from models.notification import Notification
from models.patient import Patient
from utils.auth_deps import get_current_user

router = APIRouter()


# ── Schemas ─────────────────────────────────────────────────────────────────────
class ReminderCreate(BaseModel):
    title: str
    message: str
    remind_at: str          # ISO datetime string, e.g. "2026-06-10T09:00"
    doctor_id: Optional[int] = None   # if set, doctor gets a notification


class ReminderResponse(BaseModel):
    id: int
    patient_id: str
    patient_name: str
    doctor_id: Optional[int]
    title: str
    message: str
    remind_at: str
    is_notified: bool

    class Config:
        from_attributes = True


# ── Patient: create a reminder ──────────────────────────────────────────────────
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_reminder(
    payload: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "patient":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patients can create reminders")

    abha_id = current_user.get("sub")
    patient = db.query(Patient).filter(Patient.abha_id == abha_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    reminder = Reminder(
        patient_id=abha_id,
        patient_name=patient.name,
        doctor_id=payload.doctor_id,
        title=payload.title,
        message=payload.message,
        remind_at=payload.remind_at,
        is_notified=False,
    )
    db.add(reminder)
    db.flush()  # get reminder.id before committing

    # If a doctor is targeted, immediately create a notification for that doctor
    if payload.doctor_id:
        notif = Notification(
            doctor_id=payload.doctor_id,
            patient_id=abha_id,
            patient_name=patient.name,
            title=f"Reminder from {patient.name}",
            message=f"{payload.title}: {payload.message} (scheduled: {payload.remind_at})",
            is_read=False,
        )
        db.add(notif)
        reminder.is_notified = True

    db.commit()
    db.refresh(reminder)

    return {
        "status": "success",
        "message": "Reminder created",
        "reminder_id": reminder.id,
        "doctor_notified": reminder.is_notified,
    }


# ── Patient: list own reminders ─────────────────────────────────────────────────
@router.get("/mine", status_code=status.HTTP_200_OK)
def get_my_reminders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "patient":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patients can view reminders")

    abha_id = current_user.get("sub")
    reminders = (
        db.query(Reminder)
        .filter(Reminder.patient_id == abha_id)
        .order_by(Reminder.id.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "title": r.title,
            "message": r.message,
            "remind_at": r.remind_at,
            "doctor_id": r.doctor_id,
            "is_notified": r.is_notified,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in reminders
    ]


# ── Patient: delete a reminder ──────────────────────────────────────────────────
@router.delete("/{reminder_id}", status_code=status.HTTP_200_OK)
def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "patient":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patients can delete reminders")

    abha_id = current_user.get("sub")
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.patient_id == abha_id).first()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    db.delete(reminder)
    db.commit()
    return {"status": "success", "message": "Reminder deleted"}
