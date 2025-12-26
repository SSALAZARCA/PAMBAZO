# 📁 Estructura del Proyecto PAMBAZO

## 🏗️ Arquitectura General

```
pambazo-bakery-management/
├── 📄 App.tsx                    # Componente principal con detección móvil
├── 📄 index.html                 # HTML principal optimizado para PWA
├── 📄 package.json              # Dependencias y scripts del proyecto
├── 📄 vite.config.ts            # Configuración de Vite + PWA
├── 📄 tsconfig.json             # Configuración TypeScript
├── 📄 tailwind.config.js        # Configuración Tailwind v4
├── 📄 README.md                 # Documentación principal
├── 📄 deployment-guide.md       # Guía completa de deployment
├── 📄 CHANGELOG.md              # Historial de cambios
├── 📄 project-structure.md      # Este archivo
│
├── 📂 components/               # Componentes React
│   ├── 📂 mobile/              # Componentes optimizados para móvil
│   ├── 📂 ui/                  # Componentes UI reutilizables (shadcn)
│   ├── 📂 hooks/               # Custom hooks
│   ├── 📂 figma/               # Componentes específicos de Figma
│   └── 📄 [Desktop Components] # Componentes para desktop
│
├── 📂 styles/                   # Estilos globales
│   └── 📄 globals.css          # CSS global con variables y utilidades móvil
│
├── 📂 public/                   # Archivos estáticos
│   ├── 📄 manifest.json        # Manifiesto PWA
│   └── 🖼️ [Icons & Images]     # Iconos para PWA y assets
│
└── 📂 guidelines/               # Documentación y guías
    └── 📄 Guidelines.md         # Guías de desarrollo
```

## 📱 Componentes Móviles (`/components/mobile/`)

### 🔑 Componentes Principales
```
mobile/
├── 📄 MobileLoginPage.tsx       # Login optimizado para móvil
├── 📄 MobileCustomerDashboard.tsx   # Dashboard del cliente
├── 📄 MobileWaiterDashboard.tsx     # Dashboard del mesero  
├── 📄 MobileAdminDashboard.tsx      # Dashboard del administrador
└── 📄 MobileOwnerDashboard.tsx      # Dashboard del propietario
```

### 🧩 Componentes de Navegación Móvil
```
components/
├── 📄 MobileHeader.tsx          # Header con notificaciones y menú
├── 📄 MobileBottomNav.tsx       # Navegación inferior por tabs
└── 📄 PWAInstallPrompt.tsx      # Prompt para instalación PWA
```

### 🎣 Custom Hooks
```
hooks/
└── 📄 useMobile.ts              # Hook para detección móvil y gestos
```

## 🖥️ Componentes Desktop

### 📊 Dashboards Desktop
```
components/
├── 📄 LoginPage.tsx             # Login para desktop
├── 📄 CustomerDashboard.tsx     # Dashboard cliente desktop
├── 📄 WaiterDashboard.tsx       # Dashboard mesero desktop
├── 📄 AdminDashboard.tsx        # Dashboard admin desktop
└── 📄 OwnerDashboard.tsx        # Dashboard propietario desktop
```

### 🔧 Componentes de Gestión
```
components/
├── 📄 OrderManagement.tsx       # Gestión de pedidos
├── 📄 InventoryManagement.tsx   # Gestión de inventario
├── 📄 ProductManagement.tsx     # Gestión de productos
├── 📄 TableManagement.tsx       # Gestión de mesas
├── 📄 PaymentManagement.tsx     # Gestión de pagos
├── 📄 DeliveryManagement.tsx    # Gestión de entregas
└── 📄 StatsOverview.tsx         # Resumen de estadísticas
```

### 📱 Componentes Móvil Legacy
```
components/
├── 📄 MobileOrderManagement.tsx  # Gestión pedidos móvil (legacy)
└── 📄 MobileProductManagement.tsx # Gestión productos móvil (legacy)
```

## 🎨 Sistema de UI (`/components/ui/`)

### 📦 Componentes Primitivos (shadcn/ui)
```
ui/
├── 📄 button.tsx               # Botones con variantes
├── 📄 card.tsx                 # Cards para contenido
├── 📄 input.tsx                # Inputs de formulario
├── 📄 label.tsx                # Labels accesibles
├── 📄 select.tsx               # Selectores dropdown
├── 📄 dialog.tsx               # Modales y diálogos
├── 📄 sheet.tsx                # Panels laterales/inferiores
├── 📄 tabs.tsx                 # Navegación por pestañas
├── 📄 badge.tsx                # Badges de estado
├── 📄 progress.tsx             # Barras de progreso
├── 📄 avatar.tsx               # Avatares de usuario
├── 📄 toast.tsx/sonner.tsx     # Notificaciones toast
└── 📄 [30+ more components]    # Componentes adicionales UI
```

### 🛠️ Utilidades UI
```
ui/
├── 📄 utils.ts                 # Utilidades para clases CSS
└── 📄 use-mobile.ts            # Hook móvil (duplicado)
```

## 🎨 Sistema de Estilos

### 🌈 Variables CSS (`styles/globals.css`)
```css
:root {
  /* Colores principales */
  --primary: #ea580c;           /* Naranja panadería */
  --secondary: #f97316;         /* Naranja secundario */
  --background: #ffffff;        /* Fondo claro */
  --foreground: #0a0a0a;        /* Texto principal */
  
  /* Variables móviles específicas */
  --font-size: 16px;            /* 14px en móvil */
  --touch-target: 44px;         /* Mínimo para touch */
  --safe-area-*: env(...);      /* Safe areas iOS */
}
```

### 📱 Utilidades Móviles
```css
/* Utilidades específicas para móvil */
.touch-target { min-height: 44px; min-width: 44px; }
.mobile-scroll { -webkit-overflow-scrolling: touch; }
.tap-highlight-none { -webkit-tap-highlight-color: transparent; }
.safe-area-* { padding-*: env(safe-area-inset-*); }
```

## ⚙️ Configuración del Proyecto

### 📦 Gestión de Dependencias (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.2.0",           // Framework principal
    "lucide-react": "^0.400.0",   // Iconos
    "@radix-ui/*": "^1.0.0+",     // Primitivos UI
    "recharts": "^2.12.7",        // Gráficos
    "tailwindcss": "^4.0.0",      // Estilos
    "class-variance-authority": "^0.7.0", // Variantes CSS
    "clsx": "^2.1.1",             // Utilidades CSS
    "tailwind-merge": "^2.3.0"    // Merge de clases
  }
}
```

### 🔧 Build Tool (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [
    react(),                      // Support React
    VitePWA({                    // PWA capabilities
      registerType: 'autoUpdate',
      includeAssets: [...],
      manifest: { ... },
      workbox: { ... }
    })
  ],
  resolve: {
    alias: {                     // Path aliases
      '@': '/src',
      '@/components': '/components'
    }
  }
});
```

### 🔤 TypeScript (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,               // Strict type checking
    "noUnusedLocals": true,       // No unused variables
    "exactOptionalPropertyTypes": true
  }
}
```

## 📱 PWA Configuration

### 🌐 Web App Manifest (`public/manifest.json`)
```json
{
  "name": "PAMBAZO - Sistema de Gestión de Panadería",
  "short_name": "PAMBAZO",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#ea580c",
  "background_color": "#ffffff",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192" },
    { "src": "icon-512.png", "sizes": "512x512" }
  ],
  "shortcuts": [...]            // App shortcuts
}
```

### 🔧 Service Worker (Auto-generado por Vite PWA)
- Caching estratégico de assets
- Offline fallbacks
- Background sync preparado
- Push notifications ready

## 🎯 Patrones de Arquitectura

### 🔄 Detección de Dispositivo
```typescript
// App.tsx - Patrón principal
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkDevice = () => {
    const isMobileSize = window.innerWidth < 768;
    const isMobileUA = /Android|iPhone/.test(navigator.userAgent);
    const hasTouch = 'ontouchstart' in window;
    setIsMobile(isMobileSize || isMobileUA || hasTouch);
  };
}, []);

// Renderizado condicional
return isMobile ? <MobileComponent /> : <DesktopComponent />;
```

### 🎨 Patrón de Componentes
```typescript
// Estructura típica de componente móvil
interface MobileComponentProps {
  user: User;
  onLogout: () => void;
}

export function MobileComponent({ user, onLogout }: MobileComponentProps) {
  const [activeTab, setActiveTab] = useState('default');
  const swipeHandlers = useSwipeGesture(/* ... */);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MobileHeader user={user} onLogout={onLogout} />
      <main {...swipeHandlers}>{content}</main>
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
```

### 🎭 Gestión de Estado
```typescript
// Sin estado global - useState hooks locales
const [orders, setOrders] = useState<Order[]>([]);
const [cart, setCart] = useState<CartItem[]>([]);
const [activeTab, setActiveTab] = useState('catalog');

// Datos mock para demostración
const mockOrders = [...];
const mockProducts = [...];
```

## 🔀 Flujo de Datos

### 🔐 Autenticación Mock
```
LoginPage → handleLogin() → setCurrentUser() → Route to Dashboard
```

### 🛒 Flujo de Pedido Cliente
```
Catalog → addToCart() → ShoppingCart → Checkout → Order History
```

### 👨‍💼 Flujo Mesero
```
Orders Tab → Create Order → Assign Table → Track Status → Complete
```

### 📊 Flujo Admin/Owner
```
Dashboard → View Metrics → Manage Inventory → Supervise Operations
```

## 🚀 Scripts de Desarrollo

### 📋 Comandos Disponibles
```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Build optimizado para producción  
npm run preview      # Preview del build local
npm run lint         # Linting con ESLint
npm run type-check   # Verificación TypeScript
```

### 🔧 Personalización
- **Colores**: Modificar variables CSS en `globals.css`
- **Componentes**: Extender componentes en `/components/ui/`
- **Datos**: Reemplazar arrays mock con API calls
- **Funcionalidades**: Agregar nuevos tabs/páginas siguiendo patrones existentes

## 📚 Documentación Adicional

- [`README.md`](./README.md) - Guía principal de instalación y uso
- [`deployment-guide.md`](./deployment-guide.md) - Guía completa de deployment
- [`CHANGELOG.md`](./CHANGELOG.md) - Historial de versiones
- [`guidelines/Guidelines.md`](./guidelines/Guidelines.md) - Guías de desarrollo

---

Esta estructura está diseñada para ser **escalable**, **mantenible** y **fácil de extender** con nuevas funcionalidades conforme crezcan las necesidades del negocio.