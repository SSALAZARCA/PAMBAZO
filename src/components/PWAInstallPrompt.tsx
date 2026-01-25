import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, Download, Smartphone } from 'lucide-react';

interface PWAInstallPromptProps {
  onDismiss?: () => void;
}

export function PWAInstallPrompt({ onDismiss }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const checkStandalone = () => {
      setIsStandalone(
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      );
    };

    // Check if iOS
    const checkIOS = () => {
      setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    };

    checkStandalone();
    checkIOS();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
  };

  // Don't show if already installed or running as PWA
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Instalar PAMBAZO
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {isIOS
                ? 'Añade esta app a tu pantalla de inicio para acceso rápido'
                : 'Instala la app para una mejor experiencia y acceso offline'
              }
            </p>

            {isIOS ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  1. Toca el botón de compartir en Safari
                </p>
                <p className="text-xs text-muted-foreground">
                  2. Selecciona "Añadir a pantalla de inicio"
                </p>
                <Button size="sm" variant="outline" onClick={handleDismiss} className="w-full">
                  Entendido
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleInstallClick} className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Instalar
                </Button>
                <Button size="sm" variant="outline" onClick={handleDismiss}>
                  Ahora no
                </Button>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-shrink-0 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PWAInstallPrompt;