from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from database.db import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    mobile = Column(String, unique=True, nullable=False)
    abha_id = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    allergies = Column(Text, nullable=True)
    chronic_conditions = Column(Text, nullable=True)
    emergency_contact = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
