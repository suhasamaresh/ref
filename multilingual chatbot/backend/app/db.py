from __future__ import annotations

from typing import Generator
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


# Default to localhost for local development, but allow override via DATABASE_URL
# This works for both Docker (db:5432) and local development (localhost:5432)
default_db = "postgresql+psycopg2://postgres:postgres@localhost:5432/refugee_ai"
DATABASE_URL = os.getenv("DATABASE_URL", default_db)

# Create engine with lazy connection - won't fail on startup if DB is not available
# pool_pre_ping=True will test connections before using them
engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args={"connect_timeout": 10})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db_session() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

