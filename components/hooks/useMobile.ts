import { useState, useEffect } from 'react';
import type { DeviceInfo } from '../../shared/types';

// Detección inteligente de dispositivo según especificaciones PAMBAZO
export function useMobile(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    hasTouch: false,
    userAgent: '',
    screenWidth: 0,
    screenHeight: 0
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Detección por tamaño de pantalla (Mobile-first approach)
      const isMobileSize = screenWidth <= 768;
      const isTabletSize = screenWidth > 768 && screenWidth <= 1024;
      const isDesktopSize = screenWidth > 1024;

      // Detección por User Agent
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

      // Detección de soporte táctil
      const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Criterio multi-factor según documentación: isMobile = isMobileSize || isMobileUA || hasTouchSupport
      const isMobile = isMobileSize || isMobileUA || (hasTouchSupport && screenWidth <= 1024);
      const isTablet = isTabletSize && !isMobile;
      const isDesktop = isDesktopSize && !isMobile && !isTablet;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        hasTouch: hasTouchSupport,
        userAgent,
        screenWidth,
        screenHeight
      });
    };

    // Detección inicial
    detectDevice();

    // Listener para cambios de tamaño
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return deviceInfo;
}

// Hook simplificado para compatibilidad con componentes existentes
export function useIsMobile(): boolean {
  const deviceInfo = useMobile();
  return deviceInfo.isMobile;
}

export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void
) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    if (e.targetTouches.length > 0) {
      setTouchStart({
        x: e.targetTouches[0]!.clientX,
        y: e.targetTouches[0]!.clientY,
      });
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.targetTouches.length > 0) {
      setTouchEnd({
        x: e.targetTouches[0]!.clientX,
        y: e.targetTouches[0]!.clientY,
      });
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      }
      if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      // Vertical swipe
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp();
      }
      if (isDownSwipe && onSwipeDown) {
        onSwipeDown();
      }
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}