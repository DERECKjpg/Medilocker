from pydantic import BaseModel


class AppointmentCreate(BaseModel):
    patient_id: str
    doctor_id: int
    hospital_id: int
    appointment_date: str
    status: str


class AppointmentResponse(BaseModel):
    id: int
    patient_id: str
    doctor_id: int
    hospital_id: int
    appointment_date: str
    status: str

    class Config:
        from_attributes = True
