const jwt = require('jsonwebtoken');

// JWT Secret (debe coincidir con el del servidor principal)
const JWT_SECRET = 'pambazo_secret_key_2024';

/**
 * Middleware de autenticación para WebSockets
 * Verifica el token JWT enviado por el cliente
 */
const authenticateSocket = (socket, next) => {
  try {
    // Obtener token del handshake (query params o headers)
    const token = socket.handshake.auth.token || 
                  socket.handshake.query.token ||
                  socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      console.log('❌ WebSocket: Token no proporcionado');
      return next(new Error('Token de autenticación requerido'));
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Agregar información del usuario al socket
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    socket.userRole = decoded.role;
    socket.userName = decoded.name || decoded.email;

    console.log(`✅ WebSocket: Usuario autenticado - ${socket.userEmail} (${socket.userRole})`);
    
    next();
  } catch (error) {
    console.log('❌ WebSocket: Error de autenticación:', error.message);
    next(new Error('Token inválido'));
  }
};

/**
 * Verificar si el usuario tiene permisos para un rol específico
 */
const hasRole = (socket, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  return requiredRoles.includes(socket.userRole);
};

/**
 * Verificar si el usuario es propietario del recurso
 */
const isOwner = (socket, resourceUserId) => {
  return socket.userId === resourceUserId || socket.userRole === 'owner';
};

module.exports = {
  authenticateSocket,
  hasRole,
  isOwner
};