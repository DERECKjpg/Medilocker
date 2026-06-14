"""
Notifications for doctors — created automatically when a patient sends a reminder
to a doctor. Doctors can list and mark as read.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.db import get_db
from models.notification import Notification
from utils.auth_deps import get_current_user

router = APIRouter()


# ── Doctor: list their notifications ───────────────────────────────────────────
@router.get("/mine", status_code=status.HTTP_200_OK)
def get_doctor_notifications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "doctor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only doctors can view notifications")

    doctor_id = current_user.get("doctor_id")
    notifications = (
        db.query(Notification)
        .filter(Notification.doctor_id == doctor_id)
        .order_by(Notification.id.desc())
        .all()
    )
    return [
        {
            "id": n.id,
            "patient_id": n.patient_id,
            "patient_name": n.patient_name,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifications
    ]


# ── Doctor: unread count ────────────────────────────────────────────────────────
@router.get("/unread-count", status_code=status.HTTP_200_OK)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "doctor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only doctors can view notifications")

    doctor_id = current_user.get("doctor_id")
    count = db.query(Notification).filter(
        Notification.doctor_id == doctor_id,
        Notification.is_read == False,
    ).count()
    return {"unread_count": count}


# ── Doctor: mark a single notification as read ─────────────────────────────────
@router.patch("/{notification_id}/read", status_code=status.HTTP_200_OK)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "doctor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only doctors can update notifications")

    doctor_id = current_user.get("doctor_id")
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.doctor_id == doctor_id,
    ).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notif.is_read = True
    db.commit()
    return {"status": "success", "message": "Marked as read"}


# ── Doctor: mark all as read ────────────────────────────────────────────────────
@router.patch("/mark-all-read", status_code=status.HTTP_200_OK)
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "doctor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only doctors can update notifications")

    doctor_id = current_user.get("doctor_id")
    db.query(Notification).filter(
        Notification.doctor_id == doctor_id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"status": "success", "message": "All notifications marked as read"}
