import { useEffect, useState, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertTriangle, Info, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';

// Custom toast components
const CustomToast = ({
  type,
  title,
  message,
  onDismiss
}: {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onDismiss: () => void;
}) => {
  const icons = {
    success: <Check className="h-5 w-5 text-green-600" />,
    error: <AlertCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />
  };

  const colors = {
    success: 'border-green-200 bg-green-50 dark:bg-green-900/20',
    error: 'border-red-200 bg-red-50 dark:bg-red-900/20',
    warning: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20',
    info: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      className={`
        max-w-md w-full border rounded-lg p-4 shadow-lg backdrop-blur-sm
        ${colors[type]}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {title}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {message}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="flex-shrink-0 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

// Notification helper functions
export const showNotification = {
  success: (title: string, message: string) => {
    toast.custom((t) => (
      <CustomToast
        type="success"
        title={title}
        message={message}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 4000,
      position: 'top-right'
    });
  },
  error: (title: string, message: string) => {
    toast.custom((t) => (
      <CustomToast
        type="error"
        title={title}
        message={message}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 6000,
      position: 'top-right'
    });
  },
  warning: (title: string, message: string) => {
    toast.custom((t) => (
      <CustomToast
        type="warning"
        title={title}
        message={message}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 5000,
      position: 'top-right'
    });
  },
  info: (title: string, message: string) => {
    toast.custom((t) => (
      <CustomToast
        type="info"
        title={title}
        message={message}
        onDismiss={() => toast.dismiss(t.id)}
      />
    ), {
      duration: 4000,
      position: 'top-right'
    });
  }
};

// Sound effects for notifications
const playNotificationSound = (type: 'success' | 'error' | 'warning' | 'info') => {
  if ('speechSynthesis' in window) {
    // Use Web Audio API for better sound control
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const frequencies = {
      success: [523.25, 659.25, 783.99], // C5, E5, G5 (major chord)
      error: [220, 185, 165], // A3, F#3, E3 (dissonant)
      warning: [440, 554.37], // A4, C#5
      info: [523.25, 659.25] // C5, E5
    };

    const freq = frequencies[type];
    freq.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type === 'error' ? 'sawtooth' : 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3 + (index * 0.1));

      oscillator.start(audioContext.currentTime + (index * 0.1));
      oscillator.stop(audioContext.currentTime + 0.3 + (index * 0.1));
    });
  }
};

// Notification Center Component
export const NotificationCenter = () => {
  const { notifications, markNotificationAsRead, clearNotifications } = useStore();
  const markAsRead = markNotificationAsRead;
  const clearAll = clearNotifications;
  const unreadCount = notifications.filter(n => !n.read).length;
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isShaking, setIsShaking] = useState(false);
  const prevUnreadCount = useRef(unreadCount);

  // Trigger shake animation when new notifications arrive
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current && unreadCount > 0) {
      setIsShaking(true);
      if (soundEnabled) {
        // Play sound based on the latest notification type
        const latestNotification = notifications.find(n => !n.read);
        if (latestNotification) {
          playNotificationSound(latestNotification.type as any);
        }
      }
      setTimeout(() => setIsShaking(false), 600);
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount, notifications, soundEnabled]);

  const formatTime = (date: Date | string | number | undefined) => {
    if (!date) return 'Ahora';
    try {
      // Ensure we have a valid Date object
      let dateObj: Date;

      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string' || typeof date === 'number') {
        dateObj = new Date(date);
      } else {
        // Fallback to current time if invalid
        dateObj = new Date();
      }

      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Ahora';
      }

      const now = new Date();
      const diff = now.getTime() - dateObj.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Ahora';
      if (minutes < 60) return `${minutes}m`;
      if (hours < 24) return `${hours}h`;
      return `${days}d`;
    } catch (error) {
      console.warn('Error formatting time:', error);
      return 'Ahora';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <motion.div
          animate={isShaking ? {
            x: [-2, 2, -2, 2, 0],
            rotate: [-1, 1, -1, 1, 0]
          } : {}}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <Button variant="ghost" size="sm" className="relative">
            <motion.div
              animate={unreadCount > 0 ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ duration: 2, repeat: unreadCount > 0 ? Infinity : 0 }}
            >
              <Bell className="h-5 w-5" />
            </motion.div>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1"
              >
                <Badge
                  variant="destructive"
                  className="h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </Button>
        </motion.div>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              Notificaciones
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} nuevas
                </Badge>
              )}
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-xs p-1"
                title={soundEnabled ? 'Desactivar sonidos' : 'Activar sonidos'}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs"
                >
                  Limpiar todo
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          <div className="space-y-2">
            <AnimatePresence>
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay notificaciones</p>
                </motion.div>
              ) : (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/30 ${!notification.read
                        ? 'border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 shadow-md'
                        : 'hover:bg-muted/50'
                        }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (soundEnabled) {
                          // Subtle click sound
                          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                          const oscillator = audioContext.createOscillator();
                          const gainNode = audioContext.createGain();

                          oscillator.connect(gainNode);
                          gainNode.connect(audioContext.destination);

                          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                          oscillator.type = 'sine';

                          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                          gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
                          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

                          oscillator.start(audioContext.currentTime);
                          oscillator.stop(audioContext.currentTime + 0.1);
                        }
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium truncate">
                                {notification.title}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.createdAt)}
                              </span>

                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

// Main Notification System Component
export const NotificationSystem = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
            margin: 0
          }
        }}
      />
    </>
  );
};

// Hook for easy notification usage
export const useToast = () => {
  const { addNotification } = useStore();

  const notify = {
    success: (title: string, message: string) => {
      showNotification.success(title, message);
      addNotification({ title, message, type: 'success', priority: 'medium' });
    },
    error: (title: string, message: string) => {
      showNotification.error(title, message);
      addNotification({ title, message, type: 'error', priority: 'high' });
    },
    warning: (title: string, message: string) => {
      showNotification.warning(title, message);
      addNotification({ title, message, type: 'warning', priority: 'medium' });
    },
    info: (title: string, message: string) => {
      showNotification.info(title, message);
      addNotification({ title, message, type: 'info', priority: 'low' });
    }
  };

  return notify;
};