import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

// Environment configuration for professional subdomain
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://29d5ee5e-06ed-4e16-bd1a-5f58ec0324b4.preview.emergentagent.com";
const API = `${BACKEND_URL}/api`;

// =============================================================================
// AUTHENTICATION COMPONENTS
// =============================================================================

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          navigate("/dashboard");
        } else {
          alert("Esta aplicación es solo para profesionales. Accede a patients.zentium.com");
        }
      } else {
        await axios.post(`${API}/auth/register`, { email, password, name, role: "professional" });
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
          <h1 className="brand-title">🧠 Zentium Assist</h1>
          <p className="brand-subtitle">Plataforma Profesional de Salud Mental</p>
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
            <label className="form-label">Email Profesional</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="profesional@clinica.com"
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

          <button
            type="submit"
            className="btn-primary scale-in"
            style={{animationDelay: "0.4s"}}
          >
            {isLogin ? "🚀 Acceder al Dashboard" : "✨ Registrar Profesional"}
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
            <p><strong>Email:</strong> test@zentium.com</p>
            <p><strong>Contraseña:</strong> TestPass123!</p>
          </div>
        </div>

        {/* Links to other apps */}
        <div className="mt-6 text-center text-xs text-gray-500 fade-in" style={{animationDelay: "0.7s"}}>
          <p>¿Eres paciente? <a href="https://patients.zentium.com" className="text-blue-600 hover:underline">Accede aquí</a></p>
          <p>¿Necesitas información? <a href="https://web.zentium.com" className="text-blue-600 hover:underline">Visita nuestro sitio</a></p>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PROFESSIONAL DASHBOARD - Complete component from original
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
            <div className="flex items-center space-x-4">
              <a 
                href="https://web.zentium.com" 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-100"
              >
                🌐 Web Principal
              </a>
              <button
                onClick={logout}
                className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-100"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
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
                    <button 
                      onClick={() => showCrisisDetail(alert)}
                      className="ml-3 px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors">
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

      {/* Crisis Details Modal */}
      {showCrisisDetails && selectedCrisis && (
        <>
          <div 
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCrisisDetails(false);
              }
            }}
          >
            <div className="modal-content scale-in" onClick={(e) => e.stopPropagation()} style={{maxWidth: "40rem"}}>
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-900 mb-2">🚨 Alerta de Crisis - Detalles</h3>
                <p className="text-red-700">Información completa del incidente</p>
              </div>
              
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                  <h4 className="text-lg font-bold text-red-900 mb-3 flex items-center">
                    👤 Información del Paciente
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-red-800">ID:</strong> 
                      <span className="text-red-700 ml-2">#{selectedCrisis.patient_id?.slice(-6) || 'N/A'}</span>
                    </div>
                    <div>
                      <strong className="text-red-800">Edad:</strong> 
                      <span className="text-red-700 ml-2">{selectedCrisis.patient?.age || 'Desconocido'} años</span>
                    </div>
                    <div>
                      <strong className="text-red-800">Género:</strong> 
                      <span className="text-red-700 ml-2">{selectedCrisis.patient?.gender || 'No disponible'}</span>
                    </div>
                    <div>
                      <strong className="text-red-800">Nivel de Riesgo:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                        selectedCrisis.patient?.risk_level === 'high' ? 'bg-red-200 text-red-800' :
                        selectedCrisis.patient?.risk_level === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {selectedCrisis.patient?.risk_level === 'high' ? '🔴 Alto' :
                         selectedCrisis.patient?.risk_level === 'medium' ? '🟡 Medio' : '🟢 Bajo'}
                      </span>
                    </div>
                  </div>
                  {selectedCrisis.patient?.emergency_contact && (
                    <div className="mt-3 p-3 bg-red-100 rounded-lg">
                      <strong className="text-red-800">Contacto de Emergencia:</strong>
                      <p className="text-red-700 font-medium">{selectedCrisis.patient.emergency_contact}</p>
                    </div>
                  )}
                </div>

                {/* Crisis Message */}
                <div className="bg-gradient-to-r from-red-100 to-red-50 rounded-xl p-4 border-2 border-red-300">
                  <h4 className="text-lg font-bold text-red-900 mb-3 flex items-center">
                    💬 Mensaje de Crisis
                  </h4>
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <p className="text-red-800 font-medium leading-relaxed">"{selectedCrisis.message}"</p>
                    <div className="mt-3 flex items-center justify-between text-sm text-red-600">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {new Date(selectedCrisis.timestamp).toLocaleString()}
                      </span>
                      <span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs font-bold animate-pulse">
                        CRISIS DETECTADA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Chat History */}
                {selectedCrisis.chatHistory && selectedCrisis.chatHistory.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                      📝 Conversación Reciente (Contexto)
                    </h4>
                    <div className="max-h-60 overflow-y-auto space-y-3">
                      {selectedCrisis.chatHistory.slice(-5).map((msg, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            msg.sender === "patient" 
                              ? "bg-blue-100 border-l-4 border-blue-500" 
                              : "bg-gray-100 border-l-4 border-gray-500"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm">
                              {msg.sender === "patient" ? "👤 Paciente" : "🤖 Asistente"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">{msg.message}</p>
                          {msg.is_crisis && (
                            <span className="inline-block mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                              ⚠️ MENSAJE DE CRISIS
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Recommendations */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <h4 className="text-lg font-bold text-green-900 mb-3 flex items-center">
                    ✅ Acciones Recomendadas
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center p-2 bg-green-100 rounded-lg">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                      <span className="text-green-800 font-medium">Contactar inmediatamente al paciente por teléfono</span>
                    </div>
                    <div className="flex items-center p-2 bg-green-100 rounded-lg">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                      <span className="text-green-800 font-medium">Evaluar la necesidad de intervención inmediata</span>
                    </div>
                    <div className="flex items-center p-2 bg-green-100 rounded-lg">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
                      <span className="text-green-800 font-medium">Documentar la intervención en el historial del paciente</span>
                    </div>
                    <div className="flex items-center p-2 bg-green-100 rounded-lg">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">4</span>
                      <span className="text-green-800 font-medium">Considerar derivación a servicios de emergencia si es necesario</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={() => alert("Función de contacto directo en desarrollo")}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    📞 Contactar Paciente
                  </button>
                  <button
                    onClick={() => alert("Función de derivación en desarrollo")}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    🏥 Derivar a Emergencias
                  </button>
                </div>
                <button
                  onClick={() => setShowCrisisDetails(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ❌ Cerrar
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
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProfessionalDashboard />} />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;