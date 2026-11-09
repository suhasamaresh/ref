from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import desc

# Load .env file if it exists (before importing services that need env vars)
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass  # python-dotenv not installed, will use system env vars only

from .services.langchain_pipeline import ChatbotPipeline
from .services.voice_services import voice_services
from .services.indian_tts import indian_tts
from .services.auth import (
    get_current_user, 
    get_optional_user, 
    create_access_token, 
    verify_password, 
    get_password_hash
)
from .services.storage import save_audio_file, UPLOAD_DIR
from .db import get_db_session
from .models import User, Conversation, Message

try:
    from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
    from starlette.responses import Response
except Exception:  # pragma: no cover
    Counter = None
    Histogram = None
    Response = None


# Request/Response Models
class ChatRequest(BaseModel):
    user_id: str
    message: str
    language: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    language: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class STTRequest(BaseModel):
    audio_url: Optional[str] = None
    language: Optional[str] = None


class STTResponse(BaseModel):
    text: str
    language: Optional[str] = None
    error: Optional[str] = None


class TTSRequest(BaseModel):
    text: str
    language: Optional[str] = None
    voice: Optional[str] = None


class TTSResponse(BaseModel):
    audio_url: str
    language: Optional[str] = None
    voice: Optional[str] = None


class TranslateRequest(BaseModel):
    text: str
    source_language: Optional[str] = None
    target_language: str


class TranslateResponse(BaseModel):
    text: str
    target_language: str


class VoiceProcessRequest(BaseModel):
    audio_url: str
    target_language: str = "en"
    source_language: Optional[str] = None


class VoiceProcessResponse(BaseModel):
    success: bool
    original_text: str
    original_language: str
    translated_text: str
    target_language: str
    audio_url: str
    voice: str
    error: Optional[str] = None


# Authentication Models
class UserRegister(BaseModel):
    user_id: str
    password: str
    preferred_language: Optional[str] = "en"


class UserLogin(BaseModel):
    user_id: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    preferred_language: str


class UserResponse(BaseModel):
    user_id: str
    preferred_language: str
    created_at: str


# Pagination Models
class PaginatedResponse(BaseModel):
    items: List[Dict[str, Any]]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool


class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: str
    message_count: Optional[int] = None


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    language: str
    created_at: str


# Error Response Model
class ErrorResponse(BaseModel):
    error: Dict[str, Any]


# Initialize FastAPI app
app = FastAPI(
    title="Refugee Assistance Chatbot API",
    version="0.2.0",
    description="API for multilingual refugee assistance chatbot with React Native support"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploaded audio and TTS
# UPLOAD_DIR is created at import time in storage.py
try:
    uploads_parent = UPLOAD_DIR.parent
    # Ensure uploads directory exists
    uploads_parent.mkdir(parents=True, exist_ok=True)
    
    # Create TTS directory if it doesn't exist
    tts_dir = uploads_parent / "tts"
    tts_dir.mkdir(parents=True, exist_ok=True)
    
    if uploads_parent.exists():
        app.mount("/uploads", StaticFiles(directory=str(uploads_parent)), name="uploads")
except Exception:
    # Static file serving is optional - continue without it
    pass

# Error Handling Middleware
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "type": "HTTPException"
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": 500,
                "message": "Internal server error",
                "type": "InternalError"
            }
        }
    )


# Prometheus metrics
REQUEST_COUNTER = Counter("requests_total", "Total requests", ["endpoint"]) if Counter else None
REQUEST_LATENCY = Histogram("request_latency_seconds", "Latency", ["endpoint"]) if Histogram else None


def _inc(endpoint: str):
    if REQUEST_COUNTER:
        REQUEST_COUNTER.labels(endpoint=endpoint).inc()


def _timer(endpoint: str):
    if REQUEST_LATENCY:
        return REQUEST_LATENCY.labels(endpoint=endpoint).time()
    # Fallback context manager
    class _Noop:
        def __enter__(self):
            return self
        def __exit__(self, exc_type, exc, tb):
            return False
    return _Noop()


# Root endpoints
@app.get("/")
def root():
    return {"message": "Refugee Assistance Chatbot API", "version": "0.2.0"}


@app.get("/test")
def test():
    return {"message": "Test!"}


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/metrics")
def metrics():  # type: ignore[no-redef]
    if generate_latest is None or Response is None:  # pragma: no cover
        raise HTTPException(status_code=501, detail="Prometheus not installed")
    data = generate_latest()  # type: ignore[arg-type]
    return Response(data, media_type=CONTENT_TYPE_LATEST)


# Authentication Endpoints
@app.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db_session)):
    """Register a new user."""
    _inc("register")
    with _timer("register"):
        # Check if user already exists
        existing_user = db.query(User).filter(User.id == user_data.user_id).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already exists"
            )
        
        # Create new user
        new_user = User(
            id=user_data.user_id,
            preferred_language=user_data.preferred_language,
            password_hash=get_password_hash(user_data.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Generate access token
        access_token = create_access_token(data={"sub": new_user.id})
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=new_user.id,
            preferred_language=new_user.preferred_language
        )


@app.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db_session)):
    """Login and get access token."""
    _inc("login")
    with _timer("login"):
        user = db.query(User).filter(User.id == credentials.user_id).first()
        
        if not user or not user.password_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        if not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Generate access token
        access_token = create_access_token(data={"sub": user.id})
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            preferred_language=user.preferred_language
        )


@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info."""
    return UserResponse(
        user_id=current_user.id,
        preferred_language=current_user.preferred_language,
        created_at=current_user.created_at.isoformat()
    )


# File Upload Endpoint
@app.post("/upload-audio")
async def upload_audio(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Upload an audio file for processing."""
    _inc("upload_audio")
    with _timer("upload_audio"):
        user_id = current_user.id if current_user else None
        file_info = await save_audio_file(file, user_id)
        
        # Convert file_path to URL
        base_url = os.getenv("BASE_URL", "http://localhost:8000")
        file_url = f"{base_url}{file_info['file_url']}"
        
        return {
            "success": True,
            "file_url": file_url,
            "filename": file_info["filename"],
            "size": file_info["size"],
            "content_type": file_info["content_type"]
        }


# Chat Endpoint (with optional authentication)
@app.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest, 
    db: Session = Depends(get_db_session),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Chat with the assistant."""
    _inc("chat")
    with _timer("chat"):
        # Use authenticated user_id if available
        user_id = current_user.id if current_user else req.user_id
        language = req.language or (current_user.preferred_language if current_user else None)
        
        try:
            pipeline = ChatbotPipeline.from_env(db_session=db)
            result = pipeline.generate_reply(
                user_id=user_id, 
                message=req.message, 
                language=language
            )
            
            # Check if result is just an echo (LLM not configured)
            if result.get("reply", "").startswith("Echo:"):
                # Provide helpful fallback response
                result["reply"] = get_fallback_chat_response(req.message, language)
            
            return ChatResponse(**result)
        except Exception as e:
            # If pipeline fails, provide fallback response
            print(f"[Chat] Pipeline error: {e}")
            fallback_reply = get_fallback_chat_response(req.message, language)
            return ChatResponse(
                reply=fallback_reply,
                language=language or "auto",
                metadata={"fallback": True, "error": str(e)}
            )


def get_fallback_chat_response(message: str, language: Optional[str] = None) -> str:
    """Provide helpful fallback responses when LLM is not available."""
    
    # Simple language-based responses
    responses = {
        'en': f"I understand: '{message}'. I'm here to help with refugee assistance. You can ask about services, legal help, resources, or emergency contacts. How can I assist you?",
        'hi': f"मैं समझ गया: '{message}'. मैं शरणार्थी सहायता के साथ मदद करने के लिए यहां हूं। आप सेवाओं, कानूनी मदद, संसाधनों या आपातकालीन संपर्कों के बारे में पूछ सकते हैं।",
        'te': f"నేను అర్థం చేసుకున్నాను: '{message}'. నేను శరణార్థి సహాయంతో సహాయం చేయడానికి ఇక్కడ ఉన్నాను.",
        'ta': f"நான் புரிந்துகொண்டேன்: '{message}'. துணைத் தகவல்களுடன் உதவுவதற்கு நான் இங்கு இருக்கிறேன்.",
        'kn': f"ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ: '{message}'. ನಾನು ನಿರಾಶ್ರಿತ ಸಹಾಯದೊಂದಿಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ.",
        'ml': f"ഞാൻ മനസ്സിലാക്കി: '{message}'. നഗര സഹായത്തിനായി ഞാൻ ഇവിടെയുണ്ട്.",
        'bn': f"আমি বুঝেছি: '{message}'. আমি শরণার্থী সহায়তায় সাহায্য করতে এখানে আছি।",
        'ar': f"أفهم: '{message}'. أنا هنا للمساعدة في مساعدة اللاجئين.",
        'es': f"Entiendo: '{message}'. Estoy aquí para ayudar con asistencia para refugiados.",
        'fr': f"Je comprends: '{message}'. Je suis là pour aider avec l'assistance aux réfugiés."
    }
    
    # Check for emergency keywords
    emergency_keywords = ['help', 'emergency', 'danger', 'urgent', 'crisis', 'सहायता', 'आपातकाल', 'مساعدة', 'ayuda']
    if any(keyword.lower() in message.lower() for keyword in emergency_keywords):
        emergency_responses = {
            'en': "If this is an emergency, please contact local emergency services immediately (112, 911, or your local emergency number). For refugee assistance, I can help connect you with resources.",
            'hi': "यदि यह एक आपातकाल है, तो कृपया तुरंत स्थानीय आपातकालीन सेवाओं से संपर्क करें (112, 911)।",
            'ar': "إذا كانت هذه حالة طوارئ، يرجى الاتصال بخدمات الطوارئ المحلية فوراً (112، 911).",
            'es': "Si esto es una emergencia, contacte con los servicios de emergencia locales inmediatamente (112, 911)."
        }
        return emergency_responses.get(language or 'en', emergency_responses['en'])
    
    return responses.get(language or 'en', responses['en'])


# Speech-to-Text Endpoint - Supports both JSON and multipart
@app.post("/stt", response_model=STTResponse)
async def stt(
    request: Request,
    file: Optional[UploadFile] = File(None),
    language: Optional[str] = None
):
    """
    Convert speech to text.
    Supports:
    - multipart/form-data with 'file' field (React Native file upload)
    - application/json with 'audio_url' and 'language' fields (existing API)
    """
    _inc("stt")
    with _timer("stt"):
        processed_url = None
        lang = language
        
        # Check content type to determine if it's JSON or multipart
        content_type = request.headers.get("content-type", "")
        
        if "application/json" in content_type:
            # Handle JSON request (existing API)
            body = await request.json()
            processed_url = body.get("audio_url")
            lang = lang or body.get("language")
        elif file:
            # Handle multipart form data (React Native)
            file_info = await save_audio_file(file)
            base_url = os.getenv("BASE_URL", "http://localhost:8000")
            processed_url = f"{base_url}{file_info['file_url']}"
        
        if not processed_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either 'file' (multipart) or 'audio_url' (JSON) is required"
            )
        
        result = await voice_services.speech_to_text(processed_url, lang)
        
        if result.get("error"):
            return STTResponse(
                text="",
                language=result.get("language", lang or "auto"),
                error=result.get("error")
            )
        
        return STTResponse(
            text=result.get("text", ""),
            language=result.get("language", lang or "auto")
        )


@app.post("/tts", response_model=TTSResponse)
async def tts(req: TTSRequest):
    """Convert text to speech. Uses free Google TTS for Indian languages."""
    _inc("tts")
    with _timer("tts"):
        # Check if it's an Indian language that needs free TTS
        indian_languages = ['hi', 'te', 'ta', 'kn', 'ml', 'bn']
        use_free_tts = req.language and req.language.lower() in indian_languages
        
        if use_free_tts:
            # Use free Google TTS for Indian languages
            result = await indian_tts.text_to_speech(req.text, req.language)
            if result.get("success"):
                return TTSResponse(
                    audio_url=result.get("audio_url", ""),
                    language=result.get("language", req.language),
                    voice="google-tts"
                )
            # Fall back to OpenAI if free TTS fails
            print(f"[TTS] Free TTS failed, trying OpenAI fallback: {result.get('error')}")
        
        # Use OpenAI TTS for other languages or as fallback
        result = await voice_services.text_to_speech(req.text, req.language, req.voice)
        return TTSResponse(
            audio_url=result.get("audio_url", ""),
            language=result.get("language", req.language or "auto"),
            voice=result.get("voice", req.voice)
        )


@app.post("/translate", response_model=TranslateResponse)
async def translate(req: TranslateRequest):
    """Translate text."""
    _inc("translate")
    with _timer("translate"):
        result = await voice_services.translate_text(req.text, req.source_language, req.target_language)
        return TranslateResponse(
            text=result.get("text", req.text),
            target_language=result.get("target_language", req.target_language)
        )


@app.post("/voice-process", response_model=VoiceProcessResponse)
async def voice_process(req: VoiceProcessRequest):
    """Complete voice processing pipeline."""
    _inc("voice_process")
    with _timer("voice_process"):
        result = await voice_services.process_voice_message(
            req.audio_url, 
            req.target_language, 
            req.source_language
        )
        return VoiceProcessResponse(**result)


# Conversation Management Endpoints
@app.get("/conversations", response_model=PaginatedResponse)
async def get_conversations(
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get paginated list of user conversations."""
    _inc("get_conversations")
    with _timer("get_conversations"):
        offset = (page - 1) * page_size
        
        # Get total count
        total = db.query(Conversation).filter(Conversation.user_id == current_user.id).count()
        
        # Get conversations
        conversations = db.query(Conversation)\
            .filter(Conversation.user_id == current_user.id)\
            .order_by(desc(Conversation.created_at))\
            .offset(offset)\
            .limit(page_size)\
            .all()
        
        items = [
            {
                "id": conv.id,
                "user_id": conv.user_id,
                "title": conv.title,
                "created_at": conv.created_at.isoformat(),
                "message_count": len(conv.messages) if conv.messages else 0
            }
            for conv in conversations
        ]
        
        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            has_next=(offset + page_size) < total,
            has_prev=page > 1
        )


@app.get("/conversations/{conversation_id}/messages", response_model=PaginatedResponse)
async def get_messages(
    conversation_id: str,
    page: int = 1,
    page_size: int = 50,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get paginated messages from a conversation."""
    _inc("get_messages")
    with _timer("get_messages"):
        # Verify conversation belongs to user
        conversation = db.query(Conversation)\
            .filter(Conversation.id == conversation_id)\
            .filter(Conversation.user_id == current_user.id)\
            .first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        offset = (page - 1) * page_size
        
        # Get total count
        total = db.query(Message)\
            .filter(Message.conversation_id == conversation_id)\
            .count()
        
        # Get messages
        messages = db.query(Message)\
            .filter(Message.conversation_id == conversation_id)\
            .order_by(Message.created_at)\
            .offset(offset)\
            .limit(page_size)\
            .all()
        
        items = [
            {
                "id": msg.id,
                "conversation_id": msg.conversation_id,
                "role": msg.role,
                "content": msg.content,
                "language": msg.language,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]
        
        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            has_next=(offset + page_size) < total,
            has_prev=page > 1
        )
