from database.db import engine, Base
from models.document import Document

Base.metadata.create_all(bind=engine)

print("Tables created")