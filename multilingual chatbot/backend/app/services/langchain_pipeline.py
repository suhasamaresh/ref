from __future__ import annotations

from typing import Any, Dict, Optional, List
import os
import re


EMERGENCY_PATTERN = re.compile(
    r"\b(emergency|danger|assault|violence|police|ambulance|fire|hurt|injured|blood|attack|threat|urgent|immediate)\b",
    re.IGNORECASE,
)


class ChatbotPipeline:
    """LangChain-based RAG pipeline with simple emergency intent detection.

    Components:
      - Embeddings: OpenAI embeddings
      - Vector store: Pinecone via langchain-community wrapper
      - LLM: ChatOpenAI (configurable)
      - Memory: lightweight in-DB via messages table (hook points provided)
      - Intent: regex + LLM confirmation (optional)
    """

    def __init__(self, db_session: Any):
        self.db_session = db_session
        self.model_preference = os.getenv("LLM_PREFERENCE", "gpt-4o-mini")
        self.embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
        self.pinecone_index = os.getenv("PINECONE_INDEX", "refugee-knowledge")

        # Defer optional imports to avoid hard failures when deps are not installed yet
        self.llm = None
        self.embedder = None
        self.vectorstore = None
        self.retriever = None
        self.qa_prompt = None
        self.output_parser = None

        try:
            from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings  # type: ignore
            from langchain_core.prompts import ChatPromptTemplate  # type: ignore
            from langchain_core.runnables import RunnablePassthrough  # type: ignore
            from langchain_core.output_parsers import StrOutputParser  # type: ignore
            try:
                from langchain_community.vectorstores import Pinecone as LC_Pinecone  # type: ignore
            except Exception:
                LC_Pinecone = None  # type: ignore

            if os.getenv("GEMINI_API_KEY"):
                self.llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.2)
                self.embedder = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
                if LC_Pinecone is not None and self.embedder is not None:
                    try:
                        self.vectorstore = LC_Pinecone.from_existing_index(self.pinecone_index, self.embedder)
                    except Exception:
                        self.vectorstore = None
                self.retriever = self.vectorstore.as_retriever(search_kwargs={"k": 5}) if self.vectorstore else None
                self.qa_prompt = ChatPromptTemplate.from_messages([
                    (
                        "system",
                        """
You are a multilingual refugee assistance assistant. Use the provided context to answer
clearly and compassionately. If the answer may differ by country, state assumptions and
encourage contacting local authorities or NGOs. If insufficient context, say you don't
know and suggest next steps. Respond in the user's language if specified.
                        """.strip(),
                    ),
                    ("human", "Language: {language}\nQuestion: {question}\n\nContext:\n{context}"),
                ])
                self.output_parser = StrOutputParser()

            # Save imported classes on instance for later use in _build_chain
            self._RunnablePassthrough = locals().get("RunnablePassthrough")
        except Exception:
            # Leave components as None for graceful fallback
            self._RunnablePassthrough = None

    @classmethod
    def from_env(cls, db_session: Any) -> "ChatbotPipeline":
        return cls(db_session=db_session)

    def _detect_emergency(self, text: str) -> bool:
        return bool(EMERGENCY_PATTERN.search(text))

    def _analyze_sentiment(self, text: str, language: Optional[str]) -> Dict[str, Any]:
        """
        Simple sentiment analysis for refugee assistance context.
        Detects emotional states: crisis, distressed, worried, neutral, hopeful
        """
        text_lower = text.lower()
        
        # Crisis keywords (immediate intervention needed)
        crisis_keywords = [
            'suicide', 'kill myself', 'end it all', 'give up', 'hopeless', 'worthless',
            'انتحار', 'أقتل نفسي', 'أستسلم', 'بدون أمل',  # Arabic
            'suicidio', 'matarme', 'rendirse', 'sin esperanza',  # Spanish
            'suicide', 'me tuer', 'abandonner', 'sans espoir',  # French
            'आत्महत्या', 'खुद को मारना', 'हार मानना', 'हार मान रहा', 'निराश', 'आत्मघात',  # Hindi
            'ಆತ್ಮಹತ್ಯೆ', 'ನನ್ನನ್ನು ಕೊಲ್ಲು', 'ಅಭಿಪ್ರಾಯ ತ್ಯಜಿಸು', 'ನಿರಾಶೆ',  # Kannada
            'தற்கொலை', 'என்னை கொல்ல', 'கைவிடு', 'நம்பிக்கையற்ற',  # Tamil
            'ఆత్మహత్య', 'నన్ను చంపు', 'వదిలేయి', 'ఆశలేని',  # Telugu
            'ആത്മഹത്യ', 'എന്നെ കൊല്ലുക', 'ഉപേക്ഷിക്കുക', 'ആശയില്ലാത്ത',  # Malayalam
            'আত্মহত্যা', 'নিজেকে মেরে ফেলি', 'হার মানি', 'নিরাশ'  # Bengali
        ]
        
        # Distress keywords (high emotional support needed)
        distress_keywords = [
            'scared', 'terrified', 'panic', 'anxiety', 'depression', 'trauma', 'ptsd',
            'خائف', 'مرعوب', 'ذعر', 'قلق', 'اكتئاب', 'صدمة',  # Arabic
            'asustado', 'aterrorizado', 'pánico', 'ansiedad', 'depresión',  # Spanish
            'effrayé', 'terrifié', 'panique', 'anxiété', 'dépression',  # French
            'डरा हुआ', 'भयभीत', 'घबराहट', 'चिंता', 'अवसाद', 'आघात',  # Hindi
            'ಭಯ', 'ಭಯಭ್ರಾಂತ', 'ಭಯೋತ್ಪಾದನೆ', 'ಚಿಂತೆ', 'ಖಿನ್ನತೆ', 'ಆಘಾತ',  # Kannada
            'பயம்', 'பயப்படுகிறேன்', 'பீதி', 'கவலை', 'மனச்சோர்வு', 'அதிர்ச்சி',  # Tamil
            'భయం', 'భయపడుతున్నాను', 'భయోత్పాతం', 'ఆందోళన', 'అవసాదం', 'ఆఘాతం',  # Telugu
            'ഭയം', 'ഭയപ്പെടുന്നു', 'ഭയോത്പാതം', 'ആശങ്ക', 'അവസാദം', 'ആഘാതം',  # Malayalam
            'ভয়', 'ভীত', 'আতঙ্ক', 'উদ্বেগ', 'হতাশা', 'আঘাত'  # Bengali
        ]
        
        # Worry keywords (reassurance needed)
        worry_keywords = [
            'worried', 'concerned', 'anxious', 'stressed', 'overwhelmed',
            'قلق', 'مشغول', 'متوتر', 'مرهق',  # Arabic
            'preocupado', 'ansioso', 'estresado', 'abrumado',  # Spanish
            'inquiet', 'anxieux', 'stressé', 'débordé',  # French
            'चिंतित', 'परेशान', 'तनावग्रस्त', 'अभिभूत',  # Hindi
            'ಚಿಂತೆ', 'ಅಸ್ವಸ್ಥ', 'ಒತ್ತಡ', 'ಅತಿಭಾರ',  # Kannada
            'கவலை', 'தொந்தரவு', 'மன அழுத்தம்', 'மூழ்கிய',  # Tamil
            'ఆందోళన', 'ఇబ్బంది', 'ఒత్తిడి', 'మునిగిపోయిన',  # Telugu
            'ആശങ്ക', 'ഇടപെടൽ', 'സമ്മർദ്ദം', 'മുങ്ങിപ്പോയ',  # Malayalam
            'চিন্তিত', 'বিরক্ত', 'চাপ', 'অভিভূত'  # Bengali
        ]
        
        # Positive keywords
        positive_keywords = [
            'thankful', 'grateful', 'hopeful', 'better', 'improving', 'helpful',
            'شاكر', 'ممتن', 'متفائل', 'أفضل', 'متحسن',  # Arabic
            'agradecido', 'esperanzado', 'mejor', 'mejorando',  # Spanish
            'reconnaissant', 'plein d\'espoir', 'mieux', 's\'améliorant',  # French
            'आभारी', 'कृतज्ञ', 'आशावादी', 'बेहतर', 'सुधार',  # Hindi
            'ಕೃತಜ್ಞ', 'ಆಶಾವಾದಿ', 'ಉತ್ತಮ', 'ಸುಧಾರಣೆ',  # Kannada
            'நன்றி', 'கடமை', 'நம்பிக்கை', 'சிறந்த', 'முன்னேற்றம்',  # Tamil
            'కృతజ్ఞత', 'ఆశావాది', 'ఉత్తమ', 'మెరుగుదల',  # Telugu
            'കൃതജ്ഞത', 'ആശാവാദി', 'മികച്ച', 'മെച്ചപ്പെടുത്തൽ',  # Malayalam
            'কৃতজ্ঞ', 'আশাবাদী', 'ভালো', 'উন্নতি'  # Bengali
        ]
        
        # Count keyword matches
        crisis_count = sum(1 for keyword in crisis_keywords if keyword in text_lower)
        distress_count = sum(1 for keyword in distress_keywords if keyword in text_lower)
        worry_count = sum(1 for keyword in worry_keywords if keyword in text_lower)
        positive_count = sum(1 for keyword in positive_keywords if keyword in text_lower)
        
        # Determine emotional state
        if crisis_count > 0:
            emotional_state = "crisis"
            sentiment_score = -0.9
            confidence = 0.9
        elif distress_count > 0:
            emotional_state = "distressed"
            sentiment_score = -0.7
            confidence = 0.8
        elif worry_count > 0:
            emotional_state = "worried"
            sentiment_score = -0.4
            confidence = 0.7
        elif positive_count > 0:
            emotional_state = "hopeful"
            sentiment_score = 0.6
            confidence = 0.7
        else:
            emotional_state = "neutral"
            sentiment_score = 0.0
            confidence = 0.5
        
        return {
            "text": text,
            "language": language or "auto",
            "sentiment_score": sentiment_score,
            "emotional_state": emotional_state,
            "confidence": confidence,
            "crisis_detected": crisis_count > 0,
            "distress_detected": distress_count > 0,
            "keyword_counts": {
                "crisis": crisis_count,
                "distress": distress_count,
                "worry": worry_count,
                "positive": positive_count
            }
        }

    def _format_docs(self, docs: List[Any]) -> str:
        chunks: List[str] = []
        for d in docs or []:
            meta = getattr(d, "metadata", {}) or {}
            source = meta.get("source", "")
            loc = meta.get("locale", "")
            title = meta.get("title", "")
            header = " | ".join([p for p in [title, source, loc] if p])
            chunks.append((header + "\n" if header else "") + (d.page_content if hasattr(d, "page_content") else str(d)))
        return "\n\n---\n\n".join(chunks) if chunks else ""

    def _build_chain(self):
        if not (self.llm and self.qa_prompt and self.output_parser and self._RunnablePassthrough):
            return None
        RunnablePassthrough = self._RunnablePassthrough
        if self.retriever is None:
            def noop_retrieve(_: Dict[str, str]):
                return []
            retrieve = RunnablePassthrough.assign(context=noop_retrieve)
        else:
            retrieve = RunnablePassthrough.assign(context=self.retriever | self._format_docs)
        return retrieve | self.qa_prompt | self.llm | self.output_parser

    def generate_reply(self, user_id: str, message: str, language: Optional[str]) -> Dict[str, Any]:
        is_emergency = self._detect_emergency(message)
        sentiment_analysis = self._analyze_sentiment(message, language)

        chain = self._build_chain()
        if chain is None:
            answer = f"Echo: {message}"
        else:
            answer = chain.invoke({
                "question": message,
                "language": language or "auto",
            })

        # Adjust response based on sentiment and emergency status
        if is_emergency:
            answer = (
                "[Potential emergency detected] If you are in immediate danger, call emergency services (e.g., 112/911) now. "
                + answer
            )
        elif sentiment_analysis["emotional_state"] == "crisis":
            answer = (
                "[Crisis support] I'm deeply concerned about what you're going through. Your safety is the most important thing right now. "
                + answer
            )
        elif sentiment_analysis["emotional_state"] == "distressed":
            answer = (
                "[Emotional support] I can hear that you're going through a very difficult time. You're not alone, and there are people who want to help. "
                + answer
            )
        elif sentiment_analysis["emotional_state"] == "worried":
            answer = (
                "[Reassurance] It's completely understandable to feel worried in this situation. Let me help you find some solutions. "
                + answer
            )

        return {
            "reply": answer,
            "language": language or "auto",
            "metadata": {
                "model": self.model_preference,
                "embedding_model": self.embedding_model,
                "rag": bool(self.retriever is not None),
                "emergency": is_emergency,
                "sentiment": sentiment_analysis,
            },
        }

