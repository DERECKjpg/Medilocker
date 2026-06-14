from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Optional[str] = None
    hospital_id: Optional[int] = None
    doctor_id: Optional[int] = None
    abha_id: Optional[str] = None


class PatientSignupRequest(BaseModel):
    name: str
    mobile: str
    abha_id: str
    password: Optional[str] = None
    otp: str


class PatientLoginRequest(BaseModel):
    identifier: str = Field(..., description="ABHA ID or mobile number")
    otp: Optional[str] = None
    password: Optional[str] = None


class DoctorSignupRequest(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    specialization: str
    qualification: str
    password: str


class DoctorLoginRequest(BaseModel):
    identifier: str = Field(..., description="Doctor email or mobile number")
    password: str


class HospitalSignupRequest(BaseModel):
    hospital_name: str
    address: str
    email: EmailStr
    mobile: str
    password: str


class HospitalLoginRequest(BaseModel):
    email: EmailStr
    password: str
