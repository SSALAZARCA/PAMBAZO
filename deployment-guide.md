# 🚀 Guía Completa de Deployment - PAMBAZO

Esta guía te llevará paso a paso para desplegar tu aplicación PAMBAZO en diferentes plataformas.

## 📋 Pre-requisitos

Antes de comenzar, asegúrate de tener:
- ✅ Node.js 18 o superior instalado
- ✅ npm o yarn como gestor de paquetes
- ✅ Una cuenta en la plataforma de deployment elegida
- ✅ Git instalado (opcional pero recomendado)

## 🏗️ Preparación del Proyecto

### 1. Instalación de Dependencias
```bash
# Clonar o descomprimir el proyecto
cd pambazo-bakery-management

# Instalar dependencias
npm install

# Verificar que funciona localmente
npm run dev
```

### 2. Build de Producción
```bash
# Crear build optimizado
npm run build

# Verificar el build localmente
npm run preview
```

## 🌐 Opciones de Deployment

### 🟢 Opción 1: Vercel (Recomendado - Más Fácil)

Vercel es perfecto para aplicaciones React y tiene excelente soporte para PWAs.

#### Deployment Automático con Git:
1. **Sube tu código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/pambazo.git
   git push -u origin main
   ```

2. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Importa tu repositorio `pambazo`
   - Configura las variables:
     - **Framework Preset:** Vite
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
   - Haz clic en "Deploy"

#### Deployment Manual:
```bash
# Instalar Vercel CLI
npm install -g vercel

# Hacer login
vercel login

# Deployar
vercel --prod
```

#### Configuración Adicional para PWA:
Crea `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

### 🔵 Opción 2: Netlify

Netlify es otra excelente opción con drag-and-drop deployment.

#### Deployment Manual:
1. Haz el build: `npm run build`
2. Ve a [netlify.com](https://netlify.com)
3. Arrastra la carpeta `dist` al área de deployment
4. ¡Listo!

#### Deployment con Git:
1. Conecta tu repositorio en Netlify
2. Configura:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Agrega `_redirects` file para SPA:
   ```bash
   echo "/*    /index.html   200" > dist/_redirects
   ```

#### Configuración PWA para Netlify:
Crea `netlify.toml`:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 🟠 Opción 3: GitHub Pages

Ideal si tu código ya está en GitHub.

#### Setup:
1. Instala gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Agrega a `package.json`:
   ```json
   {
     "homepage": "https://tu-usuario.github.io/pambazo",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Deploya:
   ```bash
   npm run deploy
   ```

4. Configura GitHub Pages:
   - Ve a Settings → Pages
   - Source: Deploy from branch
   - Branch: gh-pages

### 🟪 Opción 4: Firebase Hosting

Google Firebase ofrece hosting rápido y CDN global.

#### Setup:
1. Instala Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login y configura:
   ```bash
   firebase login
   firebase init hosting
   ```

3. Configura `firebase.json`:
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ],
       "headers": [
         {
           "source": "/sw.js",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "no-cache"
             }
           ]
         }
       ]
     }
   }
   ```

4. Deploy:
   ```bash
   npm run build
   firebase deploy
   ```

## 📱 Configuración PWA Específica

### Iconos Requeridos
Crea estos iconos en la carpeta `public/`:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `apple-touch-icon.png` (180x180)
- `favicon.ico` (32x32)

### Verificación PWA
Usa estas herramientas después del deployment:
- [PWA Builder](https://www.pwabuilder.com/)
- Chrome DevTools → Lighthouse
- [Web.dev Measure](https://web.dev/measure/)

## 🔧 Variables de Entorno

Para configuración específica por ambiente:

### Desarrollo (.env.development):
```env
VITE_API_URL=http://localhost:3001
VITE_APP_ENV=development
VITE_ENABLE_PWA=true
```

### Producción (.env.production):
```env
VITE_API_URL=https://api.pambazo.com
VITE_APP_ENV=production
VITE_ENABLE_PWA=true
VITE_ANALYTICS_ID=GA_TRACKING_ID
```

## 🚨 Checklist Pre-Deployment

- [ ] Build funciona sin errores: `npm run build`
- [ ] PWA manifest es válido
- [ ] Iconos están en lugar correcto
- [ ] Service Worker se registra
- [ ] App funciona offline básicamente
- [ ] Meta tags están configurados
- [ ] Analytics configurado (opcional)
- [ ] Dominio personalizado configurado (opcional)

## 🔍 Testing Post-Deployment

### 1. Verificación Básica:
- [ ] App carga correctamente
- [ ] Login funciona con credenciales demo
- [ ] Todos los roles funcionan
- [ ] Responsive design se ve bien

### 2. Verificación PWA:
- [ ] Manifest.json accesible
- [ ] Service Worker se instala
- [ ] App es instalable
- [ ] Funciona offline básicamente
- [ ] Iconos se muestran correctamente

### 3. Verificación Mobile:
- [ ] Touch targets son suficientemente grandes
- [ ] Gestos swipe funcionan
- [ ] Bottom navigation funciona
- [ ] No hay scroll horizontal no deseado

## 🐛 Troubleshooting

### Problemas Comunes:

#### 1. "App no carga después del deployment"
```bash
# Verifica que el build sea correcto
npm run build && npm run preview

# Revisa la consola del navegador para errores
# Verifica que las rutas estén configuradas correctamente
```

#### 2. "PWA no se puede instalar"
- Verifica que esté servido sobre HTTPS
- Revisa que `manifest.json` sea válido
- Confirma que los iconos existan y tengan los tamaños correctos

#### 3. "404 en rutas al refrescar"
Configura redirects para SPA en tu plataforma de hosting.

#### 4. "Service Worker no se actualiza"
```javascript
// Fuerza actualización del SW
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}
```

## 📊 Monitoreo Post-Deployment

### Analytics Recomendado:
- Google Analytics 4
- Vercel Analytics
- Netlify Analytics

### Performance Monitoring:
- Google PageSpeed Insights
- GTmetrix
- WebPageTest

### PWA Monitoring:
- Chrome DevTools Lighthouse
- PWA Builder Report

## 🔒 Seguridad en Producción

### Headers de Seguridad:
```javascript
// En tu configuración de hosting
{
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

## 🎯 Próximos Pasos

Una vez deployado exitosamente:

1. **Configura dominio personalizado** (ej: pambazo.com)
2. **Habilita HTTPS** (automático en la mayoría de plataformas)
3. **Configura analytics** para tracking de usuarios
4. **Implementa backend real** reemplazando los datos mock
5. **Agrega autenticación real** con proveedores como Auth0
6. **Configura base de datos** (PostgreSQL, MongoDB, etc.)
7. **Implementa notificaciones push** reales

## 📞 Soporte

Si encuentras problemas durante el deployment:

1. Revisa los logs de build en tu plataforma
2. Verifica la consola del navegador para errores JavaScript
3. Usa las herramientas de desarrollo de tu navegador
4. Consulta la documentación específica de tu plataforma de hosting

¡Tu aplicación PAMBAZO está lista para ser usada por usuarios reales! 🎉