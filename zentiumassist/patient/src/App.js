import React, { useState, useEffect } from 'react';
import './App.css';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Login component for patients
  const LoginForm = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoggingIn(true);
      setError('');

      try {
        const response = await fetch(`${backendUrl}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            role: 'patient'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Error en las credenciales');
        }
      } catch (error) {
        setError('Error de conexión. Intenta nuevamente.');
      } finally {
        setIsLoggingIn(false);
      }
    };

    return (
      <div className="login-container">
        <div className="login-background patient-theme">
          <div className="login-card">
            <div className="login-header">
              <div className="logo-section">
                <h1 className="logo-title">Zentium Assist</h1>
                <div className="logo-subtitle">
                  <span className="patient-badge">🌟 Portal Pacientes</span>
                </div>
              </div>
            </div>

            <div className="login-content">
              <h2 className="login-title">Acceso para Pacientes</h2>
              <p className="login-description">
                Ingresa a tu espacio personal de bienestar y chatea con tu asistente de IA
              </p>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Personal</label>
                  <input
                    id="email"
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                    placeholder="paciente@zentium.com"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    placeholder="••••••••"
                    className="form-input"
                    required
                  />
                </div>

                {error && (
                  <div className="error-message">
                    ⚠️ {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="login-button patient-button"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <span className="loading-spinner">🔄 Iniciando sesión...</span>
                  ) : (
                    <span>🌟 Ingresar a Mi Espacio</span>
                  )}
                </button>
              </form>

              <div className="login-footer">
                <div className="login-links">
                  <a href="/forgot-password" className="forgot-link">¿Olvidaste tu contraseña?</a>
                  <a href="/" className="back-link">← Volver al sitio principal</a>
                  <a href="/professional" className="switch-link">¿Eres profesional? Ingresa aquí</a>
                </div>
                
                <div className="test-credentials patient-credentials">
                  <h4>🔧 Credenciales de Prueba:</h4>
                  <p><strong>Paciente:</strong> paciente@zentium.com / PacientePass123!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Patient Dashboard component
  const PatientDashboard = () => {
    const [activeTab, setActiveTab] = useState('chat');
    const [messages, setMessages] = useState([
      {
        id: 1,
        text: "¡Hola! Soy tu asistente virtual. Puedes hablarme sobre cómo te sientes, hacer preguntas o simplemente charlar.",
        sender: 'assistant',
        timestamp: new Date()
      }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    };

    const sendMessage = () => {
      if (!newMessage.trim()) return;

      const userMessage = {
        id: Date.now(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          text: "Gracias por compartir conmigo. Entiendo lo que me dices. ¿Puedes contarme más sobre cómo te has sentido últimamente?",
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    };

    return (
      <div className="patient-dashboard">
        <header className="patient-header">
          <div className="header-content">
            <div className="header-left">
              <h1>🌟 Mi Espacio de Bienestar</h1>
              <p>Hola, {user?.name || 'Paciente'} - Estoy aquí para apoyarte 24/7</p>
            </div>
            <div className="header-right">
              <span className="user-role patient-role">👤 Paciente</span>
              <button onClick={handleLogout} className="logout-button patient-logout">
                🚪 Salir
              </button>
            </div>
          </div>
        </header>

        <nav className="patient-nav">
          <button 
            className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
          <button 
            className={`nav-tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            ✅ Tareas
          </button>
          <button 
            className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Perfil
          </button>
          <button 
            className={`nav-tab ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            📚 Sesiones
          </button>
        </nav>

        <main className="patient-content">
          {activeTab === 'chat' && (
            <div className="chat-container">
              <div className="chat-header">
                <h2>💝 Estoy aquí para apoyarte 24/7</h2>
                <p>Puedes hablarme sobre cómo te sientes, hacer preguntas o simplemente charlar.</p>
                <div className="quick-actions">
                  <button className="quick-btn">👋 Saludar</button>
                  <button className="quick-btn">😟 Hablar sobre ansiedad</button>
                  <button className="quick-btn">🙋 Pedir consejos</button>
                </div>
              </div>

              <div className="messages-container">
                {messages.map(message => (
                  <div key={message.id} className={`message ${message.sender}`}>
                    <div className="message-content">
                      <p>{message.text}</p>
                      <span className="message-time">
                        {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="message-input-container">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="message-input"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage} className="send-button">
                  🚀 Enviar
                </button>
              </div>

              <div className="emergency-banner">
                <h3>🚨 Emergencia - Línea Directa</h3>
                <p>Si sientes que estás en crisis o peligro, contacta inmediatamente:</p>
                <div className="emergency-buttons">
                  <button className="emergency-btn">📞 911 - Emergencias</button>
                  <button className="emergency-btn">💙 Contactar Profesional</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="tasks-container">
              <h2>✅ Mis Tareas de Bienestar</h2>
              <div className="tasks-list">
                <div className="task-card">
                  <h3>🧘 Ejercicio de Respiración</h3>
                  <p>Practica respiración profunda por 5 minutos</p>
                  <button className="task-complete">Marcar como Completa</button>
                </div>
                <div className="task-card">
                  <h3>📝 Registro de Emociones</h3>
                  <p>Anota cómo te sientes hoy en una escala del 1-10</p>
                  <button className="task-complete">Marcar como Completa</button>
                </div>
                <div className="task-card completed">
                  <h3>🚶 Caminar 10 minutos</h3>
                  <p>Sal a caminar para despejar tu mente</p>
                  <span className="completed-badge">✅ Completada</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-container">
              <h2>👤 Mi Perfil</h2>
              <div className="profile-card">
                <div className="profile-info">
                  <h3>Información Personal</h3>
                  <p><strong>Nombre:</strong> {user?.name || 'Paciente'}</p>
                  <p><strong>Email:</strong> {user?.email || 'No disponible'}</p>
                  <p><strong>Miembro desde:</strong> Enero 2025</p>
                </div>
                <div className="progress-info">
                  <h3>Mi Progreso</h3>
                  <div className="progress-stats">
                    <div className="stat">
                      <span className="stat-number">15</span>
                      <span className="stat-label">Días activo</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">42</span>
                      <span className="stat-label">Conversaciones</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">8</span>
                      <span className="stat-label">Tareas completadas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="sessions-container">
              <h2>📚 Mi Historial de Sesiones</h2>
              <div className="sessions-list">
                <div className="session-card">
                  <div className="session-date">Hoy, 14:30</div>
                  <h3>Sesión de Chat con IA</h3>
                  <p>Conversación sobre manejo de ansiedad y técnicas de relajación</p>
                  <span className="session-duration">Duración: 25 min</span>
                </div>
                <div className="session-card">
                  <div className="session-date">Ayer, 16:15</div>
                  <h3>Ejercicios de Respiración</h3>
                  <p>Práctica guiada de técnicas de respiración profunda</p>
                  <span className="session-duration">Duración: 10 min</span>
                </div>
                <div className="session-card">
                  <div className="session-date">3 días atrás, 19:45</div>
                  <h3>Registro Emocional</h3>
                  <p>Evaluación del estado emocional y patrones de pensamiento</p>
                  <span className="session-duration">Duración: 15 min</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === 'patient') {
          setUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">Cargando tu espacio personal...</div>
      </div>
    );
  }

  return isAuthenticated ? <PatientDashboard /> : <LoginForm />;
}

export default App;