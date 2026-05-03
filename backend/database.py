from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base # <-- Adicione esta linha

SQLALCHEMY_DATABASE_URL = "postgresql+pg8000://postgres:satelis@localhost/hockeytown_cwb"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base() # <-- E adicione esta linha no final

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()