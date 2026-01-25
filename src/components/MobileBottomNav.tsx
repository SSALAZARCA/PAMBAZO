import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Home, ShoppingCart, User, Search, Heart, Clock, Utensils, BarChart3, Settings, Users, ChefHat, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { User as UserType } from '../shared/types';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user?: UserType;
}

// 🥖 PAMBAZO - Navegación Móvil con Gestos Swipe
// Bottom navigation adaptativo por rol con soporte para gestos táctiles

export function MobileBottomNav({ activeTab, onTabChange, user }: MobileBottomNavProps) {
  const { cart, getUnreadCount } = useStore();
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  const unreadCount = getUnreadCount();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Configuración de tabs por rol
  const getTabsByRole = (role?: UserType['role']) => {
    switch (role) {
      case 'customer':
        return [
          { id: 'catalog', label: 'Catálogo', icon: Home, badge: null },
          { id: 'search', label: 'Buscar', icon: Search, badge: null },
          { id: 'cart', label: 'Carrito', icon: ShoppingCart, badge: cartItemCount > 0 ? cartItemCount : null },
          { id: 'orders', label: 'Pedidos', icon: Clock, badge: unreadCount > 0 ? unreadCount : null },
          { id: 'profile', label: 'Perfil', icon: User, badge: null },
        ];
      case 'waiter':
        return [
          { id: 'tables', label: 'Mesas', icon: Utensils, badge: null },
          { id: 'orders', label: 'Pedidos', icon: Clock, badge: unreadCount > 0 ? unreadCount : null },
          { id: 'kitchen', label: 'Cocina', icon: ChefHat, badge: null },
          { id: 'customers', label: 'Clientes', icon: Users, badge: null },
          { id: 'profile', label: 'Perfil', icon: User, badge: null },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Panel', icon: BarChart3, badge: null },
          { id: 'orders', label: 'Pedidos', icon: Clock, badge: unreadCount > 0 ? unreadCount : null },
          { id: 'inventory', label: 'Inventario', icon: Package, badge: null },
          { id: 'staff', label: 'Personal', icon: Users, badge: null },
          { id: 'settings', label: 'Config', icon: Settings, badge: null },
        ];
      case 'owner':
        return [
          { id: 'overview', label: 'Panel', icon: BarChart3, badge: null },
          { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
          { id: 'inventory', label: 'Inventario', icon: Package, badge: null },
          { id: 'orders', label: 'Pedidos', icon: Clock, badge: unreadCount > 0 ? unreadCount : null },
          { id: 'manage', label: 'Gestión', icon: Settings, badge: null },
        ];
      default:
        return [
          { id: 'home', label: 'Inicio', icon: Home, badge: null },
          { id: 'search', label: 'Buscar', icon: Search, badge: null },
          { id: 'favorites', label: 'Favoritos', icon: Heart, badge: null },
          { id: 'orders', label: 'Pedidos', icon: Clock, badge: null },
          { id: 'profile', label: 'Perfil', icon: User, badge: null },
        ];
    }
  };

  const tabs = getTabsByRole(user?.role);

  // Encontrar índice del tab activo
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (activeIndex !== -1) {
      setCurrentTabIndex(activeIndex);
    }
  }, [activeTab, tabs]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      if (touch) {
        setSwipeStartX(touch.clientX);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX === null) return;

    if (!e.changedTouches || e.changedTouches.length === 0) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const swipeEndX = touch.clientX;
    const swipeDistance = swipeStartX - swipeEndX;
    const minSwipeDistance = 50; // Distancia mínima para activar swipe

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0 && currentTabIndex < tabs.length - 1) {
        // Swipe izquierda - siguiente tab
        const nextTab = tabs[currentTabIndex + 1];
        if (nextTab) onTabChange(nextTab.id);
        // Vibración táctil
        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      } else if (swipeDistance < 0 && currentTabIndex > 0) {
        // Swipe derecha - tab anterior
        const prevTab = tabs[currentTabIndex - 1];
        if (prevTab) onTabChange(prevTab.id);
        // Vibración táctil
        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      }
    }

    setSwipeStartX(null);
  };

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    // Vibración táctil suave
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  const getRoleColor = (role?: UserType['role']) => {
    switch (role) {
      case 'customer': return 'from-blue-500 to-blue-600';
      case 'waiter': return 'from-green-500 to-green-600';
      case 'admin': return 'from-purple-500 to-purple-600';
      case 'owner': return 'from-amber-500 to-amber-600';
      default: return 'from-orange-500 to-red-500';
    }
  };

  return (
    <>
      {/* Indicador de swipe */}
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex gap-1">
          {tabs.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-1 rounded-full transition-all duration-200 ${index === currentTabIndex
                ? `bg-gradient-to-r ${getRoleColor(user?.role)}`
                : 'bg-gray-300'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        ref={navRef}
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-orange-200 z-50 safe-area-inset-bottom"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Indicador de tab activo */}
        <div
          className={`absolute top-0 h-1 bg-gradient-to-r ${getRoleColor(user?.role)} transition-all duration-300 ease-out`}
          style={{
            width: `${100 / tabs.length}%`,
            left: `${(currentTabIndex * 100) / tabs.length}%`,
          }}
        />

        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                variant="ghost"
                className={`flex flex-col items-center gap-1 h-auto py-3 px-2 relative transition-all duration-200 touch-manipulation ${isActive
                  ? `text-transparent bg-gradient-to-r ${getRoleColor(user?.role)} bg-clip-text`
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                onClick={() => handleTabClick(tab.id)}
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'
                  }`}>
                  <Icon className={`h-6 w-6 transition-colors duration-200 ${isActive
                    ? `text-transparent bg-gradient-to-r ${getRoleColor(user?.role)} bg-clip-text`
                    : 'text-gray-500'
                    }`} />

                  {/* Badge de notificaciones */}
                  {tab.badge && (
                    <Badge
                      className={`absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center font-bold animate-pulse bg-gradient-to-r ${getRoleColor(user?.role)} text-white border-2 border-white`}
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </Badge>
                  )}
                </div>

                <span className={`text-xs font-medium transition-all duration-200 ${isActive
                  ? `text-transparent bg-gradient-to-r ${getRoleColor(user?.role)} bg-clip-text font-bold`
                  : 'text-gray-500'
                  }`}>
                  {tab.label}
                </span>

                {/* Indicador de tab activo */}
                {isActive && (
                  <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r ${getRoleColor(user?.role)} animate-pulse`} />
                )}
              </Button>
            );
          })}
        </div>

        {/* Indicador de gestos swipe */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* Overlay para prevenir scroll cuando se hace swipe */}
      <div className="fixed bottom-0 left-0 right-0 h-20 pointer-events-none z-40" />
    </>
  );
}