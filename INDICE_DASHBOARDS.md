# 📚 Índice de Dashboards Premium - PAMBAZO 2.1

## 🎯 Acceso Rápido

### Por Rol

| Rol | Dashboard | Ruta | Archivo |
|-----|-----------|------|---------|
| 👨‍💼 Admin | Panel de Administración | `/admin` | `src/pages/admin/AdminDashboardHome.tsx` |
| 👨‍🍳 Baker | Panel de Panadería | `/baker` | `src/pages/baker/BakerDashboardHome.tsx` |
| 💼 Owner | Panel de Propietario | `/owner` | `src/pages/owner/OwnerDashboardHome.tsx` |
| 🍳 Kitchen | Panel de Cocina | `/kitchen` | `src/pages/kitchen/KitchenDashboardHome.tsx` |
| 🍽️ Waiter | Panel de Mesero | `/waiter` | `src/pages/waiter/WaiterDashboardHome.tsx` |
| 👤 Customer | Panel de Cliente | `/customer` | `src/pages/customer/CustomerDashboardHome.tsx` |

---

## 📊 Métricas por Dashboard

### AdminDashboard
- **Usuarios Totales** (blue)
- **Productos** (green)
- **Pedidos del Mes** (purple)
- **Ingresos** (orange)

### BakerDashboard
- **Hornos Activos** (orange)
- **Productos Listos** (green)
- **En Producción** (blue)
- **Producción Hoy** (purple)

### OwnerDashboard
- **Ingresos Totales** (green)
- **Pedidos** (blue)
- **Clientes** (purple)
- **Ticket Promedio** (orange)

### KitchenDashboard
- **Pedidos Pendientes** (orange)
- **En Preparación** (blue)
- **Completados Hoy** (green)
- **Tiempo Promedio** (purple)

### WaiterDashboard
- **Mis Mesas** (blue)
- **Pedidos Activos** (orange)
- **Completados Hoy** (green)
- **Ventas del Día** (purple)

### CustomerDashboard
- **Mis Pedidos** (blue)
- **Favoritos** (red)
- **Puntos** (orange)
- **Última Orden** (purple)

---

## 🎨 Paleta de Colores

### Variantes de StatCard
```css
orange: bg-orange-50 border-orange-200 text-orange-600
green:  bg-green-50 border-green-200 text-green-600
blue:   bg-blue-50 border-blue-200 text-blue-600
purple: bg-purple-50 border-purple-200 text-purple-600
red:    bg-red-50 border-red-200 text-red-600
```

---

## 🔧 Componentes Compartidos

### DashboardLayout
```tsx
import { DashboardLayout } from '../../layouts/DashboardLayout';

<DashboardLayout user={user} onLogout={onLogout}>
  {/* Contenido del dashboard */}
</DashboardLayout>
```

### StatCard
```tsx
import { StatCard } from '../../components/ui/StatCard';

<StatCard
  title="Título"
  value={123}
  icon={IconComponent}
  color="orange"
  trend={{ value: 12, isPositive: true }}
  subtitle="Texto adicional"
/>
```

### ProtectedRoute
```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

<Route element={<ProtectedRoute allowedRoles={['admin']} />}>
  <Route index element={<AdminDashboardHome />} />
</Route>
```

---

## 📱 Navegación del Sidebar

### Admin
- 📊 Dashboard
- 👥 Usuarios
- 📦 Productos
- 📈 Reportes

### Baker
- 📊 Dashboard
- 🔥 Hornos
- 📦 Producción
- 📋 Inventario

### Owner
- 📊 Dashboard
- 💰 Finanzas
- 📈 Análisis
- 👥 Personal

### Kitchen
- 📊 Dashboard
- 🍳 Órdenes
- ⏱️ Tiempos
- 📋 Recetas

### Waiter
- 📊 Dashboard
- 🪑 Mesas
- 📝 Pedidos
- 💵 Cuentas

### Customer
- 📊 Dashboard
- 🛒 Menú
- ❤️ Favoritos
- 📦 Pedidos

---

## 🚀 Comandos de Desarrollo

```bash
# Iniciar frontend
npm run dev

# Iniciar backend
npm run server:dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

---

## 📝 Guía de Uso

### Para Agregar un Nuevo Dashboard

1. **Crear archivo**:
   ```
   src/pages/[role]/[Role]DashboardHome.tsx
   ```

2. **Importar componentes**:
   ```tsx
   import { DashboardLayout } from '../../layouts/DashboardLayout';
   import { StatCard } from '../../components/ui/StatCard';
   import { User } from '../../../shared/types';
   ```

3. **Definir props**:
   ```tsx
   interface [Role]DashboardProps {
     user: User;
     onLogout: () => void;
   }
   ```

4. **Usar DashboardLayout**:
   ```tsx
   export const [Role]Dashboard: React.FC<[Role]DashboardProps> = ({ user, onLogout }) => {
     return (
       <DashboardLayout user={user} onLogout={onLogout}>
         {/* Contenido */}
       </DashboardLayout>
     );
   };
   ```

5. **Agregar a App.tsx**:
   ```tsx
   import [Role]DashboardHome from './pages/[role]/[Role]DashboardHome';
   
   // En getDashboardComponent:
   case '[role]': return <[Role]DashboardHome user={user!} onLogout={handleLogout} />;
   ```

---

## 🎯 Testing

### URLs de Prueba
```
http://localhost:5173/                  → Landing Page
http://localhost:5173/login             → Login
http://localhost:5173/dashboard         → Dashboard según rol
http://localhost:5173/admin             → Admin Dashboard
http://localhost:5173/baker             → Baker Dashboard
http://localhost:5173/owner             → Owner Dashboard
http://localhost:5173/kitchen           → Kitchen Dashboard
http://localhost:5173/waiter            → Waiter Dashboard
http://localhost:5173/customer          → Customer Dashboard
```

### Usuarios de Prueba (Mock)
```typescript
Admin:    { role: 'admin', name: 'Admin User' }
Baker:    { role: 'baker', name: 'Baker User' }
Owner:    { role: 'owner', name: 'Owner User' }
Kitchen:  { role: 'kitchen', name: 'Kitchen User' }
Waiter:   { role: 'waiter', name: 'Waiter User' }
Customer: { role: 'customer', name: 'Customer User' }
```

---

## 📚 Documentación Relacionada

- `DASHBOARDS_PREMIUM_COMPLETO.md` - Documentación completa
- `PROGRESO_DASHBOARDS.md` - Progreso de migración
- `RESUMEN_SESION.md` - Resumen de la sesión
- `ESTADO_MIGRACION_FINAL.md` - Estado de migración

---

**Última actualización**: 2026-01-05 02:49
