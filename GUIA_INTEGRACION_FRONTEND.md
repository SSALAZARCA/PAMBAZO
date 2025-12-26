# 🎯 GUÍA DE INTEGRACIÓN FRONTEND

## 📱 Nuevas Funcionalidades Disponibles

### 1. Push Notifications

#### Inicializar en App.tsx
```typescript
import { pushNotifications } from './utils/pushNotifications';

useEffect(() => {
  const initPushNotifications = async () => {
    const initialized = await pushNotifications.initialize();
    if (initialized) {
      const hasPermission = await pushNotifications.requestPermission();
      if (hasPermission) {
        await pushNotifications.subscribe();
      }
    }
  };

  initPushNotifications();
}, []);
```

### 2. WebSocket Real-Time Updates

#### Conectar en Login
```typescript
import { wsClient } from './utils/websocket';

// Después del login exitoso
wsClient.connect(token);

// Escuchar eventos
wsClient.onOrderCreated((order) => {
  console.log('Nueva orden:', order);
  // Actualizar UI
});

wsClient.onOrderReady((order) => {
  console.log('Orden lista:', order);
  // Mostrar notificación
});
```

#### Desconectar en Logout
```typescript
wsClient.disconnect();
```

### 3. Sistema de Propinas

#### Agregar Propina
```typescript
const addTip = async (orderId: string, amount: number, paymentMethod: string) => {
  const response = await fetch(`${API_URL}/api/v1/tips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      order_id: orderId,
      amount: amount,
      payment_method: paymentMethod
    })
  });

  return await response.json();
};
```

#### Ver Propinas del Día
```typescript
const getDailyTips = async () => {
  const response = await fetch(`${API_URL}/api/v1/tips/daily-summary`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};
```

### 4. Programa de Lealtad

#### Ver Puntos del Cliente
```typescript
const getCustomerPoints = async (customerId: string) => {
  const response = await fetch(`${API_URL}/api/v1/loyalty/${customerId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};
```

#### Canjear Puntos
```typescript
const redeemPoints = async (customerId: string, points: number, description: string) => {
  const response = await fetch(`${API_URL}/api/v1/loyalty/redeem`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      customer_id: customerId,
      points: points,
      description: description
    })
  });

  return await response.json();
};
```

### 5. Sistema de Reservas

#### Crear Reserva
```typescript
const createReservation = async (data: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  notes?: string;
}) => {
  const response = await fetch(`${API_URL}/api/v1/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  return await response.json();
};
```

#### Listar Reservas
```typescript
const getReservations = async (date?: string, status?: string) => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (status) params.append('status', status);

  const response = await fetch(`${API_URL}/api/v1/reservations?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};
```

### 6. Refresh Tokens

#### Actualizar authService.ts
```typescript
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refreshToken })
  });

  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data.accessToken;
  }

  throw new Error('Failed to refresh token');
};

// Interceptor para renovar token automáticamente
const apiCall = async (url: string, options: RequestInit) => {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 401) {
      // Token expirado, intentar renovar
      const newToken = await refreshAccessToken();
      
      // Reintentar con nuevo token
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`
      };
      
      return await fetch(url, options);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};
```

### 7. Paginación

#### Usar en Listados
```typescript
const getProducts = async (page: number = 1, limit: number = 10, search?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  if (search) params.append('search', search);

  const response = await fetch(`${API_URL}/api/v1/products?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  
  // data.data contiene los items
  // data.pagination contiene { page, limit, total, totalPages }
  
  return data;
};
```

## 🎨 Componentes UI Sugeridos

### TipModal.tsx
```typescript
interface TipModalProps {
  orderId: string;
  orderTotal: number;
  onClose: () => void;
}

const TipModal: React.FC<TipModalProps> = ({ orderId, orderTotal, onClose }) => {
  const [tipPercentage, setTipPercentage] = useState(15);
  const [customAmount, setCustomAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const tipAmount = customAmount || (orderTotal * tipPercentage / 100);

  const handleSubmit = async () => {
    await addTip(orderId, tipAmount, paymentMethod);
    onClose();
  };

  return (
    // UI implementation
  );
};
```

### LoyaltyCard.tsx
```typescript
interface LoyaltyCardProps {
  customerId: string;
}

const LoyaltyCard: React.FC<LoyaltyCardProps> = ({ customerId }) => {
  const [points, setPoints] = useState(null);

  useEffect(() => {
    loadPoints();
  }, [customerId]);

  const loadPoints = async () => {
    const data = await getCustomerPoints(customerId);
    setPoints(data.data);
  };

  return (
    // UI showing points, tier, progress
  );
};
```

### ReservationForm.tsx
```typescript
const ReservationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    party_size: 2,
    reservation_date: '',
    reservation_time: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReservation(formData);
  };

  return (
    // Form UI
  );
};
```

## 📚 Documentación API

Visita `http://localhost:3001/api-docs` para ver la documentación interactiva completa de Swagger.

## 🔔 Eventos WebSocket Disponibles

### Escuchar:
- `order:created` - Nueva orden creada
- `order:status-updated` - Estado de orden actualizado
- `order:ready` - Orden lista para servir
- `table:status-changed` - Estado de mesa cambiado
- `tip:received` - Nueva propina recibida
- `reservation:created` - Nueva reserva creada
- `reservation:updated` - Reserva actualizada

### Emitir:
- `join-room` - Unirse a una sala específica
- `leave-room` - Salir de una sala

## 🚀 Próximos Pasos

1. ✅ Implementar componentes UI para propinas
2. ✅ Implementar componentes UI para lealtad
3. ✅ Implementar componentes UI para reservas
4. ✅ Integrar WebSocket en dashboards
5. ✅ Configurar service worker
6. ✅ Actualizar sistema de autenticación con refresh tokens
7. ✅ Implementar paginación en listados existentes

## 📞 Soporte

Para más información, consulta:
- Documentación Swagger: `http://localhost:3001/api-docs`
- Archivo de mejoras: `MEJORAS_IMPLEMENTADAS.md`
- Código fuente: Carpeta `api/`
