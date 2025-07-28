import React, { useState, useEffect } from 'react';
import './App.css';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Login component for professionals
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
            role: 'professional'
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
        <div className="login-background">
          <div className="login-card">
            <div className="login-header">
              <div className="logo-section">
                <h1 className="logo-title">Zentium Assist</h1>
                <div className="logo-subtitle">
                  <span className="professional-badge">👨‍⚕️ Portal Profesionales</span>
                </div>
              </div>
            </div>

            <div className="login-content">
              <h2 className="login-title">Acceso para Profesionales</h2>
              <p className="login-description">
                Ingresa a tu dashboard profesional para gestionar pacientes y revisar análisis de IA
              </p>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Institucional</label>
                  <input
                    id="email"
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                    placeholder="profesional@zentium.com"
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
                  className="login-button"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <span className="loading-spinner">🔄 Iniciando sesión...</span>
                  ) : (
                    <span>🔐 Iniciar Sesión Profesional</span>
                  )}
                </button>
              </form>

              <div className="login-footer">
                <div className="login-links">
                  <a href="/forgot-password" className="forgot-link">¿Olvidaste tu contraseña?</a>
                  <a href="/" className="back-link">← Volver al sitio principal</a>
                  <a href="/patient" className="switch-link">¿Eres paciente? Ingresa aquí</a>
                </div>
                
                <div className="test-credentials">
                  <h4>🔧 Credenciales de Prueba:</h4>
                  <p><strong>Profesional:</strong> test@zentium.com / TestPass123!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Professional Dashboard component
  const Dashboard = () => {
    const [activeView, setActiveView] = useState('patients');
    const [patients, setPatients] = useState([]);
    const [crisisAlerts, setCrisisAlerts] = useState([]);

    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    };

    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <h1>Zentium Assist - Dashboard Profesional</h1>
              <p>Bienvenido/a, {user?.name || 'Profesional'}</p>
            </div>
            <div className="header-right">
              <span className="user-role">👨‍⚕️ Profesional</span>
              <button onClick={handleLogout} className="logout-button">
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        <nav className="dashboard-nav">
          <button 
            className={`nav-item ${activeView === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveView('patients')}
          >
            👥 Mis Pacientes
          </button>
          <button 
            className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveView('analytics')}
          >
            📊 Análisis IA
          </button>
          <button 
            className={`nav-item ${activeView === 'crisis' ? 'active' : ''}`}
            onClick={() => setActiveView('crisis')}
          >
            🚨 Alertas de Crisis
          </button>
          <button 
            className={`nav-item ${activeView === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveView('reports')}
          >
            📋 Reportes
          </button>
        </nav>

        <main className="dashboard-content">
          {activeView === 'patients' && (
            <div className="patients-view">
              <h2>Gestión de Pacientes</h2>
              <div className="patients-stats">
                <div className="stat-card">
                  <div className="stat-number">24</div>
                  <div className="stat-label">Pacientes Activos</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">8</div>
                  <div className="stat-label">Consultas Hoy</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">3</div>
                  <div className="stat-label">Alertas Pendientes</div>
                </div>
              </div>
              <div className="patients-table">
                <p className="placeholder-text">Dashboard completo de pacientes disponible próximamente...</p>
              </div>
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="analytics-view">
              <h2>Análisis de IA</h2>
              <div className="analytics-cards">
                <div className="analytics-card">
                  <h3>🧠 Patrones Detectados</h3>
                  <p>La IA ha identificado 12 patrones relevantes en las sesiones de esta semana.</p>
                </div>
                <div className="analytics-card">
                  <h3>📈 Precisión del Modelo</h3>
                  <p>Precisión actual: <strong>87%</strong> en detección de estados emocionales.</p>
                </div>
                <div className="analytics-card">
                  <h3>💡 Recomendaciones</h3>
                  <p>5 nuevas recomendaciones de tratamiento generadas por IA.</p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'crisis' && (
            <div className="crisis-view">
              <h2>🚨 Centro de Alertas de Crisis</h2>
              <div className="crisis-alerts">
                <div className="alert-card high-priority">
                  <div className="alert-header">
                    <span className="alert-priority">ALTA PRIORIDAD</span>
                    <span className="alert-time">Hace 15 min</span>
                  </div>
                  <p><strong>Paciente #1247:</strong> Lenguaje suicida detectado en conversación.</p>
                  <button className="alert-action">Ver Detalles</button>
                </div>
                <div className="alert-card medium-priority">
                  <div className="alert-header">
                    <span className="alert-priority">MEDIA PRIORIDAD</span>
                    <span className="alert-time">Hace 2 horas</span>
                  </div>
                  <p><strong>Paciente #0892:</strong> Incremento significativo en ansiedad.</p>
                  <button className="alert-action">Ver Detalles</button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'reports' && (
            <div className="reports-view">
              <h2>📋 Reportes y Estadísticas</h2>
              <div className="reports-grid">
                <div className="report-card">
                  <h3>Reporte Semanal</h3>
                  <p>Progreso de pacientes y métricas de sesiones</p>
                  <button className="generate-report">Generar PDF</button>
                </div>
                <div className="report-card">
                  <h3>Análisis Mensual</h3>
                  <p>Tendencias y patrones identificados por IA</p>
                  <button className="generate-report">Generar PDF</button>
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
        if (user.role === 'professional') {
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
        <div className="loading-spinner">Cargando dashboard...</div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}

export default App;