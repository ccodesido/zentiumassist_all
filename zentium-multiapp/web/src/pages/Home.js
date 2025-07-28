import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
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

  const features = [
    {
      title: 'Inteligencia Artificial Avanzada',
      description: 'Asistente IA que potencia cada consulta con insights basados en evidencia científica.',
      icon: '🧠',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Seguridad y Privacidad',
      description: 'Cumplimiento total con normativas de protección de datos médicos y confidencialidad.',
      icon: '🔒',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      title: 'Gestión Integral',
      description: 'Administra profesionales, instituciones y pacientes desde una plataforma unificada.',
      icon: '⚙️',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      title: 'Análisis y Reportes',
      description: 'Genera informes detallados y seguimiento de progreso con visualizaciones intuitivas.',
      icon: '📊',
      gradient: 'from-purple-500 to-pink-600'
    }
  ];

  const testimonials = [
    {
      name: 'Dra. María González',
      role: 'Psicóloga Clínica',
      content: 'ZentiumAssist ha transformado completamente mi práctica. La IA me ayuda a identificar patrones que antes pasaba por alto.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616c78c4b7d?w=100&h=100&fit=crop&crop=face',
      rating: 5
    },
    {
      name: 'Dr. Carlos Mendoza',
      role: 'Director de Clínica',
      content: 'La gestión de nuestra institución nunca fue tan eficiente. El sistema integra todo lo que necesitamos.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      rating: 5
    },
    {
      name: 'Lic. Ana Rodríguez',
      role: 'Psicóloga Infantil',
      content: 'Los tests digitales y el seguimiento automatizado me permiten enfocarme más en lo que realmente importa: mis pacientes.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      rating: 5
    }
  ];

  const stats = [
    { number: '500+', label: 'Profesionales Activos' },
    { number: '10K+', label: 'Pacientes Atendidos' },
    { number: '95%', label: 'Satisfacción' },
    { number: '24/7', label: 'Soporte Disponible' }
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center justify-center relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              El Futuro de la
              <span className="block gradient-text bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Psicología Digital
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              ZentiumAssist potencia a los profesionales de la salud mental con inteligencia artificial avanzada, 
              streamlining workflows y mejorando los resultados de tratamiento para todos los pacientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/contacto"
                className="px-8 py-4 bg-white text-zentium-600 rounded-xl font-bold text-lg btn-animate btn-glow hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[200px]"
              >
                🚀 Comenzar Prueba Gratuita
              </Link>
              <Link
                to="/contacto"
                className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-zentium-600 transition-all duration-300 min-w-[200px]"
              >
                📹 Ver Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Animation */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center"
                data-animate
                id={`stat-${index}`}
              >
                <div className={`text-4xl md:text-5xl font-bold gradient-text mb-2 ${
                  isVisible[`stat-${index}`] ? 'animate-slide-up' : 'opacity-0'
                }`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
              data-animate
              id="features-title"
            >
              Tecnología que Transforma la 
              <span className="gradient-text block">Práctica Psicológica</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre cómo ZentiumAssist revoluciona la atención en salud mental con herramientas inteligentes y flujos de trabajo optimizados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card rounded-2xl p-8 text-center ${
                  isVisible[`feature-${index}`] ? 'animate-slide-up' : 'opacity-0'
                }`}
                data-animate
                id={`feature-${index}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Lo que Dicen Nuestros
              <span className="gradient-text block">Profesionales</span>
            </h2>
            <p className="text-xl text-gray-600">
              Testimonios reales de profesionales que han transformado su práctica con ZentiumAssist
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`testimonial-card rounded-2xl p-8 ${
                  isVisible[`testimonial-${index}`] ? 'animate-slide-up' : 'opacity-0'
                }`}
                data-animate
                id={`testimonial-${index}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    <div className="flex mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 italic leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-zentium-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para Revolucionar tu Práctica?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Únete a cientos de profesionales que ya están transformando la atención en salud mental con ZentiumAssist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              to="/contacto"
              className="px-8 py-4 bg-white text-zentium-600 rounded-xl font-bold text-lg btn-animate btn-glow hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[250px]"
            >
              🎯 Solicitar Demo Gratuita
            </Link>
            <Link
              to="/funcionalidades"
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-zentium-600 transition-all duration-300 min-w-[250px]"
            >
              ⚡ Ver Funcionalidades
            </Link>
          </div>
          <p className="text-white/80 text-sm">
            ✅ Setup en 5 minutos &nbsp;&nbsp;•&nbsp;&nbsp; ✅ Soporte 24/7 &nbsp;&nbsp;•&nbsp;&nbsp; ✅ Sin compromisos
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;