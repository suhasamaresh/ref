from __future__ import annotations

import os
import uuid
from typing import List

from sqlalchemy.orm import Session

from .db import SessionLocal, engine
from .models import Base, Document
from sqlalchemy import text as sa_text


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def ingest_texts(texts: List[str], language: str = "en", source: str = "upload") -> int:
    session: Session = SessionLocal()
    try:
        count = 0
        for content in texts:
            doc = Document(
                id=str(uuid.uuid4()),
                title=content[:80],
                language=language,
                source=source,
                content=content,
            )
            session.add(doc)
            count += 1
        session.commit()
        return count
    finally:
        session.close()


if __name__ == "__main__":
    init_db()
    sample_texts = [
        "Refugee rights include access to shelter, food, and legal assistance.",
        "Emergency numbers: Police 112, Ambulance 112, Fire 112.",
    ]
    n = ingest_texts(sample_texts, language="en")
    print(f"Ingested {n} documents")

