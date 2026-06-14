from pydantic import BaseModel, EmailStr


class HospitalResponse(BaseModel):
    id: int
    hospital_name: str
    address: str
    email: EmailStr
    mobile: str

    class Config:
        from_attributes = True
