const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de proxies para cada aplicación
const webProxy = createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
  ws: true,
  logLevel: 'silent'
});

const professionalProxy = createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/professional': '',
  },
  logLevel: 'silent'
});

const patientProxy = createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/patient': '',
  },
  logLevel: 'silent'
});

const apiProxy = createProxyMiddleware({
  target: 'http://localhost:8001',
  changeOrigin: true,
  ws: true,
  logLevel: 'silent'
});

// Rutas
app.use('/api', apiProxy);
app.use('/professional', professionalProxy);
app.use('/patient', patientProxy);
app.use('/', webProxy);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Router server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- / -> Web app (port 3003)');
  console.log('- /professional -> Professional app (port 3001)');
  console.log('- /patient -> Patient app (port 3002)');
  console.log('- /api -> API server (port 8001)');
});