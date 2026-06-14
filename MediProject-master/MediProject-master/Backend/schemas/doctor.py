from pydantic import BaseModel


class DoctorCreate(BaseModel):
    hospital_id: int
    doctor_name: str
    specialization: str
    qualification: str
    contact_number: str


class DoctorResponse(BaseModel):
    id: int
    hospital_id: int
    doctor_name: str
    specialization: str
    qualification: str
    contact_number: str

    class Config:
        from_attributes = True
