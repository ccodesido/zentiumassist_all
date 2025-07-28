import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { title: 'Inicio', path: '/' },
    { title: 'Funcionalidades', path: '/funcionalidades' },
    { title: 'Contacto', path: '/contacto' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-zentium-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className={`text-2xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              Zentium Assist
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link font-medium transition-colors duration-300 ${
                  location.pathname === item.path
                    ? (isScrolled ? 'text-zentium-600 active' : 'text-white active')
                    : (isScrolled ? 'text-gray-700 hover:text-zentium-600' : 'text-white/90 hover:text-white')
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/contacto"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-zentium-600 hover:bg-gray-50' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Ver Demo
            </Link>
            <Link
              to="/contacto"
              className="px-6 py-2 bg-gradient-to-r from-zentium-500 to-purple-600 text-white rounded-lg font-medium btn-animate btn-glow transition-all duration-300 hover:shadow-lg"
            >
              Prueba Gratuita
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${
              isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                    location.pathname === item.path
                      ? 'text-zentium-600 bg-zentium-50'
                      : 'text-gray-700 hover:text-zentium-600 hover:bg-gray-50'
                  }`}
                >
                  {item.title}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-gray-200">
                <Link
                  to="/contacto"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 text-center text-gray-700 hover:text-zentium-600 font-medium"
                >
                  Ver Demo
                </Link>
                <Link
                  to="/contacto"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3 bg-gradient-to-r from-zentium-500 to-purple-600 text-white rounded-lg font-medium text-center btn-animate"
                >
                  Prueba Gratuita
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;