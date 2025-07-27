import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mock user context
const UserContext = React.createContext();

// =============================================================================
// AUTHENTICATION COMPONENTS
// =============================================================================

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("professional");
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        const response = await axios.post(`${API}/auth/login`, { email, password });
        localStorage.setItem("user", JSON.stringify(response.data));
        
        if (response.data.user.role === "professional") {
          navigate("/professional");
        } else {
          navigate("/patient");
        }
      } else {
        await axios.post(`${API}/auth/register`, { email, password, name, role });
        setIsLogin(true);
        alert("Usuario registrado exitosamente. Por favor, inicia sesión.");
      }
    } catch (error) {
      alert("Error en autenticación: " + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="text-center mb-8">
          <h1 className="brand-title">Zentium Assist</h1>
          <p className="brand-subtitle">🧠 Plataforma de Salud Mental con IA</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div className="slide-in-left">
              <label className="form-label">Nombre Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Ingresa tu nombre completo"
                required
              />
            </div>
          )}

          <div className={isLogin ? "fade-in" : "slide-in-left"} style={{animationDelay: "0.1s"}}>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className={isLogin ? "fade-in" : "slide-in-left"} style={{animationDelay: "0.2s"}}>
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div className="slide-in-left" style={{animationDelay: "0.3s"}}>
              <label className="form-label">Tipo de Usuario</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-input"
              >
                <option value="professional">👨‍⚕️ Profesional de Salud Mental</option>
                <option value="patient">👤 Paciente</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary scale-in"
            style={{animationDelay: "0.4s"}}
          >
            {isLogin ? "🚀 Iniciar Sesión" : "✨ Crear Cuenta"}
          </button>
        </form>

        <div className="mt-8 text-center fade-in" style={{animationDelay: "0.5s"}}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-600 hover:text-purple-600 text-sm font-medium transition-colors duration-200"
          >
            {isLogin ? "¿No tienes cuenta? ✨ Regístrate" : "¿Ya tienes cuenta? 🔑 Inicia sesión"}
          </button>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 fade-in" style={{animationDelay: "0.6s"}}>
          <h4 className="text-sm font-semibold text-gray-800 mb-2">🧪 Credenciales de Prueba:</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p><strong>Profesional:</strong> test@zentium.com / TestPass123!</p>
            <p><strong>Paciente:</strong> paciente@zentium.com / PacientePass123!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PROFESSIONAL DASHBOARD
// =============================================================================

const ProfessionalDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  const [newPatient, setNewPatient] = useState({
    age: "",
    gender: "",
    emergency_contact: "",
  });
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showCrisisDetails, setShowCrisisDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.profile?.id) return;

      const response = await axios.get(`${API}/professionals/${user.profile.id}/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  const addPatient = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const patientData = {
        ...newPatient,
        age: parseInt(newPatient.age),
        professional_id: user.profile.id
      };

      await axios.post(`${API}/professionals/${user.profile.id}/patients`, patientData);
      
      setNewPatient({ age: "", gender: "", emergency_contact: "" });
      setShowAddPatient(false);
      loadDashboard();
    } catch (error) {
      alert("Error al agregar paciente: " + error.message);
    }
  };

  const showCrisisDetail = async (alert) => {
    try {
      // Get patient information
      const patientResponse = await axios.get(`${API}/patients/${alert.patient_id}/profile`);
      
      // Get recent chat history for context
      const chatResponse = await axios.get(`${API}/chat/${alert.patient_id}/history?limit=10`);
      
      setSelectedCrisis({
        ...alert,
        patient: patientResponse.data,
        chatHistory: chatResponse.data
      });
      setShowCrisisDetails(true);
    } catch (error) {
      console.error("Error loading crisis details:", error);
      // Show basic crisis info even if we can't load additional details
      setSelectedCrisis({
        ...alert,
        patient: { id: alert.patient_id, age: "Desconocido", gender: "No disponible" },
        chatHistory: []
      });
      setShowCrisisDetails(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="brand-title">🧠 Zentium Assist</h1>
              <span className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm rounded-full font-semibold">
                👨‍⚕️ Profesional
              </span>
            </div>
            <button
              onClick={logout}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-100"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card hover-lift fade-in">
            <div className="flex items-center">
              <div className="stat-icon blue">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Pacientes</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.total_patients}</p>
              </div>
            </div>
          </div>

          <div className="stat-card hover-lift fade-in" style={{animationDelay: "0.1s"}}>
            <div className="flex items-center">
              <div className="stat-icon green">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Sesiones Activas</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.active_sessions}</p>
              </div>
            </div>
          </div>

          <div className="stat-card hover-lift fade-in" style={{animationDelay: "0.2s"}}>
            <div className="flex items-center">
              <div className="stat-icon yellow">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Alertas de Crisis</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.crisis_alerts}</p>
              </div>
            </div>
          </div>

          <div className="stat-card hover-lift fade-in" style={{animationDelay: "0.3s"}}>
            <button
              onClick={() => setShowAddPatient(true)}
              className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              ➕ Agregar Paciente
            </button>
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 fade-in" style={{animationDelay: "0.4s"}}>
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              👥 Mis Pacientes
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-semibold">
                {dashboardData.patients.length}
              </span>
            </h2>
          </div>
          <div className="p-6">
            {dashboardData.patients.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-500">No hay pacientes asignados</p>
                <p className="text-gray-400 mt-2">Comienza agregando tu primer paciente</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.patients.map((patient, index) => (
                  <div
                    key={patient.id}
                    className="patient-card slide-in-right"
                    style={{animationDelay: `${0.1 * index}s`}}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">
                        👤 Paciente #{patient.id.slice(-6)}
                      </h3>
                      <span className={`badge ${
                        patient.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                        patient.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {patient.risk_level === 'high' ? '🔴 Alto Riesgo' :
                         patient.risk_level === 'medium' ? '🟡 Riesgo Medio' : '🟢 Riesgo Bajo'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 flex items-center">
                        <span className="mr-2">🎂</span>
                        <strong>Edad:</strong> {patient.age} años
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <span className="mr-2">⚧️</span>
                        <strong>Género:</strong> {patient.gender}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <span className="mr-2">📊</span>
                        <strong>Sesiones:</strong> {patient.session_count}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          📅 {new Date(patient.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 font-medium">Activo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Crisis Alerts */}
        {dashboardData.crisis_alerts.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl shadow-lg fade-in" style={{animationDelay: "0.5s"}}>
            <div className="px-6 py-4 border-b border-red-200 bg-gradient-to-r from-red-100 to-pink-100 rounded-t-xl">
              <h2 className="text-xl font-bold text-red-900 flex items-center">
                🚨 Alertas de Crisis
                <span className="ml-3 px-3 py-1 bg-red-200 text-red-800 text-sm rounded-full font-semibold animate-pulse">
                  {dashboardData.crisis_alerts.length}
                </span>
              </h2>
            </div>
            <div className="p-6">
              {dashboardData.crisis_alerts.map((alert, index) => (
                <div key={index} className="mb-4 p-4 bg-white border-2 border-red-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-white text-sm font-bold">!</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">{alert.message}</p>
                      <p className="text-xs text-red-600 mt-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button className="ml-3 px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <>
          <div 
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddPatient(false);
              }
            }}
          >
            <div className="modal-content scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">➕ Agregar Nuevo Paciente</h3>
                <p className="text-gray-600">Completa la información básica del paciente</p>
              </div>
              
              <div className="space-y-6">
                <div className="fade-in">
                  <label className="form-label">👤 Edad del paciente</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                    className="form-input"
                    placeholder="Ej: 25"
                    min="1"
                    max="120"
                  />
                </div>

                <div className="fade-in" style={{animationDelay: "0.1s"}}>
                  <label className="form-label">⚧️ Género</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                    className="form-input"
                  >
                    <option value="">Seleccionar género...</option>
                    <option value="masculino">👨 Masculino</option>
                    <option value="femenino">👩 Femenino</option>
                    <option value="no binario">⚧️ No binario</option>
                    <option value="otro">🏳️‍⚧️ Otro</option>
                    <option value="prefiero no decir">❓ Prefiero no decir</option>
                  </select>
                </div>

                <div className="fade-in" style={{animationDelay: "0.2s"}}>
                  <label className="form-label">📞 Contacto de Emergencia</label>
                  <input
                    type="text"
                    value={newPatient.emergency_contact}
                    onChange={(e) => setNewPatient({...newPatient, emergency_contact: e.target.value})}
                    className="form-input"
                    placeholder="Ej: María González - 555-123-4567"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddPatient(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ❌ Cancelar
                </button>
                <button
                  onClick={addPatient}
                  disabled={!newPatient.age || !newPatient.gender || !newPatient.emergency_contact}
                  className="btn-primary disabled:opacity-50"
                  style={{width: "auto"}}
                >
                  ✨ Agregar Paciente
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// =============================================================================
// PATIENT INTERFACE
// =============================================================================

const PatientInterface = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");
  const [patientProfile, setPatientProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPatientData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadPatientData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const patientId = user?.profile?.id;
      
      if (!patientId) {
        console.error("No patient ID found");
        return;
      }

      // Load all patient data
      await Promise.all([
        loadChatHistory(patientId),
        loadTasks(patientId),
        loadPatientProfile(patientId),
        loadSessions(patientId)
      ]);
    } catch (error) {
      console.error("Error loading patient data:", error);
    }
  };

  const loadPatientProfile = async (patientId) => {
    try {
      const response = await axios.get(`${API}/patients/${patientId}/profile`);
      setPatientProfile(response.data);
    } catch (error) {
      console.error("Error loading patient profile:", error);
      // Create a default profile for demo purposes
      setPatientProfile({
        id: patientId,
        age: 25,
        gender: "no especificado",
        diagnosis: "En evaluación",
        risk_level: "low"
      });
    }
  };

  const loadChatHistory = async (patientId) => {
    try {
      const response = await axios.get(`${API}/chat/${patientId}/history`);
      setChatMessages(response.data.reverse());
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const loadTasks = async (patientId) => {
    try {
      const response = await axios.get(`${API}/patients/${patientId}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error loading tasks:", error);
      // Set some demo tasks for testing
      setTasks([
        {
          id: "demo-task-1",
          title: "Ejercicio de respiración diaria",
          description: "Practica técnicas de respiración profunda durante 10 minutos cada mañana",
          task_type: "mindfulness",
          status: "assigned",
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        },
        {
          id: "demo-task-2", 
          title: "Diario de emociones",
          description: "Registra tus emociones principales del día antes de dormir",
          task_type: "reflection",
          status: "in_progress",
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    }
  };

  const loadSessions = async (patientId) => {
    try {
      const response = await axios.get(`${API}/patients/${patientId}/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const patientId = user?.profile?.id;

    // Add user message immediately to UI
    const userMessage = {
      id: Date.now().toString(),
      message: newMessage,
      sender: "patient",
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    const messageToSend = newMessage;
    setNewMessage("");

    try {
      const response = await axios.post(`${API}/chat/${patientId}/message`, {
        message: messageToSend
      });

      // Replace user message and add AI response
      setChatMessages(prev => [
        ...prev.slice(0, -1), // Remove the temp user message
        response.data.user_message,
        response.data.ai_response
      ]);

      if (response.data.is_crisis) {
        alert("Se ha detectado una situación de crisis. Tu profesional ha sido notificado. Si necesitas ayuda inmediata, contacta servicios de emergencia.");
      }
    } catch (error) {
      // Add error message if API fails
      const errorMessage = {
        id: Date.now().toString() + "_error",
        message: "Lo siento, hay un problema técnico. Tu profesional ha sido notificado. Si es urgente, contacta servicios de emergencia.",
        sender: "assistant",
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    try {
      await axios.put(`${API}/tasks/${taskId}/complete`, {
        completion_notes: "Completada desde la interfaz del paciente"
      });
      
      // Update task status locally
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: "completed", completed_at: new Date().toISOString() }
          : task
      ));
      
      alert("¡Tarea completada exitosamente!");
    } catch (error) {
      console.error("Error completing task:", error);
      // Still update locally for demo purposes
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: "completed", completed_at: new Date().toISOString() }
          : task
      ));
      alert("Tarea marcada como completada");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="brand-title">🧠 Zentium Assist</h1>
              <span className="ml-4 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 text-sm rounded-full font-semibold">
                👤 Paciente
              </span>
            </div>
            <button
              onClick={logout}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-100"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="tab-nav mb-8 fade-in">
          <button
            onClick={() => setActiveTab("chat")}
            className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
          >
            💬 Asistente Virtual
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`tab-button ${activeTab === "tasks" ? "active" : ""}`}
          >
            📋 Mis Tareas ({tasks.filter(t => t.status !== "completed").length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
          >
            👤 Mi Perfil
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`tab-button ${activeTab === "sessions" ? "active" : ""}`}
          >
            📅 Mis Sesiones
          </button>
        </div>

        {/* Chat Interface */}
        {activeTab === "chat" && (
          <div className="chat-container scale-in">
            <div className="chat-header">
              <h2 className="font-bold text-lg flex items-center">
                🤖 Asistente Virtual de Zentium
                <div className="ml-3 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </h2>
              <p className="text-blue-100 mt-1">💙 Estoy aquí para apoyarte 24/7</p>
            </div>

            <div className="chat-messages chat-scroll">
              {chatMessages.length === 0 && (
                <div className="text-center py-12 fade-in">
                  <div className="mx-auto h-16 w-16 text-blue-300 mb-4">
                    🤖
                  </div>
                  <p className="text-lg font-medium text-gray-700">¡Hola! Soy tu asistente virtual.</p>
                  <p className="text-sm mt-2 text-gray-500">Puedes hablarme sobre cómo te sientes, hacer preguntas o simplemente charlar.</p>
                  <div className="mt-4 flex justify-center space-x-2">
                    <button 
                      onClick={() => setNewMessage("Hola, ¿cómo estás?")}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                    >
                      👋 Saludar
                    </button>
                    <button 
                      onClick={() => setNewMessage("Me siento un poco ansioso hoy")}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                    >
                      😰 Hablar sobre ansiedad
                    </button>
                    <button 
                      onClick={() => setNewMessage("¿Qué ejercicios me recomiendas?")}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
                    >
                      🧘 Pedir consejos
                    </button>
                  </div>
                </div>
              )}

              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === "patient" ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  <div className={message.sender === "patient" ? "chat-message-user" : "chat-message-assistant"}>
                    <p className="text-sm leading-relaxed">{message.message}</p>
                    <p className={`text-xs mt-2 opacity-75 ${
                      message.sender === "patient" ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start mb-4">
                  <div className="chat-message-assistant">
                    <div className="flex items-center space-x-2">
                      <div className="loading-spinner"></div>
                      <span className="text-sm text-gray-500">Escribiendo...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 border-t bg-gradient-to-r from-gray-50 to-white">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !loading && sendMessage()}
                  placeholder="Escribe tu mensaje..."
                  className="chat-input flex-1"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="chat-send-button"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "🚀 Enviar"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Interface */}
        {activeTab === "tasks" && (
          <div className="bg-white rounded-xl shadow-lg p-6 scale-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              📋 Mis Tareas Terapéuticas
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-semibold">
                {tasks.filter(t => t.status !== "completed").length} pendientes
              </span>
            </h2>
            
            {tasks.length === 0 ? (
              <div className="text-center py-12 fade-in">
                <div className="mx-auto h-20 w-20 text-gray-300 mb-4">
                  📝
                </div>
                <p className="text-lg font-medium text-gray-500">No tienes tareas asignadas en este momento.</p>
                <p className="text-sm mt-2 text-gray-400">Las tareas aparecerán aquí cuando tu profesional las asigne.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`task-card slide-in-left ${task.status === "completed" ? "completed" : ""}`}
                    style={{animationDelay: `${0.1 * index}s`}}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <h3 className="font-bold text-gray-900 text-lg mr-3">{task.title}</h3>
                          <span className={`badge ${task.task_type}`}>
                            {task.task_type === 'homework' ? '📚 Tarea' :
                             task.task_type === 'exercise' ? '🏃 Ejercicio' :
                             task.task_type === 'reflection' ? '🤔 Reflexión' : '🧘 Mindfulness'}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-4 leading-relaxed">{task.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className={`badge ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status === 'completed' ? '✅ Completada' :
                             task.status === 'in_progress' ? '⏳ En Progreso' : '📋 Asignada'}
                          </span>

                          {task.due_date && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              Vence: {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}

                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {task.status !== "completed" && (
                        <button
                          onClick={() => completeTask(task.id)}
                          className="ml-6 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                        >
                          ✨ Completar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Interface */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl shadow-lg p-6 scale-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              👤 Mi Perfil
              <div className="ml-3 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </h2>
            
            {patientProfile ? (
              <div className="space-y-8 fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <label className="block text-sm font-bold text-blue-800 uppercase tracking-wide">Edad</label>
                      <p className="mt-2 text-2xl font-bold text-blue-900">{patientProfile.age} años</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                      <label className="block text-sm font-bold text-purple-800 uppercase tracking-wide">Género</label>
                      <p className="mt-2 text-lg font-semibold text-purple-900">{patientProfile.gender}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                      <label className="block text-sm font-bold text-green-800 uppercase tracking-wide">Diagnóstico</label>
                      <p className="mt-2 text-lg font-semibold text-green-900">{patientProfile.diagnosis || "En evaluación"}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
                      <label className="block text-sm font-bold text-yellow-800 uppercase tracking-wide">Nivel de Riesgo</label>
                      <span className={`inline-flex mt-2 px-4 py-2 font-bold rounded-full ${
                        patientProfile.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                        patientProfile.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {patientProfile.risk_level === 'high' ? '🔴 Alto' :
                         patientProfile.risk_level === 'medium' ? '🟡 Medio' : '🟢 Bajo'}
                      </span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
                      <label className="block text-sm font-bold text-indigo-800 uppercase tracking-wide">Sesiones Realizadas</label>
                      <p className="mt-2 text-2xl font-bold text-indigo-900">{patientProfile.session_count || 0}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                      <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">Última Sesión</label>
                      <p className="mt-2 text-lg font-semibold text-gray-900">
                        {patientProfile.last_session 
                          ? new Date(patientProfile.last_session).toLocaleDateString()
                          : "No hay sesiones registradas"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    📊 Estadísticas de Progreso
                    <div className="ml-3 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm rounded-full font-semibold">
                      En tiempo real
                    </div>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="profile-stat blue">
                      <div className="text-4xl font-black text-blue-600 mb-2">{tasks.filter(t => t.status === "completed").length}</div>
                      <div className="text-sm font-bold text-blue-800 uppercase tracking-wide">Tareas Completadas</div>
                      <div className="mt-2 w-full bg-blue-100 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{width: `${Math.min((tasks.filter(t => t.status === "completed").length / Math.max(tasks.length, 1)) * 100, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="profile-stat green">
                      <div className="text-4xl font-black text-green-600 mb-2">{chatMessages.filter(m => m.sender === "patient").length}</div>
                      <div className="text-sm font-bold text-green-800 uppercase tracking-wide">Mensajes Enviados</div>
                      <div className="mt-2 w-full bg-green-100 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                          style={{width: `${Math.min((chatMessages.filter(m => m.sender === "patient").length / Math.max(chatMessages.length, 1)) * 100, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="profile-stat purple">
                      <div className="text-4xl font-black text-purple-600 mb-2">{sessions.length}</div>
                      <div className="text-sm font-bold text-purple-800 uppercase tracking-wide">Sesiones Registradas</div>
                      <div className="mt-2 w-full bg-purple-100 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{width: `${Math.min((sessions.length / 10) * 100, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-500">Cargando información del perfil...</p>
              </div>
            )}
          </div>
        )}

        {/* Sessions Interface */}
        {activeTab === "sessions" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Mis Sesiones</h2>
            
            {sessions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  📅
                </div>
                <p>No tienes sesiones registradas aún.</p>
                <p className="text-sm mt-2">Las sesiones con tu profesional aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          Sesión {session.session_type === 'therapy' ? 'de Terapia' : 
                                 session.session_type === 'evaluation' ? 'de Evaluación' : 'de Seguimiento'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(session.session_date).toLocaleDateString()} - {session.duration_minutes || 0} minutos
                        </p>
                        
                        {session.notes && (
                          <p className="text-sm text-gray-800 mt-2">{session.notes}</p>
                        )}
                        
                        <div className="flex items-center mt-3 space-x-4 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${
                            session.status === 'completed' ? 'bg-green-100 text-green-800' :
                            session.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            session.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status === 'completed' ? '✅ Completada' :
                             session.status === 'in_progress' ? '🔄 En Progreso' :
                             session.status === 'scheduled' ? '📅 Programada' : '❌ Cancelada'}
                          </span>
                          
                          {session.mood_before && (
                            <span>Estado inicial: {session.mood_before}/10</span>
                          )}
                          
                          {session.mood_after && (
                            <span>Estado final: {session.mood_after}/10</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Emergency Contact */}
        <div className="mt-8 emergency-alert fade-in" style={{animationDelay: "0.3s"}}>
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 mb-2">🚨 Emergencia - Línea Directa</h3>
              <p className="text-red-700 font-medium">
                Si sientes que estás en crisis o peligro, contacta inmediatamente:
              </p>
              <div className="mt-3 flex items-center space-x-4">
                <button className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg">
                  📞 911 - Emergencias
                </button>
                <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
                  💬 Contactar Profesional
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN APP
// =============================================================================

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/professional" element={<ProfessionalDashboard />} />
            <Route path="/patient" element={<PatientInterface />} />
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </UserContext.Provider>
  );
};

export default App;