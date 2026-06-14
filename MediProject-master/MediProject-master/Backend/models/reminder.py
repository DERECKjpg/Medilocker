from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from database.db import Base


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, nullable=False, index=True)   # ABHA ID
    patient_name = Column(String, nullable=False)
    doctor_id = Column(Integer, nullable=True, index=True)    # DoctorUser.id  (optional target)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    remind_at = Column(String, nullable=False)                # ISO datetime string
    is_notified = Column(Boolean, default=False)              # sent to doctor?
    created_at = Column(DateTime(timezone=True), server_default=func.now())
