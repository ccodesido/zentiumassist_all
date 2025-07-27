from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# OpenAI Configuration
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', 'your-openai-api-key-here')

# Create the main app without a prefix
app = FastAPI(title="Zentium Assist API", description="AI-Powered Mental Health Platform", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# =============================================================================
# MODELS (Compatible with MariaDB structure)
# =============================================================================

class UserRole(str):
    PROFESSIONAL = "professional"
    PATIENT = "patient"
    ADMIN = "admin"

class UserBase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

class Professional(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    license_number: str
    specialization: str
    institution: str
    patients: List[str] = []
    active_sessions: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProfessionalCreate(BaseModel):
    license_number: str
    specialization: str
    institution: str

class Patient(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    professional_id: str
    age: int
    gender: str
    diagnosis: Optional[str] = None
    risk_level: str = "low"  # low, medium, high
    emergency_contact: str
    session_count: int = 0
    last_session: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PatientCreate(BaseModel):
    age: int
    gender: str
    emergency_contact: str
    professional_id: str

class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    professional_id: str
    session_type: str = "therapy"  # therapy, evaluation, follow_up
    transcript: Optional[str] = None
    ai_analysis: Optional[Dict[str, Any]] = None
    mood_before: Optional[int] = None  # 1-10 scale
    mood_after: Optional[int] = None
    notes: Optional[str] = None
    duration_minutes: Optional[int] = None
    status: str = "scheduled"  # scheduled, in_progress, completed, cancelled
    session_date: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SessionCreate(BaseModel):
    patient_id: str
    session_type: str = "therapy"
    session_date: datetime
    notes: Optional[str] = None

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    message: str
    sender: str  # patient, assistant
    ai_response: Optional[str] = None
    sentiment_analysis: Optional[Dict[str, Any]] = None
    is_crisis: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatMessageCreate(BaseModel):
    message: str

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    professional_id: str
    title: str
    description: str
    task_type: str  # homework, exercise, reflection, mindfulness
    status: str = "assigned"  # assigned, in_progress, completed, skipped
    due_date: Optional[datetime] = None
    completion_notes: Optional[str] = None
    ai_feedback: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class TaskCreate(BaseModel):
    patient_id: str
    title: str
    description: str
    task_type: str
    due_date: Optional[datetime] = None

class AIAnalysisRequest(BaseModel):
    text: str
    analysis_type: str  # sentiment, risk_assessment, session_summary

# =============================================================================
# AI SERVICE FUNCTIONS
# =============================================================================

async def get_ai_chat_response(patient_id: str, message: str, chat_history: List[Dict] = None) -> Dict[str, Any]:
    """Get AI response using emergentintegrations"""
    try:
        # Initialize chat with patient-specific session
        chat = LlmChat(
            api_key=OPENAI_API_KEY,
            session_id=f"patient_{patient_id}",
            system_message="""Eres un asistente virtual empático especializado en salud mental para la plataforma Zentium Assist. 
            Tu rol es:
            - Brindar apoyo emocional y contención 24/7
            - Escuchar activamente y validar emociones
            - Sugerir técnicas de relajación y mindfulness
            - Recordar tareas terapéuticas asignadas
            - Detectar señales de crisis (ideación suicida, autolesión)
            - Derivar a profesional cuando sea necesario
            
            IMPORTANTE: No eres un reemplazo del terapeuta. Siempre recuerda que para cuestiones complejas deben consultar a su profesional asignado.
            Si detectas crisis, inmediatamente indica que contacten a su profesional o servicios de emergencia."""
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=message)
        response = await chat.send_message(user_message)
        
        # Simple sentiment analysis
        sentiment_prompt = f"Analiza el sentimiento del siguiente mensaje en una palabra (positivo/negativo/neutral/crisis): '{message}'"
        sentiment_chat = LlmChat(
            api_key=OPENAI_API_KEY,
            session_id=f"sentiment_{uuid.uuid4()}",
            system_message="Eres un analizador de sentimientos. Responde solo con una palabra."
        ).with_model("openai", "gpt-4o-mini")
        
        sentiment_response = await sentiment_chat.send_message(UserMessage(text=sentiment_prompt))
        
        return {
            "response": response,
            "sentiment": sentiment_response.lower().strip(),
            "is_crisis": "crisis" in sentiment_response.lower() or "suicid" in message.lower()
        }
    except Exception as e:
        logging.error(f"Error getting AI response: {e}")
        return {
            "response": "Disculpa, estoy teniendo dificultades técnicas. Por favor, contacta a tu profesional asignado si necesitas ayuda inmediata.",
            "sentiment": "neutral",
            "is_crisis": False
        }

async def analyze_session_transcript(transcript: str) -> Dict[str, Any]:
    """Analyze therapy session transcript"""
    try:
        chat = LlmChat(
            api_key=OPENAI_API_KEY,
            session_id=f"analysis_{uuid.uuid4()}",
            system_message="""Eres un asistente de análisis clínico. Analiza transcripciones de sesiones terapéuticas y proporciona:
            1. Resumen de temas principales
            2. Estado emocional del paciente
            3. Indicadores de progreso o retroceso
            4. Recomendaciones para seguimiento
            5. Nivel de riesgo (bajo/medio/alto)
            
            Responde en formato JSON con las claves: summary, emotional_state, progress_indicators, recommendations, risk_level"""
        ).with_model("openai", "gpt-4o")
        
        analysis_prompt = f"Analiza la siguiente transcripción de sesión terapéutica:\n\n{transcript}"
        response = await chat.send_message(UserMessage(text=analysis_prompt))
        
        try:
            return json.loads(response)
        except:
            return {
                "summary": "Análisis generado",
                "emotional_state": "En evaluación",
                "progress_indicators": "Pendiente de análisis detallado",
                "recommendations": "Continuar seguimiento",
                "risk_level": "bajo"
            }
    except Exception as e:
        logging.error(f"Error analyzing transcript: {e}")
        return {
            "summary": "Error en análisis",
            "emotional_state": "No evaluado",
            "progress_indicators": "Error en procesamiento",
            "recommendations": "Revisar manualmente",
            "risk_level": "bajo"
        }

# =============================================================================
# AUTHENTICATION & USERS
# =============================================================================

@api_router.post("/auth/register", response_model=UserBase)
async def register_user(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user (password should be hashed in production)
    user_dict = user_data.dict()
    user_obj = UserBase(**user_dict)
    await db.users.insert_one(user_obj.dict())
    
    # Create professional or patient profile
    if user_data.role == UserRole.PROFESSIONAL:
        # For MVP, create basic professional profile
        professional = Professional(
            user_id=user_obj.id,
            license_number="TEMP-" + str(uuid.uuid4())[:8],
            specialization="Psicología Clínica",
            institution="Zentium Assist"
        )
        await db.professionals.insert_one(professional.dict())
    
    return user_obj

@api_router.post("/auth/login")
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Remove MongoDB _id field and convert to UserBase
    user.pop('_id', None)  # Remove MongoDB ObjectId
    user_obj = UserBase(**user)
    
    # Get additional profile info
    profile = None
    if user_obj.role == UserRole.PROFESSIONAL:
        profile_doc = await db.professionals.find_one({"user_id": user_obj.id})
        if profile_doc:
            profile_doc.pop('_id', None)  # Remove MongoDB ObjectId
            profile = Professional(**profile_doc)
    elif user_obj.role == UserRole.PATIENT:
        profile_doc = await db.patients.find_one({"user_id": user_obj.id})
        if profile_doc:
            profile_doc.pop('_id', None)  # Remove MongoDB ObjectId
            profile = Patient(**profile_doc)
    
    return {
        "user": user_obj,
        "profile": profile.dict() if profile else None,
        "token": f"mock-token-{user_obj.id}"  # In production, use JWT
    }

# =============================================================================
# PROFESSIONALS
# =============================================================================

@api_router.get("/professionals/{professional_id}/patients", response_model=List[Patient])
async def get_professional_patients(professional_id: str):
    patients_docs = await db.patients.find({"professional_id": professional_id}).to_list(100)
    patients = []
    for patient_doc in patients_docs:
        patient_doc.pop('_id', None)  # Remove MongoDB ObjectId
        patients.append(Patient(**patient_doc))
    return patients

@api_router.post("/professionals/{professional_id}/patients", response_model=Patient)
async def create_patient(professional_id: str, patient_data: PatientCreate):
    # Create user first
    patient_user = UserBase(
        email=f"patient_{uuid.uuid4()}@temp.com",
        name=f"Paciente {uuid.uuid4()}",
        role=UserRole.PATIENT
    )
    await db.users.insert_one(patient_user.dict())
    
    # Create patient profile
    patient_dict = patient_data.dict()
    patient_dict["user_id"] = patient_user.id
    patient_obj = Patient(**patient_dict)
    await db.patients.insert_one(patient_obj.dict())
    
    return patient_obj

@api_router.get("/professionals/{professional_id}/dashboard")
async def get_professional_dashboard(professional_id: str):
    # Get patients
    patients_docs = await db.patients.find({"professional_id": professional_id}).to_list(100)
    patients = []
    for patient_doc in patients_docs:
        patient_doc.pop('_id', None)  # Remove MongoDB ObjectId
        patients.append(patient_doc)
    
    # Get recent sessions
    sessions_docs = await db.sessions.find(
        {"professional_id": professional_id}
    ).sort("created_at", -1).limit(10).to_list(10)
    recent_sessions = []
    for session_doc in sessions_docs:
        session_doc.pop('_id', None)  # Remove MongoDB ObjectId
        recent_sessions.append(session_doc)
    
    # Get crisis alerts
    crisis_docs = await db.chat_messages.find(
        {"is_crisis": True}
    ).sort("timestamp", -1).limit(5).to_list(5)
    crisis_messages = []
    for crisis_doc in crisis_docs:
        crisis_doc.pop('_id', None)  # Remove MongoDB ObjectId
        crisis_messages.append(crisis_doc)
    
    return {
        "patients_count": len(patients),
        "patients": patients,
        "recent_sessions": recent_sessions,
        "crisis_alerts": crisis_messages,
        "stats": {
            "total_patients": len(patients),
            "active_sessions": len([s for s in recent_sessions if s.get("status") == "in_progress"]),
            "crisis_alerts": len(crisis_messages)
        }
    }

# =============================================================================
# PATIENTS
# =============================================================================

@api_router.get("/patients/{patient_id}/profile", response_model=Patient)
async def get_patient_profile(patient_id: str):
    patient = await db.patients.find_one({"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient.pop('_id', None)  # Remove MongoDB ObjectId
    return Patient(**patient)

@api_router.get("/patients/{patient_id}/sessions", response_model=List[Session])
async def get_patient_sessions(patient_id: str):
    sessions_docs = await db.sessions.find({"patient_id": patient_id}).sort("session_date", -1).to_list(50)
    sessions = []
    for session_doc in sessions_docs:
        session_doc.pop('_id', None)  # Remove MongoDB ObjectId
        sessions.append(Session(**session_doc))
    return sessions

@api_router.get("/patients/{patient_id}/tasks", response_model=List[Task])
async def get_patient_tasks(patient_id: str):
    tasks_docs = await db.tasks.find({"patient_id": patient_id}).sort("created_at", -1).to_list(50)
    tasks = []
    for task_doc in tasks_docs:
        task_doc.pop('_id', None)  # Remove MongoDB ObjectId
        tasks.append(Task(**task_doc))
    return tasks

# =============================================================================
# CHAT/AI ASSISTANT
# =============================================================================

@api_router.post("/chat/{patient_id}/message")
async def send_chat_message(patient_id: str, message_data: ChatMessageCreate):
    # Save user message
    user_message = ChatMessage(
        patient_id=patient_id,
        message=message_data.message,
        sender="patient"
    )
    
    # Get AI response
    ai_result = await get_ai_chat_response(patient_id, message_data.message)
    
    # Save AI response
    ai_message = ChatMessage(
        patient_id=patient_id,
        message=ai_result["response"],
        sender="assistant",
        sentiment_analysis={"sentiment": ai_result["sentiment"]},
        is_crisis=ai_result["is_crisis"]
    )
    
    # Save both messages
    await db.chat_messages.insert_one(user_message.dict())
    await db.chat_messages.insert_one(ai_message.dict())
    
    # If crisis detected, alert professional
    if ai_result["is_crisis"]:
        patient = await db.patients.find_one({"id": patient_id})
        if patient:
            # In production, send real-time notification
            logging.warning(f"CRISIS ALERT: Patient {patient_id} needs immediate attention")
    
    return {
        "user_message": user_message,
        "ai_response": ai_message,
        "is_crisis": ai_result["is_crisis"]
    }

@api_router.get("/chat/{patient_id}/history")
async def get_chat_history(patient_id: str, limit: int = 50):
    messages_docs = await db.chat_messages.find(
        {"patient_id": patient_id}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    messages = []
    for msg_doc in messages_docs:
        msg_doc.pop('_id', None)  # Remove MongoDB ObjectId
        messages.append(ChatMessage(**msg_doc))
    
    return messages

# =============================================================================
# SESSIONS
# =============================================================================

@api_router.post("/sessions", response_model=Session)
async def create_session(session_data: SessionCreate):
    session_dict = session_data.dict()
    session_obj = Session(**session_dict)
    await db.sessions.insert_one(session_obj.dict())
    return session_obj

@api_router.put("/sessions/{session_id}/transcript")
async def update_session_transcript(session_id: str, transcript: str):
    # Update transcript
    await db.sessions.update_one(
        {"id": session_id},
        {
            "$set": {
                "transcript": transcript,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Generate AI analysis
    analysis = await analyze_session_transcript(transcript)
    
    # Update with analysis
    await db.sessions.update_one(
        {"id": session_id},
        {
            "$set": {
                "ai_analysis": analysis,
                "status": "completed"
            }
        }
    )
    
    return {"message": "Transcript updated and analyzed", "analysis": analysis}

# =============================================================================
# TASKS
# =============================================================================

@api_router.post("/tasks", response_model=Task)
async def create_task(task_data: TaskCreate):
    # Get professional ID from patient
    patient = await db.patients.find_one({"id": task_data.patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    task_dict = task_data.dict()
    task_dict["professional_id"] = patient["professional_id"]
    task_obj = Task(**task_dict)
    await db.tasks.insert_one(task_obj.dict())
    
    return task_obj

@api_router.put("/tasks/{task_id}/complete")
async def complete_task(task_id: str, completion_notes: Optional[str] = None):
    await db.tasks.update_one(
        {"id": task_id},
        {
            "$set": {
                "status": "completed",
                "completed_at": datetime.utcnow(),
                "completion_notes": completion_notes
            }
        }
    )
    return {"message": "Task completed successfully"}

# =============================================================================
# ANALYTICS & REPORTING
# =============================================================================

@api_router.get("/analytics/dashboard")
async def get_analytics_dashboard():
    total_users = await db.users.count_documents({})
    total_patients = await db.patients.count_documents({})
    total_professionals = await db.professionals.count_documents({})
    total_sessions = await db.sessions.count_documents({})
    crisis_alerts = await db.chat_messages.count_documents({"is_crisis": True})
    
    return {
        "total_users": total_users,
        "total_patients": total_patients,
        "total_professionals": total_professionals,
        "total_sessions": total_sessions,
        "crisis_alerts": crisis_alerts,
        "system_status": "operational"
    }

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()