"""
Voice processing services using OpenAI Whisper API and other services.
Handles Speech-to-Text, Text-to-Speech, and Translation.
"""

import os
import tempfile
import asyncio
from typing import Optional, Dict, Any
from pathlib import Path
import httpx
from openai import AsyncOpenAI
import aiofiles

# Load .env file if it exists (before reading env vars). Search common locations
try:
    from dotenv import load_dotenv
    def _load_possible_dotenvs():
        backend_dir = Path(__file__).parent.parent.parent
        candidates = [
            backend_dir / '.env',            # backend/.env
            backend_dir.parent / '.env',    # project root .env (parent of backend)
            Path.cwd() / '.env'             # current working directory
        ]
        for p in candidates:
            try:
                if p.exists():
                    # Normalize BOM if present
                    if p.stat().st_size > 0:
                        with open(p, 'r', encoding='utf-8-sig') as f:
                            content = f.read()
                        with open(p, 'w', encoding='utf-8') as f:
                            f.write(content)
                    load_dotenv(p)
                    print(f"[OK] Loaded .env file from: {p}")
                    return p
            except Exception as e:
                print(f"[VoiceServices] ERROR loading .env at {p}: {e}")
        return None

    _load_possible_dotenvs()
except ImportError:
    # python-dotenv not installed; rely on environment variables
    print("[VoiceServices] python-dotenv not installed; relying on environment variables.")

# Initialize OpenAI client (will be None if no API key)
openai_api_key = os.getenv("OPENAI_API_KEY")
openai_client = AsyncOpenAI(api_key=openai_api_key) if openai_api_key else None

# Debug: Log if API key is loaded (only show first few chars for security)
if openai_api_key:
    print(f"[VoiceServices] OpenAI API key loaded: {openai_api_key[:10]}...")
else:
    print("[VoiceServices] WARNING: OPENAI_API_KEY not found!")


class VoiceServices:
    """Handles voice processing operations."""
    
    def __init__(self):
        self.openai_client = openai_client
    
    async def speech_to_text(self, audio_url: str, language: Optional[str] = None) -> Dict[str, Any]:
        """
        Convert speech to text using OpenAI Whisper API.
        
        Args:
            audio_url: URL or path to audio file
            language: Optional language hint (e.g., 'en', 'es', 'fr')
            
        Returns:
            Dict containing transcribed text and detected language
        """
        if not self.openai_client:
            return {
                "text": "",
                "language": language or "auto",
                "error": "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
            }
        
        try:
            # Download audio file if it's a URL
            if audio_url.startswith('http'):
                async with httpx.AsyncClient() as client:
                    response = await client.get(audio_url)
                    audio_data = response.content
            else:
                # Assume it's a file path
                async with aiofiles.open(audio_url, 'rb') as f:
                    audio_data = await f.read()
            
            # Create temporary file for OpenAI API
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                # Transcribe using OpenAI Whisper
                with open(temp_file_path, 'rb') as audio_file:
                    transcript = await self.openai_client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file,
                        language=language,
                        response_format="verbose_json"
                    )
                
                return {
                    "text": transcript.text,
                    "language": transcript.language or language or "auto",
                    "confidence": getattr(transcript, 'confidence', None)
                }
            
            finally:
                # Clean up temporary file
                os.unlink(temp_file_path)
                
        except Exception as e:
            error_msg = str(e)
            
            # Check for specific OpenAI errors
            if "429" in error_msg or "quota" in error_msg.lower() or "insufficient_quota" in error_msg.lower():
                error_msg = "OpenAI API quota exceeded. Please check your billing and plan at https://platform.openai.com/account/billing"
            elif "401" in error_msg or "invalid" in error_msg.lower() and "api" in error_msg.lower():
                error_msg = "Invalid OpenAI API key. Please check your API key in the .env file."
            
            return {
                "text": "",
                "language": language or "auto",
                "error": error_msg
            }
    
    async def text_to_speech(self, text: str, language: Optional[str] = None, voice: Optional[str] = None) -> Dict[str, Any]:
        """
        Convert text to speech using OpenAI TTS API.
        
        Args:
            text: Text to convert to speech
            language: Target language
            voice: Voice type (alloy, echo, fable, onyx, nova, shimmer)
            
        Returns:
            Dict containing audio URL or base64 data
        """
        if not self.openai_client:
            return {
                "audio_url": "",
                "language": language or "auto",
                "voice": voice,
                "error": "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.",
                "success": False
            }
        
        try:
            # Map language to voice if not specified
            if not voice:
                voice = self._get_voice_for_language(language)
            
            # Generate speech using OpenAI TTS
            response = await self.openai_client.audio.speech.create(
                model="tts-1",
                voice=voice,
                input=text
            )
            
            # Save to temporary file and return URL
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
                temp_file.write(response.content)
                temp_file_path = temp_file.name
            
            return {
                "audio_url": f"file://{temp_file_path}",
                "language": language or "auto",
                "voice": voice,
                "success": True
            }
            
        except Exception as e:
            error_msg = str(e)
            
            # Check for specific OpenAI errors
            if "429" in error_msg or "quota" in error_msg.lower() or "insufficient_quota" in error_msg.lower():
                error_msg = "OpenAI API quota exceeded. Please check your billing and plan at https://platform.openai.com/account/billing"
            elif "401" in error_msg or "invalid" in error_msg.lower() and "api" in error_msg.lower():
                error_msg = "Invalid OpenAI API key. Please check your API key in the .env file."
            
            return {
                "audio_url": "",
                "language": language or "auto",
                "voice": voice,
                "error": error_msg,
                "success": False
            }
    
    async def translate_text(self, text: str, source_language: Optional[str] = None, target_language: str = "en") -> Dict[str, Any]:
        """
        Translate text using OpenAI's translation capabilities.
        
        Args:
            text: Text to translate
            source_language: Source language (auto-detect if None)
            target_language: Target language
            
        Returns:
            Dict containing translated text and language info
        """
        if not self.openai_client:
            return {
                "text": text,  # Return original text if no API key
                "source_language": source_language or "auto",
                "target_language": target_language,
                "error": "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.",
                "success": False
            }
        
        try:
            # Use OpenAI for translation
            language_names = {
                'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
                'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian', 'ja': 'Japanese',
                'ko': 'Korean', 'zh': 'Chinese', 'ar': 'Arabic', 'hi': 'Hindi',
                'ur': 'Urdu', 'fa': 'Persian', 'tr': 'Turkish', 'pl': 'Polish'
            }
            
            target_lang_name = language_names.get(target_language, 'English')
            
            prompt = f"Translate the following text to {target_lang_name}. Only return the translated text, nothing else:\n\n{text}"
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.1
            )
            
            translated_text = response.choices[0].message.content.strip()
            
            return {
                "text": translated_text,
                "source_language": source_language or "auto",
                "target_language": target_language,
                "success": True
            }
            
        except Exception as e:
            return {
                "text": text,  # Return original text on error
                "source_language": source_language or "auto",
                "target_language": target_language,
                "error": str(e),
                "success": False
            }
    
    def _get_voice_for_language(self, language: Optional[str]) -> str:
        """Get appropriate voice for given language."""
        if not language:
            return "alloy"  # Default voice
        
        # Map languages to OpenAI voices
        voice_mapping = {
            'en': 'alloy',
            'es': 'nova',
            'fr': 'shimmer',
            'de': 'echo',
            'it': 'fable',
            'pt': 'onyx',
            'ru': 'nova',
            'ja': 'shimmer',
            'ko': 'echo',
            'zh': 'fable',
            'ar': 'onyx',
            'hi': 'nova'
        }
        
        return voice_mapping.get(language.lower(), 'alloy')
    
    async def process_voice_message(self, audio_url: str, target_language: str = "en", 
                                  source_language: Optional[str] = None) -> Dict[str, Any]:
        """
        Complete voice processing pipeline: STT -> Translation -> TTS
        
        Args:
            audio_url: URL or path to audio file
            target_language: Target language for translation and TTS
            source_language: Source language (auto-detect if None)
            
        Returns:
            Dict containing all processing results
        """
        try:
            # Step 1: Speech to Text
            stt_result = await self.speech_to_text(audio_url, source_language)
            
            if not stt_result.get("text"):
                return {
                    "success": False,
                    "error": "Failed to transcribe audio",
                    "stt_result": stt_result
                }
            
            # Step 2: Translate if needed
            detected_language = stt_result.get("language", "auto")
            translation_result = None
            
            if detected_language != target_language:
                translation_result = await self.translate_text(
                    stt_result["text"], 
                    detected_language, 
                    target_language
                )
            
            # Step 3: Text to Speech
            text_for_tts = translation_result["text"] if translation_result else stt_result["text"]
            tts_result = await self.text_to_speech(text_for_tts, target_language)
            
            return {
                "success": True,
                "original_text": stt_result["text"],
                "original_language": detected_language,
                "translated_text": translation_result["text"] if translation_result else stt_result["text"],
                "target_language": target_language,
                "audio_url": tts_result.get("audio_url", ""),
                "voice": tts_result.get("voice", ""),
                "stt_result": stt_result,
                "translation_result": translation_result,
                "tts_result": tts_result
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Global instance
voice_services = VoiceServices()
