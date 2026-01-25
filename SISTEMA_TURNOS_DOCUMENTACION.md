# 📅 SISTEMA DE TURNOS - DOCUMENTACIÓN COMPLETA

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Estructura de Datos](#estructura-de-datos)
3. [Componentes del Sistema](#componentes-del-sistema)
4. [Funcionalidades](#funcionalidades)
5. [Estados de Turnos](#estados-de-turnos)
6. [Flujo de Trabajo](#flujo-de-trabajo)
7. [Interfaz de Usuario](#interfaz-de-usuario)

---

## 📖 Descripción General

El **Sistema de Turnos** (`BakerSchedulePage`) es un módulo completo de gestión de horarios para panaderos que permite:

- ✅ Visualizar turnos en un calendario mensual
- ✅ Ver estadísticas de asistencia
- ✅ Consultar detalles de cada turno
- ✅ Navegar entre meses
- ✅ Identificar próximos turnos programados

**Ubicación:** `src/pages/baker/schedule/BakerSchedulePage.tsx`

---

## 🗂️ Estructura de Datos

### Interface `Shift` (Turno)

```typescript
interface Shift {
    id: string;              // Identificador único del turno
    date: Date;              // Fecha del turno
    startTime: string;       // Hora de inicio (formato: "HH:MM")
    endTime: string;         // Hora de finalización (formato: "HH:MM")
    status: 'scheduled' | 'completed' | 'absent' | 'pending';  // Estado del turno
    notes?: string;          // Notas opcionales del turno
}
```

### Ejemplo de Turno

```typescript
{
    id: '1',
    date: new Date(2026, 0, 6),  // 6 de enero de 2026
    startTime: '05:00',           // Inicia a las 5:00 AM
    endTime: '13:00',             // Termina a la 1:00 PM
    status: 'scheduled',          // Estado: Programado
    notes: 'Turno mañana'        // Nota adicional
}
```

---

## 🧩 Componentes del Sistema

### 1. **Tarjetas de Estadísticas** (Stats Cards)

Muestra 3 métricas principales:

#### a) Turnos Programados
- **Descripción:** Cantidad de turnos con estado `scheduled`
- **Color:** Azul
- **Icono:** Reloj (Clock)
- **Cálculo:** `MOCK_SHIFTS.filter(s => s.status === 'scheduled').length`

#### b) Turnos Completados
- **Descripción:** Cantidad de turnos con estado `completed`
- **Color:** Verde
- **Icono:** Check Circle
- **Cálculo:** `MOCK_SHIFTS.filter(s => s.status === 'completed').length`

#### c) Horas Trabajadas
- **Descripción:** Total de horas trabajadas (turnos completados × 8 horas)
- **Color:** Morado
- **Icono:** Users
- **Cálculo:** `completedShifts * 8`

---

### 2. **Calendario Mensual** (Calendar)

#### Características:
- **Vista:** Grid de 7 columnas (Domingo a Sábado)
- **Navegación:** Botones para mes anterior/siguiente
- **Días destacados:**
  - **Hoy:** Borde naranja, fondo naranja claro
  - **Con turno:** Color según estado del turno
  - **Sin turno:** Fondo blanco

#### Información por día:
- Número del día
- Icono de estado (si hay turno)
- Hora de inicio del turno

#### Interactividad:
- **Click en día:** Muestra detalles del turno en panel inferior
- **Hover:** Efecto de sombra

---

### 3. **Panel de Detalles** (Shift Details)

Se muestra cuando se selecciona un día del calendario.

#### Si hay turno:
- **Badge de estado:** Color según estado
- **Hora de inicio:** Formato legible
- **Hora de fin:** Formato legible
- **Notas:** Si existen

#### Si NO hay turno:
- Icono de calendario
- Mensaje: "No hay turno programado para este día"

---

### 4. **Lista de Próximos Turnos** (Upcoming Shifts)

#### Características:
- Muestra los próximos 5 turnos programados
- Ordenados por fecha (más cercano primero)
- Solo muestra turnos con estado `scheduled`

#### Información por turno:
- Icono de calendario
- Fecha completa (día de semana, día, mes)
- Horario (inicio - fin)
- Badge de estado

---

## 🎨 Estados de Turnos

### 1. **Scheduled (Programado)** 🔵
- **Color:** Azul (`bg-blue-100 text-blue-700 border-blue-300`)
- **Icono:** Reloj (Clock)
- **Significado:** Turno futuro confirmado
- **Texto:** "Programado"

### 2. **Completed (Completado)** 🟢
- **Color:** Verde (`bg-green-100 text-green-700 border-green-300`)
- **Icono:** Check Circle
- **Significado:** Turno trabajado y completado
- **Texto:** "Completado"

### 3. **Absent (Ausente)** 🔴
- **Color:** Rojo (`bg-red-100 text-red-700 border-red-300`)
- **Icono:** X Circle
- **Significado:** Turno programado pero no asistió
- **Texto:** "Ausente"

### 4. **Pending (Pendiente)** 🟡
- **Color:** Amarillo (`bg-yellow-100 text-yellow-700 border-yellow-300`)
- **Icono:** Alert Circle
- **Significado:** Turno por confirmar o en revisión
- **Texto:** "Pendiente"

---

## 🔄 Flujo de Trabajo

### 1. **Carga Inicial**
```
Usuario accede → Dashboard Baker → Click "Horarios y Turnos"
    ↓
Se carga BakerSchedulePage
    ↓
Se muestran:
  - Estadísticas del mes actual
  - Calendario del mes actual
  - Próximos 5 turnos programados
```

### 2. **Navegación de Calendario**
```
Usuario hace click en "◀" (mes anterior)
    ↓
setCurrentMonth(mes - 1)
    ↓
Se recalcula:
  - Días del mes
  - Día inicial de la semana
  - Turnos del nuevo mes
    ↓
Se actualiza vista del calendario
```

### 3. **Selección de Día**
```
Usuario hace click en un día del calendario
    ↓
setSelectedDate(fecha seleccionada)
    ↓
Se busca turno para esa fecha
    ↓
Si existe turno:
  - Muestra panel con detalles
  - Badge de estado
  - Horarios
  - Notas
Si NO existe:
  - Muestra mensaje "No hay turno"
```

---

## 🖥️ Interfaz de Usuario

### Layout Principal

```
┌─────────────────────────────────────────────────────┐
│  📅 Horarios y Turnos                               │
│  Gestión de turnos y asistencia                    │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Turnos   │  │ Turnos   │  │  Horas   │         │
│  │Programad.│  │Completad.│  │Trabajadas│         │
│  │    5     │  │    3     │  │   24h    │         │
│  └──────────┘  └──────────┘  └──────────┘         │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐   │
│  │  ◀  Enero 2026  ▶                           │   │
│  ├─────────────────────────────────────────────┤   │
│  │ Dom Lun Mar Mié Jue Vie Sáb                │   │
│  │  -   -   -   1   2   3   4                 │   │
│  │  5   6   7   8   9  10  11                 │   │
│  │ 12  13  14  15  16  17  18                 │   │
│  │ ...                                         │   │
│  └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  Detalles del lunes, 6 de enero de 2026            │
│  ┌─────────────────────────────────────────────┐   │
│  │ [Programado]                                │   │
│  │ Hora de Inicio: 05:00                       │   │
│  │ Hora de Fin: 13:00                          │   │
│  │ Notas: Turno mañana                         │   │
│  └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  Próximos Turnos                                    │
│  ┌─────────────────────────────────────────────┐   │
│  │ 📅 lunes, 6 de enero                        │   │
│  │    05:00 - 13:00          [Programado]      │   │
│  ├─────────────────────────────────────────────┤   │
│  │ 📅 martes, 7 de enero                       │   │
│  │    05:00 - 13:00          [Programado]      │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Funciones Principales

### `getDaysInMonth(date: Date)`
**Propósito:** Calcula información del mes

**Retorna:**
```typescript
{
    daysInMonth: number,        // Cantidad de días en el mes
    startingDayOfWeek: number,  // Día de la semana del día 1 (0=Domingo)
    year: number,               // Año
    month: number               // Mes (0-11)
}
```

### `getShiftForDate(date: Date)`
**Propósito:** Busca turno para una fecha específica

**Retorna:** `Shift | undefined`

### `getStatusColor(status: string)`
**Propósito:** Retorna clases CSS según estado

**Retorna:** `string` (clases de Tailwind)

### `getStatusIcon(status: string)`
**Propósito:** Retorna componente de icono según estado

**Retorna:** `JSX.Element | null`

### `getStatusText(status: string)`
**Propósito:** Retorna texto en español del estado

**Retorna:** `string`

### `previousMonth()` / `nextMonth()`
**Propósito:** Navega entre meses

**Efecto:** Actualiza `currentMonth`

---

## 📊 Datos de Ejemplo (MOCK_SHIFTS)

Actualmente el sistema usa datos de prueba:

```typescript
const MOCK_SHIFTS: Shift[] = [
    // Turnos programados (futuros)
    { id: '1', date: new Date(2026, 0, 6), startTime: '05:00', endTime: '13:00', status: 'scheduled', notes: 'Turno mañana' },
    { id: '2', date: new Date(2026, 0, 7), startTime: '05:00', endTime: '13:00', status: 'scheduled' },
    // ... más turnos programados
    
    // Turnos completados (pasados)
    { id: '6', date: new Date(2026, 0, 3), startTime: '05:00', endTime: '13:00', status: 'completed' },
    { id: '7', date: new Date(2026, 0, 2), startTime: '05:00', endTime: '13:00', status: 'completed' },
    // ... más turnos completados
];
```

---

## 🚀 Próximas Mejoras Sugeridas

### Funcionalidades Pendientes:

1. **Conectar con Backend**
   - Endpoint: `GET /api/shifts/:userId`
   - Cargar turnos reales desde base de datos

2. **Marcar Asistencia**
   - Botón para confirmar asistencia
   - Endpoint: `POST /api/shifts/:id/attendance`

3. **Solicitar Cambios**
   - Formulario para solicitar cambio de turno
   - Endpoint: `POST /api/shifts/:id/change-request`

4. **Notificaciones**
   - Recordatorio de turno próximo
   - Notificación de cambios aprobados

5. **Exportar Horario**
   - Descargar PDF del mes
   - Sincronizar con Google Calendar

6. **Filtros Avanzados**
   - Por rango de fechas
   - Por estado
   - Por tipo de turno

---

## 🧪 Cómo Probar

### Paso 1: Login
```
Email: baker@pambazo.com
Password: pambazo123
```

### Paso 2: Navegar
```
Dashboard → Acciones Rápidas → "Horarios y Turnos"
```

### Paso 3: Interactuar
- Ver estadísticas en tarjetas superiores
- Navegar entre meses con flechas
- Click en días del calendario
- Ver detalles de turnos
- Revisar próximos turnos

---

## 📝 Notas Técnicas

### Tecnologías Usadas:
- **React** con TypeScript
- **Lucide React** para iconos
- **Tailwind CSS** para estilos
- **Radix UI** para componentes (Card, Badge, Button)

### Estado del Componente:
```typescript
const [currentMonth, setCurrentMonth] = useState(new Date());
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
```

### Formato de Fechas:
- **Calendario:** `toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })`
- **Detalles:** `toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })`

---

## ✅ Resumen

El sistema de turnos es un módulo **completo y funcional** que permite a los panaderos:

1. ✅ Ver sus turnos en un calendario visual
2. ✅ Consultar estadísticas de asistencia
3. ✅ Revisar detalles de cada turno
4. ✅ Identificar próximos turnos
5. ✅ Navegar fácilmente entre meses

**Estado Actual:** Funcionando con datos de prueba (MOCK_SHIFTS)  
**Próximo Paso:** Conectar con backend para datos reales

---

**Última actualización:** 2026-01-06  
**Versión:** 1.0  
**Autor:** Sistema Pambazo
