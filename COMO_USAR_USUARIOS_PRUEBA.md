# 🔐 Guía de Usuarios de Prueba - PAMBAZO 2.1

## 📋 Archivos Disponibles

1. **USUARIOS_PRUEBA.md** - Documentación completa de usuarios
2. **test-users.json** - Datos estructurados en JSON
3. **api/database/test-users.sql** - Script SQL manual
4. **api/scripts/createTestUsers.js** - Script automatizado

---

## 🚀 OPCIÓN 1: Script Automatizado (RECOMENDADO)

### Paso 1: Configurar Variables de Entorno
Asegúrate de tener configurado tu `.env` con la conexión a la base de datos:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pambazo
DB_USER=postgres
DB_PASSWORD=tu_password
```

### Paso 2: Ejecutar el Script
```bash
node api/scripts/createTestUsers.js
```

### Resultado Esperado:
```
🚀 Iniciando creación de usuarios de prueba...

🔐 Generando hash de contraseña...
✅ Hash generado: $2b$10$rQZ5YJ5YJ5...

🗑️  Eliminando usuarios de prueba existentes...
✅ Eliminados 0 usuarios existentes

👥 Creando usuarios de prueba:
  ✅ admin    - Carlos Administrador (admin@pambazo.com)
  ✅ baker    - Juan Panadero (baker@pambazo.com)
  ✅ baker    - Pedro Hornero (baker2@pambazo.com)
  ✅ owner    - María Propietaria (owner@pambazo.com)
  ✅ kitchen  - Ana Cocinera (kitchen@pambazo.com)
  ✅ kitchen  - Luis Ayudante (kitchen2@pambazo.com)
  ✅ waiter   - Sofia Mesera (waiter@pambazo.com)
  ✅ waiter   - Diego Camarero (waiter2@pambazo.com)
  ✅ customer - Roberto Cliente (customer@pambazo.com)
  ✅ customer - Laura Compradora (customer2@pambazo.com)
  ✅ customer - Miguel Nuevo (customer3@pambazo.com)

✅ Creados 11/11 usuarios exitosamente

📊 Resumen por rol:
  admin   : 1 usuario(s)
  owner   : 1 usuario(s)
  baker   : 2 usuario(s)
  kitchen : 2 usuario(s)
  waiter  : 2 usuario(s)
  customer: 3 usuario(s)

🎉 ¡Usuarios de prueba creados exitosamente!

📝 Credenciales:
   Email: [rol]@pambazo.com (ej: admin@pambazo.com)
   Contraseña: pambazo123

🔗 Acceso: http://localhost:5173/login
```

---

## 🔧 OPCIÓN 2: Script SQL Manual

### Paso 1: Generar Hash de Contraseña

Primero necesitas generar el hash bcrypt de la contraseña `pambazo123`:

```javascript
// En Node.js
const bcrypt = require('bcrypt');
bcrypt.hash('pambazo123', 10).then(hash => console.log(hash));
```

O usa este comando rápido:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('pambazo123', 10).then(console.log)"
```

### Paso 2: Actualizar el Script SQL

Abre `api/database/test-users.sql` y reemplaza todos los hashes de ejemplo con el hash real generado.

### Paso 3: Ejecutar el Script

```bash
psql -U postgres -d pambazo -f api/database/test-users.sql
```

O desde pgAdmin:
1. Abrir Query Tool
2. Cargar el archivo `test-users.sql`
3. Ejecutar

---

## 👥 USUARIOS DISPONIBLES

### 🔐 Credenciales Universales
**Contraseña para todos**: `pambazo123`

### Por Rol:

| Rol | Email | Nombre | Dashboard |
|-----|-------|--------|-----------|
| **Admin** | admin@pambazo.com | Carlos Administrador | `/admin` |
| **Baker** | baker@pambazo.com | Juan Panadero | `/baker` |
| **Baker** | baker2@pambazo.com | Pedro Hornero | `/baker` |
| **Owner** | owner@pambazo.com | María Propietaria | `/owner` |
| **Kitchen** | kitchen@pambazo.com | Ana Cocinera | `/kitchen` |
| **Kitchen** | kitchen2@pambazo.com | Luis Ayudante | `/kitchen` |
| **Waiter** | waiter@pambazo.com | Sofia Mesera | `/waiter` |
| **Waiter** | waiter2@pambazo.com | Diego Camarero | `/waiter` |
| **Customer** | customer@pambazo.com | Roberto Cliente | `/customer` |
| **Customer** | customer2@pambazo.com | Laura Compradora | `/customer` |
| **Customer** | customer3@pambazo.com | Miguel Nuevo | `/customer` |

---

## 🎯 PRUEBAS RÁPIDAS

### Probar Admin
```bash
# Login
Email: admin@pambazo.com
Password: pambazo123

# Navegar a:
http://localhost:5173/admin
http://localhost:5173/admin/users
```

### Probar Baker
```bash
# Login
Email: baker@pambazo.com
Password: pambazo123

# Navegar a:
http://localhost:5173/baker
http://localhost:5173/baker/production
```

### Probar Owner
```bash
# Login
Email: owner@pambazo.com
Password: pambazo123

# Navegar a:
http://localhost:5173/owner
# Ver gráficos de ventas y analytics
```

### Probar Kitchen
```bash
# Login
Email: kitchen@pambazo.com
Password: pambazo123

# Navegar a:
http://localhost:5173/kitchen
```

### Probar Waiter
```bash
# Login
Email: waiter@pambazo.com
Password: pambazo123

# Navegar a:
http://localhost:5173/waiter
```

### Probar Customer
```bash
# Login
Email: customer@pambazo.com
Password: pambazo123

# Navegar a:
http://localhost:5173/customer
```

---

## 🔍 VERIFICAR USUARIOS

### Desde PostgreSQL:
```sql
-- Ver todos los usuarios de prueba
SELECT id, name, email, role, phone
FROM users
WHERE email LIKE '%@pambazo.com'
ORDER BY role, email;

-- Contar por rol
SELECT role, COUNT(*) as total
FROM users
WHERE email LIKE '%@pambazo.com'
GROUP BY role;
```

### Desde la API:
```bash
# GET todos los usuarios (requiere autenticación admin)
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🗑️ LIMPIAR USUARIOS DE PRUEBA

Si necesitas eliminar todos los usuarios de prueba:

```sql
DELETE FROM users WHERE email LIKE '%@pambazo.com';
```

O ejecuta el script nuevamente (automáticamente limpia antes de crear):
```bash
node api/scripts/createTestUsers.js
```

---

## 📝 NOTAS IMPORTANTES

1. **Contraseña Universal**: Todos los usuarios usan `pambazo123` para facilitar las pruebas
2. **Solo para Desarrollo**: Estos usuarios son SOLO para desarrollo/testing
3. **No usar en Producción**: En producción, usar contraseñas seguras y únicas
4. **Hash Bcrypt**: El script genera automáticamente el hash correcto
5. **Transaccional**: El script usa transacciones, si falla algo, no se crea nada

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot find module 'bcrypt'"
```bash
npm install bcrypt
```

### Error: "Cannot find module 'pg'"
```bash
npm install pg
```

### Error: "Connection refused"
Verifica que PostgreSQL esté corriendo:
```bash
# Windows
pg_ctl status

# Linux/Mac
sudo service postgresql status
```

### Error: "Database does not exist"
Crea la base de datos primero:
```sql
CREATE DATABASE pambazo;
```

---

## ✅ CHECKLIST

- [ ] Base de datos PostgreSQL corriendo
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas (`bcrypt`, `pg`)
- [ ] Script ejecutado exitosamente
- [ ] Usuarios verificados en la base de datos
- [ ] Login probado con al menos un usuario de cada rol

---

## 🎉 ¡LISTO!

Ahora puedes probar todos los dashboards con diferentes roles:

1. Ve a `http://localhost:5173/login`
2. Usa cualquier email de la tabla anterior
3. Contraseña: `pambazo123`
4. Explora el dashboard correspondiente

**¡Disfruta probando PAMBAZO 2.1!** 🥐
