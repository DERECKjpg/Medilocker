from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional


class DocumentCreate(BaseModel):
    patient_id: str = Field(..., min_length=1, description="Patient ABHA/ID number")
    patient_name: str = Field(..., min_length=1, description="Patient full name")
    hospital_id: int = Field(..., description="Hospital database ID")
    doctor_id: Optional[int] = Field(None, description="Doctor database ID")
    doctor_name: Optional[str] = Field(None, description="Doctor name")
    hospital_name: str = Field(..., min_length=1, description="Hospital name")
    document_type: str = Field(..., min_length=1, description="Type of document (e.g., Prescription, Report)")
    file_name: str = Field(..., min_length=1, description="Original file name")
    upload_date: str = Field(..., description="Upload date in YYYY-MM-DD format")

    @validator("patient_id")
    def validate_patient_id(cls, v):
        if not v or not v.strip():
            raise ValueError("Patient ID cannot be empty")
        return v.strip()

    @validator("patient_name")
    def validate_patient_name(cls, v):
        if not v or not v.strip():
            raise ValueError("Patient name cannot be empty")
        return v.strip()

    @validator("hospital_name")
    def validate_hospital_name(cls, v):
        if not v or not v.strip():
            raise ValueError("Hospital name cannot be empty")
        return v.strip()

    @validator("document_type")
    def validate_document_type(cls, v):
        if not v or not v.strip():
            raise ValueError("Document type cannot be empty")
        return v.strip()

    @validator("file_name")
    def validate_file_name(cls, v):
        if not v or not v.strip():
            raise ValueError("File name cannot be empty")
        return v.strip()

    @validator("upload_date")
    def validate_upload_date(cls, v):
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError("Upload date must be in YYYY-MM-DD format")

    class Config:
        schema_extra = {
            "example": {
                "patient_id": "ABHA123",
                "patient_name": "Gulshan",
                "hospital_id": 1,
                "doctor_id": 1,
                "doctor_name": "Dr Sharma",
                "hospital_name": "AIIMS",
                "document_type": "Prescription",
                "file_name": "prescription.pdf",
                "upload_date": "2026-05-31"
            }
        }


class DocumentResponse(BaseModel):
    id: int
    patient_id: str
    hospital_id: int
    doctor_id: Optional[int]
    patient_name: str
    doctor_name: Optional[str]
    hospital_name: str
    document_type: str
    file_name: str
    file_path: str
    upload_date: str

    class Config:
        from_attributes = True
