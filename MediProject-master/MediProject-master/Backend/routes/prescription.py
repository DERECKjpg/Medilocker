"""
Doctor-side prescription upload and patient-side retrieval.
"""
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import uuid

from database.db import get_db
from models.prescription import Prescription
from models.doctor_user import DoctorUser
from models.patient import Patient
from utils.auth_deps import get_current_user

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads" / "prescriptions"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ── Doctor: upload a prescription ──────────────────────────────────────────────
@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_prescription(
    patient_id: str = Form(..., description="Patient ABHA ID"),
    patient_name: str = Form(...),
    notes: str = Form(""),
    upload_date: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "doctor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only doctors can upload prescriptions")

    doctor_id = current_user.get("doctor_id")
    doctor = db.query(DoctorUser).filter(DoctorUser.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    # Unique filename to avoid collisions
    ext = Path(file.filename).suffix
    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest_dir = UPLOAD_DIR / str(doctor_id)
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / unique_name

    with dest_path.open("wb") as buf:
        shutil.copyfileobj(file.file, buf)

    rel_path = dest_path.relative_to(Path(__file__).resolve().parents[1]).as_posix()

    prescription = Prescription(
        patient_id=patient_id.strip(),
        patient_name=patient_name.strip(),
        doctor_id=doctor_id,
        doctor_name=doctor.name,
        notes=notes,
        file_name=file.filename,
        file_path=rel_path,
        upload_date=upload_date,
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    return {
        "status": "success",
        "message": "Prescription uploaded successfully",
        "prescription_id": prescription.id,
    }


# ── Doctor: list prescriptions they uploaded ───────────────────────────────────
@router.get("/doctor/mine", status_code=status.HTTP_200_OK)
def get_my_prescriptions(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") != "doctor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only doctors can access this")

    doctor_id = current_user.get("doctor_id")
    prescriptions = db.query(Prescription).filter(Prescription.doctor_id == doctor_id).order_by(Prescription.id.desc()).all()
    return _serialize_list(prescriptions)


# ── Patient: list prescriptions sent to them ───────────────────────────────────
@router.get("/patient/{patient_id}", status_code=status.HTTP_200_OK)
def get_patient_prescriptions(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # Patient can only see their own; doctor can see their uploads
    role = current_user.get("role")
    if role == "patient" and current_user.get("sub") != patient_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot view another patient's prescriptions")

    prescriptions = (
        db.query(Prescription)
        .filter(Prescription.patient_id == patient_id)
        .order_by(Prescription.id.desc())
        .all()
    )
    return _serialize_list(prescriptions)


# ── Download ────────────────────────────────────────────────────────────────────
@router.get("/download/{prescription_id}", response_class=FileResponse)
def download_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")

    # Auth check: only the patient it belongs to or the doctor who wrote it
    role = current_user.get("role")
    if role == "patient" and current_user.get("sub") != prescription.patient_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if role == "doctor" and current_user.get("doctor_id") != prescription.doctor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    abs_path = Path(__file__).resolve().parents[1] / prescription.file_path
    if not abs_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File missing on server")
    return FileResponse(abs_path, filename=prescription.file_name)


# ── helpers ─────────────────────────────────────────────────────────────────────
def _serialize_list(items):
    return [
        {
            "id": p.id,
            "patient_id": p.patient_id,
            "patient_name": p.patient_name,
            "doctor_id": p.doctor_id,
            "doctor_name": p.doctor_name,
            "notes": p.notes,
            "file_name": p.file_name,
            "file_path": p.file_path,
            "upload_date": p.upload_date,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in items
    ]
