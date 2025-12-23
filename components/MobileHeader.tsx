import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Bell, Menu, User, LogOut, Settings, Cookie, Sun, Moon, Shield, ShoppingBasket } from 'lucide-react';
import { useStore, useTheme } from '../store/useStore';
import type { User as UserType } from '../shared/types';

interface MobileHeaderProps {
  user: UserType;
  onLogout: () => void;
  title?: string;
  showNotifications?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
  cartItemCount?: number;
  onCartClick?: () => void;
  notifications?: number; // fallback/alias
}

// 🥖 PAMBASO - Header Móvil Contextual
// Header optimizado para móvil con notificaciones badge y menú de usuario
export function MobileHeader({
  user,
  onLogout,
  title = 'PAMBAZO',
  showNotifications = true,
  showBackButton = false,
  onBackClick,
  cartItemCount,
  onCartClick
}: MobileHeaderProps) {
  // const notifications = useNotifications();
  const theme = useTheme();
  const { toggleTheme, getUnreadCount } = useStore();

  const unreadCount = getUnreadCount();

  const getRoleInfo = (role: UserType['role']) => {
    const roleConfig = {
      customer: { icon: '👤', label: 'Cliente', color: 'bg-blue-100 text-blue-800' },
      waiter: { icon: '🍽️', label: 'Mesero', color: 'bg-green-100 text-green-800' },
      admin: { icon: '⚙️', label: 'Administrador', color: 'bg-purple-100 text-purple-800' },
      owner: { icon: '👑', label: 'Propietario', color: 'bg-amber-100 text-amber-800' },
      baker: { icon: '🧑‍🍳', label: 'Panadero', color: 'bg-orange-100 text-orange-800' },
      kitchen: { icon: '👨‍🍳', label: 'Cocina', color: 'bg-red-100 text-red-800' },
      cocina: { icon: '👨‍🍳', label: 'Cocina', color: 'bg-red-100 text-red-800' },
      employee: { icon: '👷', label: 'Empleado', color: 'bg-gray-100 text-gray-800' },
      propietario: { icon: '👑', label: 'Propietario', color: 'bg-amber-100 text-amber-800' }
    };
    return roleConfig[role] || roleConfig.customer;
  };

  const roleInfo = getRoleInfo(user.role);

  const handleNotificationClick = () => {
    // En una implementación real, abriría un panel de notificaciones
    console.log('Opening notifications panel');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 safe-area-inset-top">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side - Logo, back button y título contextual */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showBackButton && onBackClick ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              className="p-2 touch-manipulation"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <Menu className="h-5 w-5" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-amber-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Cookie className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-foreground leading-tight">{title}</span>
                <span className="text-xs text-muted-foreground">{roleInfo.label}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right side - Notificaciones y menú de usuario */}
        <div className="flex items-center gap-2">
          {/* Botón de Carrito */}
          {onCartClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCartClick}
              className="relative p-2 touch-manipulation"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <ShoppingBasket className="h-5 w-5" />
              {cartItemCount !== undefined && cartItemCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse"
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Botón de notificaciones con badge */}
          {showNotifications && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
              className="relative p-2 touch-manipulation"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-pulse"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-11 w-11 rounded-full p-0 touch-manipulation"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <Avatar className="h-10 w-10 border-2 border-orange-200">
                  <AvatarFallback className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-800 font-bold">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                {/* Indicador de rol */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  <span className="text-xs">{roleInfo.icon}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              {/* Información del usuario */}
              <div className="flex items-center justify-start gap-3 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-800 font-bold">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 leading-none flex-1">
                  <p className="font-semibold text-base">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                  <Badge variant="secondary" className={`w-fit text-xs ${roleInfo.color}`}>
                    {roleInfo.icon} {roleInfo.label}
                  </Badge>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Opciones del menú */}
              <DropdownMenuItem className="py-3">
                <User className="mr-3 h-5 w-5" />
                <span className="text-base">Mi Perfil</span>
              </DropdownMenuItem>

              {/* Toggle de tema */}
              <DropdownMenuItem onClick={toggleTheme} className="py-3">
                {theme === 'dark' ? (
                  <Sun className="mr-3 h-5 w-5" />
                ) : (
                  <Moon className="mr-3 h-5 w-5" />
                )}
                <span className="text-base">
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem className="py-3">
                <Settings className="mr-3 h-5 w-5" />
                <span className="text-base">Configuración</span>
              </DropdownMenuItem>

              {/* Opciones específicas por rol */}
              {(user.role === 'admin' || user.role === 'owner') && (
                <>
                  <DropdownMenuItem className="py-3">
                    <Shield className="mr-3 h-5 w-5" />
                    <span className="text-base">Panel de Control</span>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />

              {/* Cerrar sesión */}
              <DropdownMenuItem
                onClick={onLogout}
                className="py-3 text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span className="text-base font-medium">Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Indicador de notificaciones no leídas */}
      {unreadCount > 0 && (
        <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500 animate-pulse" />
      )}
    </header>
  );
}