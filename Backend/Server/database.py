from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Create a local SQLite database file named 'sql_app.db'
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# connect_args={"check_same_thread": False} is strictly required for SQLite.
# FastAPI can handle requests across multiple threads concurrently.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class used to create our database models
Base = declarative_base()

# Dependency provider to open/close database sessions per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
