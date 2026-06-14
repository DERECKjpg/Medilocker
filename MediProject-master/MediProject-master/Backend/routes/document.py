from fastapi import APIRouter, Depends, HTTPException, File, Form, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pathlib import Path
import shutil
from typing import Optional

from database.db import get_db
from models.document import Document

router = APIRouter()
UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    patient_id: str = Form(...),
    patient_name: str = Form(...),
    hospital_id: int = Form(...),
    hospital_name: str = Form(...),
    document_type: str = Form(...),
    upload_date: str = Form(...),
    doctor_id: Optional[int] = Form(None),
    doctor_name: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        dest_dir = UPLOAD_DIR / str(hospital_id)
        dest_dir.mkdir(parents=True, exist_ok=True)
        file_path = dest_dir / file.filename

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        document = Document(
            patient_id=patient_id,
            hospital_id=hospital_id,
            doctor_id=doctor_id,
            patient_name=patient_name,
            doctor_name=doctor_name,
            hospital_name=hospital_name,
            document_type=document_type,
            file_name=file.filename,
            file_path=file_path.relative_to(Path(__file__).resolve().parents[1]).as_posix(),
            upload_date=upload_date,
        )
        db.add(document)
        db.commit()
        db.refresh(document)

        return {
            "status": "success",
            "message": "Document uploaded successfully",
            "document_id": document.id,
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Database error: {e}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error uploading document: {e}")


@router.get("/patient/{patient_id}", status_code=status.HTTP_200_OK)
def get_patient_documents(patient_id: str, db: Session = Depends(get_db)):
    if not patient_id or not patient_id.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient ID cannot be empty")

    documents = db.query(Document).filter(Document.patient_id == patient_id.strip()).all()
    return {
        "status": "success",
        "patient_id": patient_id,
        "document_count": len(documents),
        "documents": [
            {
                "id": doc.id,
                "patient_id": doc.patient_id,
                "hospital_id": doc.hospital_id,
                "doctor_id": doc.doctor_id,
                "patient_name": doc.patient_name,
                "doctor_name": doc.doctor_name,
                "hospital_name": doc.hospital_name,
                "document_type": doc.document_type,
                "file_name": doc.file_name,
                "file_path": doc.file_path,
                "upload_date": doc.upload_date,
                "created_at": doc.created_at.isoformat() if doc.created_at else None,
            }
            for doc in documents
        ],
    }


@router.get("/hospital/{hospital_id}", status_code=status.HTTP_200_OK)
def get_hospital_documents(hospital_id: int, db: Session = Depends(get_db)):
    documents = db.query(Document).filter(Document.hospital_id == hospital_id).all()
    return {
        "status": "success",
        "hospital_id": hospital_id,
        "document_count": len(documents),
        "documents": [
            {
                "id": doc.id,
                "patient_id": doc.patient_id,
                "hospital_id": doc.hospital_id,
                "doctor_id": doc.doctor_id,
                "patient_name": doc.patient_name,
                "doctor_name": doc.doctor_name,
                "hospital_name": doc.hospital_name,
                "document_type": doc.document_type,
                "file_name": doc.file_name,
                "file_path": doc.file_path,
                "upload_date": doc.upload_date,
                "created_at": doc.created_at.isoformat() if doc.created_at else None,
            }
            for doc in documents
        ],
    }


@router.get("/download/{document_id}", response_class=FileResponse)
def download_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    absolute_path = Path(__file__).resolve().parents[1] / document.file_path
    if not absolute_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File missing on server")
    return absolute_path
