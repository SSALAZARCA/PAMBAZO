import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface SocketUser {
  id: string;
  email: string;
  role: string;
}

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as SocketUser;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as SocketUser;
    console.log(`✅ Usuario conectado: ${user.email} (${user.role})`);

    // Unirse a room según rol
    socket.join(user.role);
    socket.join(`user:${user.id}`);

    // Eventos de órdenes
    socket.on('order:created', (order) => {
      // Notificar a cocina
      io.to('kitchen').emit('new-order', order);
      // Notificar a admins/owners
      io.to('owner').to('admin').emit('new-order', order);
    });

    socket.on('order:status-updated', (order) => {
      // Notificar al mesero asignado
      if (order.waiterId) {
        io.to(`user:${order.waiterId}`).emit('order-updated', order);
      }
      // Notificar al cliente
      if (order.customerId) {
        io.to(`user:${order.customerId}`).emit('order-updated', order);
      }
      // Si está listo, notificar al mesero
      if (order.status === 'ready') {
        io.to('waiter').emit('order-ready', order);
      }
    });

    socket.on('table:status-changed', (table) => {
      // Notificar a todos los meseros y admins
      io.to('waiter').to('owner').to('admin').emit('table-updated', table);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Usuario desconectado: ${user.email}`);
    });
  });

  return io;
}
