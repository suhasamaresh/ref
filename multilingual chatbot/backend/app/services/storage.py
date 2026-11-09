"""
File storage service for handling audio file uploads.
"""

import os
import uuid
from pathlib import Path
from typing import Optional
import aiofiles
from fastapi import UploadFile, HTTPException

# Configuration
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "uploads/audio"))
MAX_FILE_SIZE = int(os.getenv("MAX_AUDIO_FILE_SIZE_MB", "25")) * 1024 * 1024  # 25MB default
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac", ".webm", ".caf"}

# Create upload directory if it doesn't exist (with error handling)
try:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    # Directory creation might fail in some environments, that's okay
    pass


def get_file_extension(filename: str) -> str:
    """Get file extension from filename."""
    return Path(filename).suffix.lower()


def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS


async def save_audio_file(file: UploadFile, user_id: Optional[str] = None) -> dict:
    """
    Save uploaded audio file and return file info.
    
    Args:
        file: Uploaded file object
        user_id: Optional user ID for organizing files
        
    Returns:
        Dict containing file_path, file_url, filename, and size
        
    Raises:
        HTTPException: If file is invalid or too large
    """
    # Validate file extension
    if not is_allowed_file(file.filename or ""):
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    extension = get_file_extension(file.filename or "")
    filename = f"{file_id}{extension}"
    
    # Create user-specific directory if user_id provided
    if user_id:
        user_dir = UPLOAD_DIR / user_id
        user_dir.mkdir(parents=True, exist_ok=True)
        file_path = user_dir / filename
    else:
        file_path = UPLOAD_DIR / filename
    
    # Read file in chunks to check size and save
    file_size = 0
    chunk_size = 1024 * 1024  # 1MB chunks
    
    async with aiofiles.open(file_path, 'wb') as f:
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            
            file_size += len(chunk)
            if file_size > MAX_FILE_SIZE:
                # Clean up partial file
                if file_path.exists():
                    file_path.unlink()
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024):.0f}MB"
                )
            
            await f.write(chunk)
    
    # Generate URL path (assuming files are served statically)
    if user_id:
        file_url = f"/uploads/audio/{user_id}/{filename}"
    else:
        file_url = f"/uploads/audio/{filename}"
    
    return {
        "file_path": str(file_path),
        "file_url": file_url,
        "filename": filename,
        "size": file_size,
        "content_type": file.content_type
    }


def delete_audio_file(file_path: str) -> bool:
    """
    Delete an audio file.
    
    Args:
        file_path: Path to file to delete
        
    Returns:
        True if file was deleted, False if not found
    """
    try:
        path = Path(file_path)
        if path.exists():
            path.unlink()
            return True
        return False
    except Exception:
        return False

