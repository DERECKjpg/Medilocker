from pydantic import BaseModel


class PatientResponse(BaseModel):
    id: int
    name: str
    mobile: str
    abha_id: str

    class Config:
        from_attributes = True
