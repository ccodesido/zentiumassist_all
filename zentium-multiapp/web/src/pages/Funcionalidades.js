import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Funcionalidades = () => {
  const [activeTab, setActiveTab] = useState('ia');
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = {
    ia: {
      title: 'Inteligencia Artificial Avanzada',
      icon: '🧠',
      description: 'Potencia cada consulta con insights basados en evidencia científica',
      details: [
        {
          title: 'Asistente IA Conversacional',
          description: 'Chatbot inteligente que acompaña a los pacientes 24/7 con respuestas empáticas y profesionales.',
          icon: '💬'
        },
        {
          title: 'Análisis de Sentimientos',
          description: 'Detección automática del estado emocional del paciente durante las sesiones.',
          icon: '😊'
        },
        {
          title: 'Detección de Crisis',
          description: 'Sistema automático que identifica situaciones de riesgo y alerta al profesional inmediatamente.',
          icon: '🚨'
        },
        {
          title: 'Recomendaciones Terapéuticas',
          description: 'Sugerencias personalizadas de tratamientos basadas en el historial del paciente.',
          icon: '💡'
        }
      ]
    },
    seguridad: {
      title: 'Seguridad y Privacidad',
      icon: '🔒',
      description: 'Cumplimiento total con normativas de protección de datos médicos',
      details: [
        {
          title: 'Cifrado End-to-End',
          description: 'Toda la información está protegida con el más alto nivel de cifrado disponible.',
          icon: '🔐'
        },
        {
          title: 'Cumplimiento HIPAA',
          description: 'Certificación completa para el manejo de información médica sensible.',
          icon: '📋'
        },
        {
          title: 'Backups Automáticos',
          description: 'Respaldos seguros y automáticos para garantizar la continuidad del servicio.',
          icon: '💾'
        },
        {
          title: 'Control de Acceso',
          description: 'Gestión granular de permisos por roles y niveles de autorización.',
          icon: '🎫'
        }
      ]
    },
    gestion: {
      title: 'Gestión Integral',
      icon: '⚙️',
      description: 'Administra profesionales, instituciones y pacientes desde una plataforma unificada',
      details: [
        {
          title: 'Dashboard Profesional',
          description: 'Interfaz completa para gestionar pacientes, sesiones y seguimiento de progreso.',
          icon: '📊'
        },
        {
          title: 'Gestión de Citas',
          description: 'Sistema automatizado de programación y recordatorios de citas.',
          icon: '📅'
        },
        {
          title: 'Historial Clínico',
          description: 'Registro completo y estructurado de todas las sesiones y tratamientos.',
          icon: '📋'
        },
        {
          title: 'Reportes Personalizados',
          description: 'Generación automática de informes detallados para seguimiento institucional.',
          icon: '📈'
        }
      ]
    },
    analisis: {
      title: 'Análisis y Reportes',
      icon: '📊',
      description: 'Genera informes detallados y seguimiento con visualizaciones intuitivas',
      details: [
        {
          title: 'Métricas de Progreso',
          description: 'Seguimiento visual del avance terapéutico de cada paciente con gráficos interactivos.',
          icon: '📈'
        },
        {
          title: 'Estadísticas Institucionales',
          description: 'Reportes consolidados para la toma de decisiones a nivel organizacional.',
          icon: '🏢'
        },
        {
          title: 'Alertas Predictivas',
          description: 'Sistema que identifica patrones y predice posibles situaciones de riesgo.',
          icon: '⚠️'
        },
        {
          title: 'Exportación de Datos',
          description: 'Capacidad de exportar informes en múltiples formatos para uso externo.',
          icon: '📤'
        }
      ]
    }
  };

  const tabs = [
    { id: 'ia', label: 'IA Avanzada', icon: '🧠' },
    { id: 'seguridad', label: 'Seguridad', icon: '🔒' },
    { id: 'gestion', label: 'Gestión', icon: '⚙️' },
    { id: 'analisis', label: 'Análisis', icon: '📊' }
  ];

  return (
    <div className="pt-20 overflow-x-hidden">
      {/* Header */}
      <section className="py-20 bg-gradient-to-r from-zentium-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Funcionalidades
            <span className="block gradient-text bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              Revolucionarias
            </span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Descubre todas las herramientas que ZentiumAssist pone a tu disposición para transformar tu práctica profesional
          </p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-zentium-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Details */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-zentium-500 to-purple-600 rounded-3xl flex items-center justify-center text-3xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
              {features[activeTab].icon}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {features[activeTab].title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {features[activeTab].description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features[activeTab].details.map((detail, index) => (
              <div
                key={index}
                className="feature-card rounded-2xl p-8 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-zentium-500 to-purple-600 rounded-xl flex items-center justify-center text-xl mr-4 flex-shrink-0">
                    {detail.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{detail.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{detail.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Beneficios para tu
              <span className="gradient-text block">Práctica Profesional</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre cómo ZentiumAssist puede transformar tu forma de trabajar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl">
                ⏱️
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ahorra Tiempo</h3>
              <p className="text-gray-600">
                Automatiza tareas administrativas y enfócate en lo que realmente importa: tus pacientes.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl">
                🎯
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mejora Resultados</h3>
              <p className="text-gray-600">
                Con insights basados en IA, toma decisiones más informadas y efectivas.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-2xl">
                📈
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Escala tu Práctica</h3>
              <p className="text-gray-600">
                Atiende más pacientes sin comprometer la calidad del cuidado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-zentium-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para Comenzar?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Experimenta el poder de ZentiumAssist con nuestra prueba gratuita de 14 días
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/contacto"
              className="px-8 py-4 bg-white text-zentium-600 rounded-xl font-bold text-lg btn-animate btn-glow hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[250px]"
            >
              🚀 Comenzar Prueba Gratuita
            </Link>
            <Link
              to="/contacto"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-zentium-600 transition-all duration-300 min-w-[250px]"
            >
              📞 Hablar con un Experto
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Funcionalidades;