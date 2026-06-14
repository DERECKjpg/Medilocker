from sqlalchemy import Column, Integer, String

from database.db import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, nullable=False)
    doctor_name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    qualification = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)
