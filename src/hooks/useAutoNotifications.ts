import { useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { PAMBAZO } from '../shared/types';
type UserRole = PAMBAZO.UserRole;

export const useAutoNotifications = (userRole: UserRole) => {
  const addNotification = useStore(state => state.addNotification);
  const orders = useStore(state => state.orders);
  const inventory = useStore(state => state.inventory);
  const cart = useStore(state => state.cart);

  // Generate automatic notifications based on events
  const generateNotification = useCallback((type: 'order' | 'inventory' | 'cart' | 'system', data?: any) => {
    switch (type) {
      case 'order':
        if (userRole === 'waiter') {
          addNotification({
            type: 'info',
            title: '🍽️ Nuevo Pedido',
            message: `Mesa ${data?.table || Math.floor(Math.random() * 10) + 1} ha realizado un pedido.`,
            priority: 'high'
          });
        } else if (userRole === 'admin' || userRole === 'owner') {
          addNotification({
            type: 'success',
            title: '💰 Venta Registrada',
            message: `Nuevo pedido por $${data?.total || '25.000'} registrado.`,
            priority: 'medium'
          });
        }
        break;

      case 'inventory':
        if (userRole === 'admin' || userRole === 'owner') {
          const lowStockItems = inventory.filter(item => item.currentStock < item.minStock);
          if (lowStockItems.length > 0) {
            addNotification({
              type: 'warning',
              title: '📦 Stock Bajo',
              message: `${lowStockItems.length} productos necesitan reposición.`,
              priority: 'high'
            });
          }
        }
        break;

      case 'cart':
        if (userRole === 'customer' && cart.length > 0) {
          // Remind about cart after 10 minutes of inactivity
          setTimeout(() => {
            addNotification({
              type: 'info',
              title: '🛒 Carrito Pendiente',
              message: 'Tienes productos en tu carrito. ¡No olvides completar tu pedido!',
              priority: 'medium'
            });
          }, 600000); // 10 minutes
        }
        break;

      case 'system':
        // System-wide notifications
        addNotification({
          type: 'info',
          title: '🔔 Notificación del Sistema',
          message: data?.message || 'El sistema ha sido actualizado.',
          priority: 'low'
        });
        break;
    }
  }, [userRole, addNotification, inventory, cart]);

  // Auto-generate notifications based on role and events
  useEffect(() => {
    const interval = setInterval(() => {
      switch (userRole) {
        case 'customer':
          // Random promotional notifications
          if (Math.random() < 0.1) { // 10% chance every interval
            const promos = [
              '🍕 ¡Nueva pizza especial disponible!',
              '🥤 Bebida gratis con tu próximo pedido',
              '⭐ ¡Gana puntos de lealtad con cada compra!',
              '🎉 Descuento especial para clientes frecuentes'
            ];
            addNotification({
              type: 'info',
              title: 'Oferta Especial',
              message: promos[Math.floor(Math.random() * promos.length)] || '',
              priority: 'low'
            });
          }
          break;

        case 'waiter':
          // Random table notifications
          if (Math.random() < 0.15) { // 15% chance
            const tableEvents = [
              'Mesa 3 solicita la cuenta',
              'Mesa 7 necesita más servilletas',
              'Mesa 2 pregunta por el menú del día',
              'Mesa 5 está lista para ordenar'
            ];
            addNotification({
              type: 'warning',
              title: '📋 Atención Requerida',
              message: tableEvents[Math.floor(Math.random() * tableEvents.length)] || '',
              priority: 'high'
            });
          }
          break;

        case 'admin':
          // Random system alerts
          if (Math.random() < 0.08) { // 8% chance
            const alerts = [
              'Revisar inventario de ingredientes',
              'Actualizar precios del menú',
              'Verificar reportes de ventas',
              'Revisar feedback de clientes'
            ];
            addNotification({
              type: 'info',
              title: '⚙️ Tarea Administrativa',
              message: alerts[Math.floor(Math.random() * alerts.length)] || '',
              priority: 'medium'
            });
          }
          break;

        case 'owner':
          // Random business insights
          if (Math.random() < 0.05) { // 5% chance
            const insights = [
              'Ventas aumentaron 12% esta semana',
              'Nuevo récord de pedidos diarios',
              'Cliente frecuente alcanzó nivel VIP',
              'Producto más vendido: Arepa con Queso'
            ];
            addNotification({
              type: 'success',
              title: '📊 Insight de Negocio',
              message: insights[Math.floor(Math.random() * insights.length)] || '',
              priority: 'medium'
            });
          }
          break;

        case 'employee':
          // Random work reminders
          if (Math.random() < 0.12) { // 12% chance
            const reminders = [
              'Recordar limpiar las mesas',
              'Verificar temperatura de refrigeradores',
              'Preparar reporte de turno',
              'Revisar lista de tareas pendientes'
            ];
            addNotification({
              type: 'info',
              title: '📝 Recordatorio',
              message: reminders[Math.floor(Math.random() * reminders.length)] || '',
              priority: 'medium'
            });
          }
          break;
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [userRole, addNotification]);

  // Monitor orders for real-time notifications
  useEffect(() => {
    if (orders && orders.length > 0) {
      const latestOrder = orders[orders.length - 1];
      if (latestOrder && latestOrder.status === 'pending' && (userRole === 'waiter' || userRole === 'admin')) {
        generateNotification('order', { table: latestOrder.id || '?', total: latestOrder.total });
      }
    }
  }, [orders, generateNotification, userRole]);

  // Monitor inventory for low stock alerts
  useEffect(() => {
    if (userRole === 'admin' || userRole === 'owner') {
      const lowStockItems = inventory.filter(item => item.currentStock < item.minStock);
      if (lowStockItems.length > 0) {
        generateNotification('inventory');
      }
    }
  }, [inventory, generateNotification, userRole]);

  return {
    generateNotification
  };
};