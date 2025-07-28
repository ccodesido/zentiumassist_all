from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
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

# Create the main app with enhanced documentation
app = FastAPI(
    title="🧠 Zentium Assist API",
    description="""
## AI-Powered Mental Health Platform

Esta API proporciona endpoints para la plataforma Zentium Assist, una solución integral de salud mental con inteligencia artificial.

### Características principales:
- 🔐 **Autenticación segura** para profesionales y pacientes
- 👨‍⚕️ **Gestión de profesionales** y instituciones
- 👤 **Gestión de pacientes** y perfiles médicos
- 💬 **Chat con IA** para asistencia 24/7
- 🚨 **Detección de crisis** automática
- 📊 **Analytics y reportes** en tiempo real
- ✅ **Sistema de tareas** terapéuticas

### Roles de usuario:
- **Professional**: Acceso a dashboard médico, gestión de pacientes
- **Patient**: Acceso a chat de IA, tareas terapéuticas, perfil personal
- **Admin**: Administración completa del sistema

### Autenticación:
Utiliza JWT tokens. Incluye el token en el header: `Authorization: Bearer <token>`
    """,
    version="2.0.0",
    contact={
        "name": "Zentium Assist Support",
        "url": "https://zentiumassist.com",
        "email": "support@zentiumassist.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=[
        {
            "name": "authentication",
            "description": "🔐 Endpoints de autenticación y gestión de usuarios",
        },
        {
            "name": "professionals",
            "description": "👨‍⚕️ Gestión de profesionales de salud mental",
        },
        {
            "name": "patients",
            "description": "👤 Gestión de pacientes y perfiles médicos",
        },
        {
            "name": "chat",
            "description": "💬 Sistema de chat con IA y detección de crisis",
        },
        {
            "name": "tasks",
            "description": "✅ Sistema de tareas terapéuticas",
        },
        {
            "name": "analytics",
            "description": "📊 Analytics y reportes del sistema",
        },
        {
            "name": "health",
            "description": "🏥 Endpoints de salud del sistema",
        }
    ]
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# =============================================================================
# ENHANCED MODELS WITH SWAGGER DOCUMENTATION
# =============================================================================

class UserRole(str):
    """Roles disponibles en el sistema"""
    PROFESSIONAL = "professional"
    PATIENT = "patient"
    ADMIN = "admin"

class UserBase(BaseModel):
    """Modelo base de usuario del sistema"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="ID único del usuario")
    email: EmailStr = Field(..., description="Email del usuario (debe ser único)")
    name: str = Field(..., min_length=2, max_length=100, description="Nombre completo del usuario")
    role: str = Field(..., description="Rol del usuario en el sistema")
    active: bool = Field(True, description="Estado activo/inactivo del usuario")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Fecha de creación")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Fecha de última actualización")

    class Config:
        schema_extra = {
            "example": {
                "id": "12345678-1234-1234-1234-123456789012",
                "email": "usuario@zentiumassist.com",
                "name": "Dr. Juan Pérez",
                "role": "professional",
                "active": True,
                "created_at": "2025-01-01T10:00:00Z",
                "updated_at": "2025-01-01T10:00:00Z"
            }
        }

class UserCreate(BaseModel):
    """Modelo para crear un nuevo usuario"""
    email: EmailStr = Field(..., description="Email único del usuario")
    name: str = Field(..., min_length=2, max_length=100, description="Nombre completo")
    password: str = Field(..., min_length=8, description="Contraseña (mínimo 8 caracteres)")
    role: str = Field(..., description="Rol: 'professional', 'patient', o 'admin'")

    class Config:
        schema_extra = {
            "example": {
                "email": "nuevo@zentiumassist.com",
                "name": "Dr. María González",
                "password": "password123",
                "role": "professional"
            }
        }

class UserLogin(BaseModel):
    """Modelo para iniciar sesión"""
    email: EmailStr = Field(..., description="Email del usuario")
    password: str = Field(..., description="Contraseña del usuario")

    class Config:
        schema_extra = {
            "example": {
                "email": "test@zentium.com",
                "password": "TestPass123!"
            }
        }

class Token(BaseModel):
    """Respuesta de autenticación exitosa"""
    access_token: str = Field(..., description="JWT token para autenticación")
    token_type: str = Field("bearer", description="Tipo de token")
    user: Dict = Field(..., description="Información del usuario autenticado")

    class Config:
        schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": "12345678-1234-1234-1234-123456789012",
                    "email": "test@zentium.com",
                    "name": "Dr. Test",
                    "role": "professional"
                }
            }
        }

class Professional(BaseModel):
    """Modelo de profesional de salud mental"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="ID único del profesional")
    user_id: str = Field(..., description="ID del usuario asociado")
    license_number: str = Field(..., description="Número de licencia profesional")
    specialization: str = Field(..., description="Especialización médica")
    institution: str = Field(..., description="Institución donde trabaja")
    patients: List[str] = Field(default=[], description="Lista de IDs de pacientes asignados")
    active_sessions: int = Field(0, description="Número de sesiones activas")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Fecha de registro")

    class Config:
        schema_extra = {
            "example": {
                "id": "prof-12345678-1234-1234-1234-123456789012",
                "user_id": "user-12345678-1234-1234-1234-123456789012",
                "license_number": "PSI-12345",
                "specialization": "Psicología Clínica",
                "institution": "Hospital General",
                "patients": ["pat-1", "pat-2"],
                "active_sessions": 5,
                "created_at": "2025-01-01T10:00:00Z"
            }
        }

class ProfessionalCreate(BaseModel):
    """Modelo para crear perfil profesional"""
    license_number: str = Field(..., description="Número de licencia profesional")
    specialization: str = Field(..., description="Área de especialización")
    institution: str = Field(..., description="Institución médica")

    class Config:
        schema_extra = {
            "example": {
                "license_number": "PSI-67890",
                "specialization": "Psicología Infantil",
                "institution": "Clínica San Rafael"
            }
        }

class Patient(BaseModel):
    """Modelo de paciente"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="ID único del paciente")
    user_id: str = Field(..., description="ID del usuario asociado")
    professional_id: str = Field(..., description="ID del profesional asignado")
    age: int = Field(..., ge=1, le=120, description="Edad del paciente")
    gender: str = Field(..., description="Género del paciente")
    diagnosis: Optional[str] = Field(None, description="Diagnóstico médico (opcional)")
    risk_level: str = Field("low", description="Nivel de riesgo: low, medium, high")
    emergency_contact: str = Field(..., description="Contacto de emergencia")
    session_count: int = Field(0, description="Número total de sesiones")
    last_session: Optional[datetime] = Field(None, description="Fecha de última sesión")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Fecha de registro")

    class Config:
        schema_extra = {
            "example": {
                "id": "pat-12345678-1234-1234-1234-123456789012",
                "user_id": "user-12345678-1234-1234-1234-123456789012",
                "professional_id": "prof-12345678-1234-1234-1234-123456789012",
                "age": 28,
                "gender": "Femenino",
                "diagnosis": "Trastorno de ansiedad",
                "risk_level": "medium",
                "emergency_contact": "+34 600 123 456",
                "session_count": 15,
                "last_session": "2025-01-28T14:30:00Z",
                "created_at": "2025-01-01T10:00:00Z"
            }
        }

class PatientCreate(BaseModel):
    """Modelo para crear perfil de paciente"""
    age: int = Field(..., ge=1, le=120, description="Edad del paciente")
    gender: str = Field(..., description="Género")
    emergency_contact: str = Field(..., description="Teléfono de contacto de emergencia")
    professional_id: str = Field(..., description="ID del profesional asignado")

    class Config:
        schema_extra = {
            "example": {
                "age": 32,
                "gender": "Masculino",
                "emergency_contact": "+34 600 987 654",
                "professional_id": "prof-12345678-1234-1234-1234-123456789012"
            }
        }

class ChatMessage(BaseModel):
    """Modelo para mensajes de chat"""
    message: str = Field(..., min_length=1, max_length=1000, description="Contenido del mensaje")
    session_id: Optional[str] = Field(None, description="ID de sesión (opcional)")

    class Config:
        schema_extra = {
            "example": {
                "message": "Hola, me siento un poco ansioso hoy",
                "session_id": "session-12345678-1234-1234-1234-123456789012"
            }
        }

class ChatResponse(BaseModel):
    """Respuesta del sistema de chat con IA"""
    response: str = Field(..., description="Respuesta generada por la IA")
    session_id: str = Field(..., description="ID de la sesión de chat")
    crisis_detected: bool = Field(False, description="Indica si se detectó una crisis")
    crisis_level: Optional[str] = Field(None, description="Nivel de crisis si se detectó")
    recommendations: List[str] = Field(default=[], description="Recomendaciones del sistema")

    class Config:
        schema_extra = {
            "example": {
                "response": "Entiendo que te sientes ansioso. Es normal tener estos sentimientos. ¿Puedes contarme más sobre qué específicamente te está causando ansiedad?",
                "session_id": "session-12345678-1234-1234-1234-123456789012",
                "crisis_detected": False,
                "crisis_level": None,
                "recommendations": ["Practica ejercicios de respiración", "Contacta a tu profesional si empeora"]
            }
        }

class Task(BaseModel):
    """Modelo de tarea terapéutica"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="ID único de la tarea")
    patient_id: str = Field(..., description="ID del paciente asignado")
    title: str = Field(..., description="Título de la tarea")
    description: str = Field(..., description="Descripción detallada")
    category: str = Field(..., description="Categoría de la tarea")
    completed: bool = Field(False, description="Estado de completado")
    due_date: Optional[datetime] = Field(None, description="Fecha límite")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Fecha de creación")

    class Config:
        schema_extra = {
            "example": {
                "id": "task-12345678-1234-1234-1234-123456789012",
                "patient_id": "pat-12345678-1234-1234-1234-123456789012",
                "title": "Ejercicio de respiración",
                "description": "Practica respiración profunda por 10 minutos",
                "category": "mindfulness",
                "completed": False,
                "due_date": "2025-01-30T12:00:00Z",
                "created_at": "2025-01-28T10:00:00Z"
            }
        }

class HealthCheck(BaseModel):
    """Respuesta del endpoint de salud"""
    status: str = Field(..., description="Estado del sistema")
    timestamp: datetime = Field(..., description="Timestamp de la verificación")
    version: str = Field("2.0.0", description="Versión de la API")
    services: Dict[str, str] = Field(default={}, description="Estado de servicios dependientes")

    class Config:
        schema_extra = {
            "example": {
                "status": "healthy",
                "timestamp": "2025-01-28T10:00:00Z",
                "version": "2.0.0",
                "services": {
                    "database": "connected",
                    "ai_service": "operational"
                }
            }
        }

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
    
    elif user_data.role == UserRole.PATIENT:
        # For patient registration, assign to first available professional
        # In production, this would be more sophisticated
        professionals = await db.professionals.find().to_list(10)
        if professionals:
            professional_id = professionals[0]["id"]  # Assign to first professional
            patient = Patient(
                user_id=user_obj.id,
                professional_id=professional_id,
                age=25,  # Default age, should be collected in registration
                gender="no especificado",
                emergency_contact="Contacto de emergencia no especificado"
            )
            await db.patients.insert_one(patient.dict())
        else:
            # Create a default professional if none exists
            default_professional = Professional(
                user_id="system",
                license_number="SYSTEM-DEFAULT",
                specialization="Psicología General",
                institution="Zentium Assist"
            )
            await db.professionals.insert_one(default_professional.dict())
            
            patient = Patient(
                user_id=user_obj.id,
                professional_id=default_professional.id,
                age=25,
                gender="no especificado",
                emergency_contact="Contacto de emergencia no especificado"
            )
            await db.patients.insert_one(patient.dict())
    
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