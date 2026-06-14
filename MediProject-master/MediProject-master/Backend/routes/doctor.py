from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from database.db import get_db
from models.doctor import Doctor
from models.doctor_user import DoctorUser
from schemas.doctor import DoctorCreate, DoctorResponse
from utils.auth_deps import get_current_user

router = APIRouter()


@router.post("/add", response_model=DoctorResponse, status_code=status.HTTP_201_CREATED)
def add_doctor(doctor: DoctorCreate, db: Session = Depends(get_db)):
    new_doctor = Doctor(
        hospital_id=doctor.hospital_id,
        doctor_name=doctor.doctor_name,
        specialization=doctor.specialization,
        qualification=doctor.qualification,
        contact_number=doctor.contact_number,
    )
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)
    return new_doctor


@router.get("/all", response_model=list[DoctorResponse], status_code=status.HTTP_200_OK)
def get_doctors(
    hospital_id: Optional[int] = Query(None, description="Filter by hospital"),
    db: Session = Depends(get_db),
):
    query = db.query(Doctor)
    if hospital_id is not None:
        query = query.filter(Doctor.hospital_id == hospital_id)
    return query.all()


@router.put("/update/{doctor_id}", response_model=DoctorResponse)
def update_doctor(doctor_id: int, doctor: DoctorCreate, db: Session = Depends(get_db)):
    existing = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    existing.hospital_id = doctor.hospital_id
    existing.doctor_name = doctor.doctor_name
    existing.specialization = doctor.specialization
    existing.qualification = doctor.qualification
    existing.contact_number = doctor.contact_number

    db.commit()
    db.refresh(existing)
    return existing


@router.delete("/delete/{doctor_id}", status_code=status.HTTP_200_OK)
def delete_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    db.delete(doctor)
    db.commit()
    return {"status": "success", "message": "Doctor deleted successfully"}


# ── DoctorUser list (for patient reminder targeting) ───────────────────────────
@router.get("/users/all", status_code=status.HTTP_200_OK)
def get_doctor_users(db: Session = Depends(get_db)):
    """Return all self-registered DoctorUser accounts (for patient reminder targeting)."""
    doctors = db.query(DoctorUser).all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "specialization": d.specialization,
            "qualification": d.qualification,
        }
        for d in doctors
    ]
