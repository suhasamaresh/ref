"""
Free TTS service for Indian languages using Google Translate TTS API (free).
Supports: Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali and more.
"""

import httpx
from typing import Optional
import tempfile
import os
import uuid
import shutil
from pathlib import Path


class IndianTTSService:
    """Free TTS service for Indian regional languages."""
    
    def __init__(self):
        self.supported_languages = {
            'hi': 'hi',  # Hindi
            'te': 'te',  # Telugu
            'ta': 'ta',  # Tamil
            'kn': 'kn',  # Kannada
            'ml': 'ml',  # Malayalam
            'bn': 'bn',  # Bengali
            'en': 'en',  # English
            'ar': 'ar',  # Arabic
            'es': 'es',  # Spanish
            'fr': 'fr',  # French
        }
    
    async def text_to_speech(self, text: str, language: str) -> dict:
        """
        Convert text to speech using Google Translate TTS (free).
        
        Args:
            text: Text to convert
            language: Language code (hi, te, ta, kn, ml, bn, etc.)
            
        Returns:
            Dict with audio_url or base64 data
        """
        if not text:
            return {"error": "No text provided", "audio_url": ""}
        
        lang_code = self.supported_languages.get(language, language or 'en')
        
        try:
            # Google Translate TTS endpoint (free, no API key needed)
            tts_url = "https://translate.google.com/translate_tts"
            
            params = {
                "ie": "UTF-8",
                "q": text,
                "tl": lang_code,  # Target language
                "client": "tw-ob",  # Client identifier
                "total": "1",
                "idx": "0"
            }
            
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(tts_url, params=params, headers=headers)
                
                if response.status_code == 200:
                    # Save audio to temporary file first
                    audio_data = response.content
                    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp3')
                    temp_file.write(audio_data)
                    temp_file.close()
                    
                    # Create uploads/tts directory relative to backend directory
                    backend_dir = Path(__file__).parent.parent.parent
                    tts_dir = backend_dir / "uploads" / "tts"
                    tts_dir.mkdir(parents=True, exist_ok=True)
                    
                    # Generate unique filename
                    filename = f"{uuid.uuid4()}.mp3"
                    final_path = tts_dir / filename
                    
                    # Move file to proper location
                    shutil.move(temp_file.name, str(final_path))
                    
                    # Generate URL (relative to static mount)
                    base_url = os.getenv("BASE_URL", "http://localhost:8000")
                    file_url = f"/uploads/tts/{filename}"
                    full_url = f"{base_url}{file_url}"
                    
                    return {
                        "audio_url": full_url,
                        "language": lang_code,
                        "success": True,
                        "method": "google_tts"
                    }
                else:
                    return {
                        "error": f"TTS service returned status {response.status_code}",
                        "audio_url": "",
                        "success": False
                    }
                    
        except Exception as e:
            return {
                "error": f"TTS error: {str(e)}",
                "audio_url": "",
                "success": False
            }


# Global instance
indian_tts = IndianTTSService()

