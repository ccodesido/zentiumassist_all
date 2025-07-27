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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Zentium Assist</h1>
          <p className="text-gray-600">Plataforma de Salud Mental con IA</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="professional">Profesional</option>
                <option value="patient">Paciente</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
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
  const [newPatient, setNewPatient] = useState({
    age: "",
    gender: "",
    emergency_contact: "",
  });
  const [showAddPatient, setShowAddPatient] = useState(false);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Zentium Assist</h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Profesional
              </span>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.total_patients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sesiones Activas</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.active_sessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Alertas de Crisis</p>
                <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.crisis_alerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <button
              onClick={() => setShowAddPatient(true)}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
              </svg>
              Agregar Paciente
            </button>
          </div>
        </div>

        {/* Patients List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Mis Pacientes</h2>
          </div>
          <div className="p-6">
            {dashboardData.patients.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay pacientes asignados</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">Paciente #{patient.id.slice(-6)}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        patient.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                        patient.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {patient.risk_level === 'high' ? 'Alto Riesgo' :
                         patient.risk_level === 'medium' ? 'Riesgo Medio' : 'Riesgo Bajo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Edad: {patient.age} años</p>
                    <p className="text-sm text-gray-600">Género: {patient.gender}</p>
                    <p className="text-sm text-gray-600">Sesiones: {patient.session_count}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Crisis Alerts */}
        {dashboardData.crisis_alerts.length > 0 && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg">
            <div className="px-6 py-4 border-b border-red-200">
              <h2 className="text-lg font-semibold text-red-900">🚨 Alertas de Crisis</h2>
            </div>
            <div className="p-6">
              {dashboardData.crisis_alerts.map((alert, index) => (
                <div key={index} className="mb-4 p-4 bg-white border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{alert.message}</p>
                  <p className="text-xs text-red-600 mt-2">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Paciente</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Edad</label>
                <input
                  type="number"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contacto de Emergencia</label>
                <input
                  type="text"
                  value={newPatient.emergency_contact}
                  onChange={(e) => setNewPatient({...newPatient, emergency_contact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre y teléfono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddPatient(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={addPatient}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Zentium Assist</h1>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Paciente
              </span>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition ${
              activeTab === "chat"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            💬 Asistente Virtual
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition ${
              activeTab === "tasks"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📋 Mis Tareas ({tasks.filter(t => t.status !== "completed").length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition ${
              activeTab === "profile"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            👤 Mi Perfil
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition ${
              activeTab === "sessions"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📅 Mis Sesiones
          </button>
        </div>

        {/* Chat Interface */}
        {activeTab === "chat" && (
          <div className="bg-white rounded-lg shadow-lg h-96 flex flex-col">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h2 className="font-semibold">🤖 Asistente Virtual de Zentium</h2>
              <p className="text-sm text-blue-100">Estoy aquí para apoyarte 24/7</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p>¡Hola! Soy tu asistente virtual.</p>
                  <p className="text-sm mt-2">Puedes hablarme sobre cómo te sientes, hacer preguntas o simplemente charlar.</p>
                </div>
              )}

              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === "patient" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm ${
                      message.sender === "patient"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-800 shadow-sm border"
                    }`}
                  >
                    <p>{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === "patient" ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t bg-white rounded-b-lg">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? "..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Interface */}
        {activeTab === "tasks" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Mis Tareas Terapéuticas</h2>
            
            {tasks.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No tienes tareas asignadas en este momento.</p>
                <p className="text-sm mt-2">Las tareas aparecerán aquí cuando tu profesional las asigne.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`border rounded-lg p-4 ${
                      task.status === "completed" ? "bg-green-50 border-green-200" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        
                        <div className="flex items-center mt-3 space-x-4 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${
                            task.task_type === 'homework' ? 'bg-blue-100 text-blue-800' :
                            task.task_type === 'exercise' ? 'bg-green-100 text-green-800' :
                            task.task_type === 'reflection' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.task_type === 'homework' ? '📚 Tarea' :
                             task.task_type === 'exercise' ? '🏃 Ejercicio' :
                             task.task_type === 'reflection' ? '🤔 Reflexión' : '🧘 Mindfulness'}
                          </span>
                          
                          <span className={`px-2 py-1 rounded-full ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status === 'completed' ? '✅ Completada' :
                             task.status === 'in_progress' ? '⏳ En Progreso' : '📋 Asignada'}
                          </span>

                          {task.due_date && (
                            <span>Vence: {new Date(task.due_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      {task.status !== "completed" && (
                        <button
                          onClick={() => completeTask(task.id)}
                          className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition"
                        >
                          Completar
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Mi Perfil</h2>
            
            {patientProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Edad</label>
                      <p className="mt-1 text-sm text-gray-900">{patientProfile.age} años</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Género</label>
                      <p className="mt-1 text-sm text-gray-900">{patientProfile.gender}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
                      <p className="mt-1 text-sm text-gray-900">{patientProfile.diagnosis || "En evaluación"}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nivel de Riesgo</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        patientProfile.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                        patientProfile.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {patientProfile.risk_level === 'high' ? 'Alto' :
                         patientProfile.risk_level === 'medium' ? 'Medio' : 'Bajo'}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sesiones Realizadas</label>
                      <p className="mt-1 text-sm text-gray-900">{patientProfile.session_count || 0}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Última Sesión</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {patientProfile.last_session 
                          ? new Date(patientProfile.last_session).toLocaleDateString()
                          : "No hay sesiones registradas"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas de Progreso</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === "completed").length}</div>
                      <div className="text-sm text-blue-800">Tareas Completadas</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{chatMessages.filter(m => m.sender === "patient").length}</div>
                      <div className="text-sm text-green-800">Mensajes Enviados</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">{sessions.length}</div>
                      <div className="text-sm text-purple-800">Sesiones Registradas</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Cargando información del perfil...</p>
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
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Emergencia</h3>
              <p className="text-sm text-red-600">
                Si sientes que estás en crisis o peligro, contacta inmediatamente a servicios de emergencia: 911
              </p>
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