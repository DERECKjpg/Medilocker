from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from database.db import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, nullable=False)
    hospital_id = Column(Integer, nullable=False)
    doctor_id = Column(Integer, nullable=True)
    patient_name = Column(String, nullable=False)
    doctor_name = Column(String, nullable=True)
    hospital_name = Column(String, nullable=False)
    document_type = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    upload_date = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())