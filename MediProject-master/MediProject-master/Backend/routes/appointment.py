from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from database.db import get_db
from models.appointment import Appointment
from models.doctor import Doctor
from models.hospital import Hospital
from schemas.appointment import AppointmentCreate, AppointmentResponse

router = APIRouter()


def _enrich(appt, db: Session):
    """Add doctor_name and hospital_name to an appointment dict."""
    doc = db.query(Doctor).filter(Doctor.id == appt.doctor_id).first()
    hosp = db.query(Hospital).filter(Hospital.id == appt.hospital_id).first()
    return {
        "id": appt.id,
        "patient_id": appt.patient_id,
        "doctor_id": appt.doctor_id,
        "doctor_name": doc.doctor_name if doc else str(appt.doctor_id),
        "hospital_id": appt.hospital_id,
        "hospital_name": hosp.hospital_name if hosp else str(appt.hospital_id),
        "appointment_date": appt.appointment_date,
        "status": appt.status,
    }


@router.post("/create", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    new_appointment = Appointment(
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        hospital_id=appointment.hospital_id,
        appointment_date=appointment.appointment_date,
        status=appointment.status,
    )
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    return new_appointment


@router.get("/all", status_code=status.HTTP_200_OK)
def get_appointments(
    hospital_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Appointment)
    if hospital_id:
        query = query.filter(Appointment.hospital_id == hospital_id)
    return [_enrich(a, db) for a in query.all()]


@router.put("/update/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(appointment_id: int, appointment: AppointmentCreate, db: Session = Depends(get_db)):
    existing = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    existing.patient_id = appointment.patient_id
    existing.doctor_id = appointment.doctor_id
    existing.hospital_id = appointment.hospital_id
    existing.appointment_date = appointment.appointment_date
    existing.status = appointment.status

    db.commit()
    db.refresh(existing)
    return existing


@router.get("/patient/{abha_id}", status_code=status.HTTP_200_OK)
def get_appointments_by_patient(abha_id: str, db: Session = Depends(get_db)):
    appointments = db.query(Appointment).filter(Appointment.patient_id == abha_id).all()
    return [_enrich(a, db) for a in appointments]
