from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from database.db import Base


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, nullable=False, index=True)   # ABHA ID
    patient_name = Column(String, nullable=False)
    doctor_id = Column(Integer, nullable=False, index=True)   # DoctorUser.id
    doctor_name = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    upload_date = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
