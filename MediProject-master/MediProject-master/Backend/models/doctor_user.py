from sqlalchemy import Column, Integer, String

from database.db import Base


class DoctorUser(Base):
    __tablename__ = "doctor_users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    mobile = Column(String, nullable=False, unique=True, index=True)
    specialization = Column(String, nullable=False)
    qualification = Column(String, nullable=False)
    password = Column(String, nullable=False)
