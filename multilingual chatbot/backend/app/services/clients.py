from __future__ import annotations

import os
from typing import Optional
import redis

try:
    from pinecone import Pinecone
except Exception:  # pragma: no cover
    Pinecone = None  # type: ignore


def get_redis_client() -> redis.Redis:
    url = os.getenv("REDIS_URL", "redis://redis:6379/0")
    return redis.from_url(url)


def get_pinecone_client() -> Optional["Pinecone"]:
    api_key = os.getenv("PINECONE_API_KEY")
    if not api_key or Pinecone is None:
        return None
    return Pinecone(api_key=api_key)

