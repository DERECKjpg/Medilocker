from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from database.db import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, nullable=False)
    doctor_id = Column(Integer, nullable=False)
    hospital_id = Column(Integer, nullable=False)
    appointment_date = Column(String, nullable=False)
    status = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
