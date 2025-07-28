import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Header */}
      <header className="hero-section">
        <nav className="nav-bar">
          <div className="nav-container">
            <div className="logo">
              <h2 className="text-2xl font-bold text-blue-600">Zentium Assist</h2>
            </div>
            <div className="nav-links">
              <a href="#funcionalidades" className="nav-link">Funcionalidades</a>
              <a href="#precios" className="nav-link">Precios</a>
              <a href="#contacto" className="nav-link">Contacto</a>
              <div className="auth-buttons">
                <a href="/professional" className="btn btn-secondary">Acceso Profesionales</a>
                <a href="/patient" className="btn btn-primary">Acceso Pacientes</a>
              </div>
            </div>
          </div>
        </nav>

        <div className="hero-content">
          <h1 className="hero-title">El Futuro de la Psicología Digital</h1>
          <p className="hero-subtitle">
            ZentiumAssist potencia a los profesionales de la salud mental con inteligencia artificial avanzada, 
            streamlining workflows y mejorando los resultados de tratamiento para todos los pacientes.
          </p>
          <div className="hero-buttons">
            <a href="#contacto" className="btn btn-primary btn-large">Comenzar Prueba Gratuita</a>
            <a href="#demo" className="btn btn-secondary btn-large">Ver Demo</a>
          </div>
          <p className="trust-text">📊 Confiado por más de 500 profesionales</p>
        </div>
      </header>

      {/* Dashboard Preview */}
      <section className="dashboard-preview">
        <div className="container">
          <div className="dashboard-mockup">
            <div className="dashboard-header">
              <div className="dashboard-nav">
                <span className="nav-item active">🤖 IA Assistant</span>
                <span className="nav-item">👥 Pacientes</span>
                <span className="nav-item">📊 Reportes</span>
              </div>
            </div>
            <div className="dashboard-content">
              <div className="ai-suggestions">
                <h3>Sugerencias IA</h3>
                <div className="suggestion">• Trastorno de ansiedad generalizada</div>
                <div className="suggestion">• Episodio depresivo leve</div>
                <div className="ai-accuracy">Precisión IA: <strong>85%</strong></div>
              </div>
              <div className="stats-grid">
                <div className="stat">
                  <div className="stat-number">24</div>
                  <div className="stat-label">Pacientes Hoy</div>
                </div>
                <div className="stat">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Profesionales Activos</div>
                </div>
                <div className="stat">
                  <div className="stat-number">15,000+</div>
                  <div className="stat-label">Pacientes Tratados</div>
                </div>
                <div className="stat">
                  <div className="stat-number">98%</div>
                  <div className="stat-label">Satisfacción</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section" id="funcionalidades">
        <div className="container">
          <h2 className="section-title">Tecnología que Transforma la Práctica Psicológica</h2>
          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-icon">🧠</div>
              <h3>Inteligencia Artificial Avanzada</h3>
              <p>Asistente IA que potencia cada consulta con insights basados en evidencia científica.</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">🔒</div>
              <h3>Seguridad y Privacidad</h3>
              <p>Cumplimiento total con normativas de protección de datos médicos y confidencialidad.</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">⚙️</div>
              <h3>Gestión Integral</h3>
              <p>Administra profesionales, instituciones y pacientes desde una plataforma unificada.</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon">📈</div>
              <h3>Análisis y Reportes</h3>
              <p>Genera informes detallados y seguimiento de progreso con visualizaciones intuitivas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">Lo que Dicen Nuestros Profesionales</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-avatar">
                <img src="https://images.unsplash.com/photo-1494790108755-2616c78c4b7d?w=100&h=100&fit=crop&crop=face" alt="Dra. María González" />
              </div>
              <div className="testimonial-content">
                <p>"ZentiumAssist ha transformado completamente mi práctica. La IA me ayuda a identificar patrones que antes pasaba por alto."</p>
                <div className="testimonial-author">
                  <strong>Dra. María González</strong>
                  <span>Psicóloga Clínica</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-avatar">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="Dr. Carlos Mendoza" />
              </div>
              <div className="testimonial-content">
                <p>"La gestión de nuestra institución nunca fue tan eficiente. El sistema integra todo lo que necesitamos."</p>
                <div className="testimonial-author">
                  <strong>Dr. Carlos Mendoza</strong>
                  <span>Director de Clínica</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-avatar">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" alt="Lic. Ana Rodríguez" />
              </div>
              <div className="testimonial-content">
                <p>"Los tests digitales y el seguimiento automatizado me permiten enfocarme más en lo que realmente importa: mis pacientes."</p>
                <div className="testimonial-author">
                  <strong>Lic. Ana Rodríguez</strong>
                  <span>Psicóloga Infantil</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta" id="contacto">
        <div className="container">
          <h2 className="cta-title">¿Listo para Revolucionar tu Práctica?</h2>
          <p className="cta-description">
            Únete a cientos de profesionales que ya están transformando la atención en salud mental con ZentiumAssist.
          </p>
          <div className="cta-buttons">
            <a href="mailto:info@zentiumassist.com" className="btn btn-primary btn-large">Solicitar Demo Gratuita</a>
            <a href="#funcionalidades" className="btn btn-secondary btn-large">Ver Funcionalidades</a>
          </div>
          <div className="cta-features">
            <span className="feature">⚡ Setup en 5 minutos</span>
            <span className="feature">🔧 Soporte 24/7</span>
            <span className="feature">✨ Sin compromisos</span>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="container">
          <h3>Mantente al día con las últimas innovaciones</h3>
          <p>Recibe actualizaciones sobre nuevas funcionalidades, casos de estudio y mejores prácticas en psicología digital.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="tu@email.com" className="newsletter-input" />
            <button className="btn btn-primary">Suscribirse</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Zentium Assist</h3>
              <p>Transformando la psicología con inteligencia artificial</p>
            </div>
            <div className="footer-section">
              <h4>Producto</h4>
              <a href="#funcionalidades">Funcionalidades</a>
              <a href="#precios">Precios</a>
              <a href="/professional">Para Profesionales</a>
              <a href="/patient">Para Pacientes</a>
            </div>
            <div className="footer-section">
              <h4>Soporte</h4>
              <a href="#contacto">Contacto</a>
              <a href="#ayuda">Ayuda</a>
              <a href="#docs">Documentación</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Zentium Assist. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;