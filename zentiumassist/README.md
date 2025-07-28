# Zentium Assist - Proyecto Reestructurado

## 📁 Estructura del Proyecto

```
/app/zentiumassist/
├── web/                    # Web corporativa (web.zentium.com)
│   ├── src/
│   │   ├── components/     # Header, Footer
│   │   ├── pages/         # Home, Funcionalidades, Contacto
│   │   └── App.js
│   └── package.json
│
├── professional/          # Dashboard profesional (professional.zentium.com)
│   ├── src/
│   │   └── App.js        # Login + Dashboard completo
│   └── package.json
│
├── patient/              # Interfaz pacientes (patients.zentium.com)
│   ├── src/
│   │   └── App.js        # Login + Interfaz completa de pacientes
│   └── package.json
│
└── api/                  # Backend APIs (api.zentium.com)
    ├── server.py         # FastAPI con todos los endpoints
    ├── requirements.txt
    └── .env
```

## 🌐 Subodominios Configurados

### 1. **Web Corporativa** - web.zentium.com
- Landing page con información del producto
- Páginas: Inicio, Funcionalidades, Contacto
- Formulario de contacto y solicitud de demos
- Testimonios y características del sistema

### 2. **Dashboard Profesional** - professional.zentium.com
- Login específico para profesionales
- Gestión completa de pacientes
- Alertas de crisis con modal detallado
- Estadísticas y analytics
- Sistema de agregar pacientes

### 3. **Interfaz de Pacientes** - patients.zentium.com
- Login específico para pacientes
- Chat con asistente IA 24/7
- Sistema de tareas terapéuticas
- Perfil con estadísticas de progreso
- Historial de sesiones

### 4. **Backend API** - api.zentium.com
- FastAPI con arquitectura de microservicios
- Integración OpenAI para IA
- Sistema de detección de crisis
- MongoDB con modelos compatibles MariaDB

## 🎯 Funcionalidades Implementadas

### Web Corporativa ✅
- [x] Página de inicio con hero section
- [x] Sección de funcionalidades con tabs interactivos
- [x] Formulario de contacto funcional
- [x] Testimonios de profesionales
- [x] Diseño responsive moderno
- [x] Navegación fluida entre páginas

### Dashboard Profesional ✅
- [x] Sistema de autenticación
- [x] Dashboard con estadísticas en tiempo real
- [x] Gestión de pacientes con tarjetas visuales
- [x] Alertas de crisis con modal detallado
- [x] Sistema para agregar nuevos pacientes
- [x] Integración completa con backend

### Interfaz de Pacientes ✅
- [x] Sistema de autenticación específico
- [x] Chat con asistente IA funcional
- [x] Sistema de tareas con completado
- [x] Perfil con estadísticas dinámicas
- [x] Historial de sesiones
- [x] Sección de emergencia prominente
- [x] 4 tabs navegables (Chat, Tareas, Perfil, Sesiones)

### Backend API ✅
- [x] Todos los endpoints funcionando
- [x] Integración OpenAI real
- [x] Detección de crisis automática
- [x] Sistema de tareas completo
- [x] Gestión de sesiones
- [x] Analytics y reportes

## 🔧 Tecnologías Utilizadas

- **Frontend**: React 19, React Router, Tailwind CSS, Axios
- **Backend**: FastAPI, Python, emergentintegrations
- **Database**: MongoDB (diseñado compatible con MariaDB)
- **AI**: OpenAI GPT-4o para chat y análisis
- **Estilos**: Tailwind CSS con diseño glassmorphism

## 🚀 URLs de Desarrollo

- **Proyecto original**: https://90308466-a382-4768-a654-5790138beb2d.preview.emergentagent.com
- **Backend API**: https://90308466-a382-4768-a654-5790138beb2d.preview.emergentagent.com/api

## 📊 Estado del Proyecto

### ✅ Completado (100%)
- Web corporativa completa
- Aplicación profesional independiente
- Aplicación de pacientes independiente
- Backend API funcionando
- Integración OpenAI activa
- Detección de crisis operativa

### 🔄 Próximo (Para deployment)
- Configuración de subodominios
- Variables de entorno por aplicación
- Scripts de deployment
- Documentación técnica

## 🎮 Credenciales de Prueba

### Profesional
- **Email**: test@zentium.com
- **Contraseña**: TestPass123!

### Paciente
- **Email**: paciente@zentium.com
- **Contraseña**: PacientePass123!

## 📝 Notas Importantes

1. Todas las aplicaciones están funcionalmente independientes
2. El backend está listo para manejar múltiples frontends
3. La IA está completamente integrada y funcional
4. El sistema de crisis detection está operativo
5. Cada aplicación tiene su propio package.json y configuración

---

✨ **Zentium Assist está listo para deployment en arquitectura de subodominios**