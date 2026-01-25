import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/NotificationSystem';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

interface DeliveryZone {
  id: string;
  name: string;
  coordinates: [number, number][];
  deliveryFee: number;
  estimatedTime: string;
  available: boolean;
}

// Mock delivery zones for PAMBAZO
const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-1',
    name: 'Centro',
    coordinates: [[-74.0721, 4.5981], [-74.0621, 4.5981], [-74.0621, 4.6081], [-74.0721, 4.6081]],
    deliveryFee: 3000,
    estimatedTime: '15-25 min',
    available: true
  },
  {
    id: 'zone-2',
    name: 'Norte',
    coordinates: [[-74.0821, 4.6081], [-74.0621, 4.6081], [-74.0621, 4.6281], [-74.0821, 4.6281]],
    deliveryFee: 4000,
    estimatedTime: '25-35 min',
    available: true
  },
  {
    id: 'zone-3',
    name: 'Sur',
    coordinates: [[-74.0821, 4.5681], [-74.0621, 4.5681], [-74.0621, 4.5881], [-74.0821, 4.5881]],
    deliveryFee: 4500,
    estimatedTime: '30-40 min',
    available: false
  }
];

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false
  });

  const [watchId, setWatchId] = useState<number | null>(null);
  const notify = useToast();

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: options.enableHighAccuracy ?? true,
    timeout: options.timeout ?? 10000,
    maximumAge: options.maximumAge ?? 300000 // 5 minutes
  };

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      loading: false
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Error desconocido';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Acceso a la ubicación denegado';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Ubicación no disponible';
        break;
      case error.TIMEOUT:
        errorMessage = 'Tiempo de espera agotado';
        break;
    }

    setState(prev => ({
      ...prev,
      error: errorMessage,
      loading: false
    }));

    notify.error('Error de ubicación', errorMessage);
  }, [notify]);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      const error = 'Geolocalización no soportada';
      setState(prev => ({ ...prev, error, loading: false }));
      notify.error('Error', error);
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, defaultOptions);
  }, [handleSuccess, handleError, defaultOptions, notify]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      notify.error('Error', 'Geolocalización no soportada');
      return;
    }

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    const id = navigator.geolocation.watchPosition(handleSuccess, handleError, defaultOptions);
    setWatchId(id);
  }, [handleSuccess, handleError, defaultOptions, watchId, notify]);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  useEffect(() => {
    if (options.watch) {
      startWatching();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [options.watch, startWatching, watchId]);

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    stopWatching,
    isSupported: !!navigator.geolocation
  };
};

// Hook for reverse geocoding (coordinates to address)
export const useReverseGeocoding = () => {
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notify = useToast();

  const getAddress = useCallback(async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);

    try {
      // Using a free geocoding service (OpenStreetMap Nominatim)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Error en el servicio de geocodificación');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const addressData: Address = {
        street: data.address?.road || data.address?.pedestrian,
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state,
        country: data.address?.country,
        postalCode: data.address?.postcode,
        formattedAddress: data.display_name
      };

      setAddress(addressData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      notify.error('Error de geocodificación', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  return {
    address,
    loading,
    error,
    getAddress
  };
};

// Hook for delivery zone detection
export const useDeliveryZone = () => {
  const [currentZone, setCurrentZone] = useState<DeliveryZone | null>(null);
  const [availableZones] = useState<DeliveryZone[]>(DELIVERY_ZONES);

  // Point in polygon algorithm
  const isPointInPolygon = useCallback((point: [number, number], polygon: [number, number][]) => {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const pointI = polygon[i];
      const pointJ = polygon[j];

      if (!pointI || !pointJ) continue;

      const [xi, yi] = pointI;
      const [xj, yj] = pointJ;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }, []);

  const checkDeliveryZone = useCallback((latitude: number, longitude: number) => {
    const point: [number, number] = [longitude, latitude];

    for (const zone of availableZones) {
      if (isPointInPolygon(point, zone.coordinates)) {
        setCurrentZone(zone);
        return zone;
      }
    }

    setCurrentZone(null);
    return null;
  }, [availableZones, isPointInPolygon]);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const getNearestZone = useCallback((latitude: number, longitude: number) => {
    let nearestZone: DeliveryZone | null = null;
    let minDistance = Infinity;

    for (const zone of availableZones) {
      // Calculate distance to zone center (simplified)
      const zoneCenterLat = zone.coordinates.reduce((sum, coord) => sum + coord[1], 0) / zone.coordinates.length;
      const zoneCenterLon = zone.coordinates.reduce((sum, coord) => sum + coord[0], 0) / zone.coordinates.length;

      const distance = calculateDistance(latitude, longitude, zoneCenterLat, zoneCenterLon);

      if (distance < minDistance) {
        minDistance = distance;
        nearestZone = zone;
      }
    }

    return { zone: nearestZone, distance: minDistance };
  }, [availableZones, calculateDistance]);

  return {
    currentZone,
    availableZones,
    checkDeliveryZone,
    getNearestZone,
    calculateDistance
  };
};

// Combined hook for location-based delivery
export const useLocationDelivery = () => {
  const geolocation = useGeolocation({ enableHighAccuracy: true });
  const reverseGeocoding = useReverseGeocoding();
  const deliveryZone = useDeliveryZone();
  const notify = useToast();

  const checkDeliveryAvailability = useCallback(async () => {
    if (!geolocation.latitude || !geolocation.longitude) {
      notify.warning('Ubicación requerida', 'Por favor permite el acceso a tu ubicación');
      return null;
    }

    const zone = deliveryZone.checkDeliveryZone(geolocation.latitude, geolocation.longitude);

    if (zone) {
      if (zone.available) {
        notify.success('¡Entrega disponible!', `Zona: ${zone.name} - ${zone.estimatedTime}`);
        return zone;
      } else {
        notify.warning('Zona no disponible', `La zona ${zone.name} no tiene servicio actualmente`);
        return null;
      }
    } else {
      const nearest = deliveryZone.getNearestZone(geolocation.latitude, geolocation.longitude);
      notify.info(
        'Fuera de zona de entrega',
        `La zona más cercana es ${nearest.zone?.name} (${nearest.distance.toFixed(1)}km)`
      );
      return null;
    }
  }, [geolocation.latitude, geolocation.longitude, deliveryZone, notify]);

  const getFullLocationInfo = useCallback(async () => {
    if (!geolocation.latitude || !geolocation.longitude) {
      return null;
    }

    await reverseGeocoding.getAddress(geolocation.latitude, geolocation.longitude);
    const zone = deliveryZone.checkDeliveryZone(geolocation.latitude, geolocation.longitude);

    return {
      coordinates: {
        latitude: geolocation.latitude,
        longitude: geolocation.longitude
      },
      address: reverseGeocoding.address,
      deliveryZone: zone
    };
  }, [geolocation.latitude, geolocation.longitude, reverseGeocoding, deliveryZone]);

  return {
    geolocation,
    address: reverseGeocoding.address,
    addressLoading: reverseGeocoding.loading,
    currentZone: deliveryZone.currentZone,
    availableZones: deliveryZone.availableZones,
    checkDeliveryAvailability,
    getFullLocationInfo
  };
};