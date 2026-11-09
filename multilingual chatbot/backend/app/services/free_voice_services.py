"""
Free voice processing services using browser APIs and free services.
Handles Speech-to-Text, Text-to-Speech without requiring paid APIs.
"""

import os
import tempfile
from typing import Optional, Dict, Any
import httpx
import aiofiles


class FreeVoiceServices:
    """Handles voice processing operations using free services."""
    
    def __init__(self):
        # Free TTS services
        self.tts_service = "browser"  # Use browser TTS
        self.stt_service = "browser"  # Use browser STT
        
    async def speech_to_text(self, audio_url: str, language: Optional[str] = None) -> Dict[str, Any]:
        """
        Convert speech to text using free services.
        
        Note: This is a placeholder - actual STT should be done in browser
        using Web Speech API before sending to backend.
        
        Args:
            audio_url: URL or path to audio file (not used for browser STT)
            language: Optional language hint
            
        Returns:
            Dict containing transcribed text and detected language
        """
        return {
            "text": "",
            "language": language or "auto",
            "error": "Use browser Web Speech API for free STT. This endpoint is for compatibility only.",
            "note": "For free STT, use browser's SpeechRecognition API in the frontend"
        }
    
    async def text_to_speech(self, text: str, language: Optional[str] = None, voice: Optional[str] = None) -> Dict[str, Any]:
        """
        Convert text to speech using free services.
        
        Note: This returns instructions to use browser TTS instead.
        Actual TTS should be done in browser using SpeechSynthesis API.
        
        Args:
            text: Text to convert to speech
            language: Target language
            voice: Voice type (optional)
            
        Returns:
            Dict containing instructions for browser TTS
        """
        return {
            "audio_url": "",
            "language": language or "auto",
            "voice": voice or "default",
            "success": True,
            "note": "Use browser SpeechSynthesis API for free TTS",
            "text": text,  # Return text so browser can synthesize
            "method": "browser_tts"  # Flag for frontend to use browser TTS
        }
    
    async def translate_text(self, text: str, source_language: Optional[str] = None, target_language: str = "en") -> Dict[str, Any]:
        """
        Translate text using free Google Translate API (unofficial).
        
        Args:
            text: Text to translate
            source_language: Source language (auto-detect if None)
            target_language: Target language
            
        Returns:
            Dict containing translated text and language info
        """
        try:
            # Use free Google Translate API (no key required for basic use)
            # This is a simple implementation - you might want to use a library like googletrans
            translate_url = "https://translate.googleapis.com/translate_a/single"
            
            params = {
                "client": "gtx",
                "sl": source_language or "auto",
                "tl": target_language,
                "dt": "t",
                "q": text
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(translate_url, params=params, timeout=10.0)
                if response.status_code == 200:
                    result = response.json()
                    translated_text = result[0][0][0] if result and len(result) > 0 else text
                    
                    return {
                        "text": translated_text,
                        "source_language": source_language or "auto",
                        "target_language": target_language,
                        "success": True
                    }
                else:
                    # Fallback: return original text
                    return {
                        "text": text,
                        "source_language": source_language or "auto",
                        "target_language": target_language,
                        "success": False,
                        "error": "Translation service unavailable"
                    }
        except Exception as e:
            # Fallback: return original text on error
            return {
                "text": text,
                "source_language": source_language or "auto",
                "target_language": target_language,
                "success": False,
                "error": str(e)
            }


# Global instance
free_voice_services = FreeVoiceServices()

