from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from database.db import get_db
from models.patient import Patient
from models.hospital import Hospital
from models.doctor_user import DoctorUser
from schemas.auth import (
    PatientSignupRequest,
    PatientLoginRequest,
    DoctorSignupRequest,
    DoctorLoginRequest,
    HospitalSignupRequest,
    HospitalLoginRequest,
    TokenResponse,
)
from utils.security import get_password_hash, verify_password, create_access_token
from utils.auth_deps import get_current_user

router = APIRouter()

MOCK_OTP = "123456"


# ─── Patient ────────────────────────────────────────────────────────────────

@router.post("/patient/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def patient_signup(request: PatientSignupRequest, db: Session = Depends(get_db)):
    if request.otp != MOCK_OTP:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")

    existing = db.query(Patient).filter(
        (Patient.abha_id == request.abha_id) | (Patient.mobile == request.mobile)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient already exists")

    hashed_password = get_password_hash(request.password) if request.password else None
    patient = Patient(
        name=request.name,
        mobile=request.mobile,
        abha_id=request.abha_id,
        password=hashed_password,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    token = create_access_token({"sub": patient.abha_id, "role": "patient"})
    # Return abha_id so the frontend can store it directly
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "patient",
        "abha_id": patient.abha_id,
    }


@router.post("/patient/login", response_model=TokenResponse)
def patient_login(request: PatientLoginRequest, db: Session = Depends(get_db)):
    if not request.otp and not request.password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP or password required")

    patient = db.query(Patient).filter(
        (Patient.abha_id == request.identifier) | (Patient.mobile == request.identifier)
    ).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    if request.password:
        if not patient.password or not verify_password(request.password, patient.password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    elif request.otp != MOCK_OTP:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP")

    token = create_access_token({"sub": patient.abha_id, "role": "patient"})
    # Always return abha_id so the frontend stores the canonical identifier
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "patient",
        "abha_id": patient.abha_id,
    }


@router.get("/patient/profile/{identifier}", response_model=dict)
def get_patient_profile(identifier: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(
        (Patient.abha_id == identifier) | (Patient.mobile == identifier)
    ).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return _patient_dict(patient)


# Patient lookup by ABHA ID — used by doctors before writing a prescription
@router.get("/patient/lookup/{abha_id}", response_model=dict)
def lookup_patient(abha_id: str, db: Session = Depends(get_db),
                   current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "doctor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only doctors can look up patients")
    patient = db.query(Patient).filter(Patient.abha_id == abha_id.strip()).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="No registered patient found with that ABHA ID")
    return {"id": patient.id, "name": patient.name, "abha_id": patient.abha_id, "mobile": patient.mobile}


class PatientProfileUpdate(BaseModel):
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    emergency_contact: Optional[str] = None


@router.patch("/patient/profile/update", response_model=dict)
def update_patient_profile(
    payload: PatientProfileUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "patient":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patients can update their profile")

    abha_id = current_user.get("sub")
    patient = db.query(Patient).filter(Patient.abha_id == abha_id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    if payload.blood_group is not None:
        patient.blood_group = payload.blood_group
    if payload.allergies is not None:
        patient.allergies = payload.allergies
    if payload.chronic_conditions is not None:
        patient.chronic_conditions = payload.chronic_conditions
    if payload.emergency_contact is not None:
        patient.emergency_contact = payload.emergency_contact

    db.commit()
    db.refresh(patient)
    return _patient_dict(patient)


# ─── Doctor ──────────────────────────────────────────────────────────────────

@router.post("/doctor/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def doctor_signup(request: DoctorSignupRequest, db: Session = Depends(get_db)):
    existing = db.query(DoctorUser).filter(
        (DoctorUser.email == request.email) | (DoctorUser.mobile == request.mobile)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Doctor already exists")

    doctor = DoctorUser(
        name=request.name,
        email=request.email,
        mobile=request.mobile,
        specialization=request.specialization,
        qualification=request.qualification,
        password=get_password_hash(request.password),
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    token = create_access_token({"sub": doctor.email, "role": "doctor", "doctor_id": doctor.id})
    return {"access_token": token, "token_type": "bearer", "role": "doctor", "doctor_id": doctor.id}


@router.post("/doctor/login", response_model=TokenResponse)
def doctor_login(request: DoctorLoginRequest, db: Session = Depends(get_db)):
    doctor = db.query(DoctorUser).filter(
        (DoctorUser.email == request.identifier) | (DoctorUser.mobile == request.identifier)
    ).first()
    if not doctor or not verify_password(request.password, doctor.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid doctor credentials")

    token = create_access_token({"sub": doctor.email, "role": "doctor", "doctor_id": doctor.id})
    return {"access_token": token, "token_type": "bearer", "role": "doctor", "doctor_id": doctor.id}


@router.get("/doctor/profile/{identifier}", response_model=dict)
def get_doctor_profile(identifier: str, db: Session = Depends(get_db)):
    doctor = db.query(DoctorUser).filter(
        (DoctorUser.email == identifier) | (DoctorUser.mobile == identifier)
    ).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return {
        "id": doctor.id,
        "name": doctor.name,
        "email": doctor.email,
        "mobile": doctor.mobile,
        "specialization": doctor.specialization,
        "qualification": doctor.qualification,
    }


# ─── Hospital ────────────────────────────────────────────────────────────────

@router.post("/hospital/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def hospital_signup(request: HospitalSignupRequest, db: Session = Depends(get_db)):
    existing = db.query(Hospital).filter(Hospital.email == request.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hospital already exists")

    hospital = Hospital(
        hospital_name=request.hospital_name,
        address=request.address,
        email=request.email,
        mobile=request.mobile,
        password=get_password_hash(request.password),
    )
    db.add(hospital)
    db.commit()
    db.refresh(hospital)

    token = create_access_token({"sub": hospital.email, "role": "hospital", "hospital_id": hospital.id})
    return {"access_token": token, "token_type": "bearer", "role": "hospital", "hospital_id": hospital.id}


@router.post("/hospital/login", response_model=TokenResponse)
def hospital_login(request: HospitalLoginRequest, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.email == request.email).first()
    if not hospital or not verify_password(request.password, hospital.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token({"sub": hospital.email, "role": "hospital", "hospital_id": hospital.id})
    return {"access_token": token, "token_type": "bearer", "role": "hospital", "hospital_id": hospital.id}


# ─── helpers ─────────────────────────────────────────────────────────────────

def _patient_dict(p: Patient) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "mobile": p.mobile,
        "abha_id": p.abha_id,
        "blood_group": p.blood_group,
        "allergies": p.allergies,
        "chronic_conditions": p.chronic_conditions,
        "emergency_contact": p.emergency_contact,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }
