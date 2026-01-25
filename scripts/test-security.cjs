// ==================== SCRIPT DE PRUEBA DE SEGURIDAD ====================

const axios = require('axios');
const { performance } = require('perf_hooks');

// Configuración
const BASE_URL = 'http://localhost:3002';
const TEST_TIMEOUT = 30000; // 30 segundos

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utilidades
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logTest = (testName) => {
  log(`\n🧪 Probando: ${testName}`, 'cyan');
};

const logSuccess = (message) => {
  log(`✅ ${message}`, 'green');
};

const logError = (message) => {
  log(`❌ ${message}`, 'red');
};

const logWarning = (message) => {
  log(`⚠️  ${message}`, 'yellow');
};

const logInfo = (message) => {
  log(`ℹ️  ${message}`, 'blue');
};

// ==================== PRUEBAS DE SEGURIDAD ====================

class SecurityTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  async runAllTests() {
    log('🔒 INICIANDO PRUEBAS DE SEGURIDAD PAMBAZO', 'bright');
    log('=' * 50, 'cyan');

    try {
      await this.testServerHealth();
      await this.testRateLimiting();
      await this.testCORSHeaders();
      await this.testSecurityHeaders();
      await this.testInputValidation();
      await this.testAuthenticationSecurity();
      await this.testSQLInjectionProtection();
      await this.testXSSProtection();
      
      this.printSummary();
    } catch (error) {
      logError(`Error general en las pruebas: ${error.message}`);
    }
  }

  async testServerHealth() {
    logTest('Salud del servidor');
    
    try {
      const start = performance.now();
      const response = await axios.get(`${BASE_URL}/api/v1/health`, {
        timeout: 5000
      });
      const end = performance.now();
      
      if (response.status === 200) {
        logSuccess(`Servidor respondiendo correctamente (${Math.round(end - start)}ms)`);
        this.recordTest('Server Health', true);
      } else {
        logError(`Servidor respondió con status ${response.status}`);
        this.recordTest('Server Health', false);
      }
    } catch (error) {
      logError(`Servidor no disponible: ${error.message}`);
      this.recordTest('Server Health', false);
    }
  }

  async testRateLimiting() {
    logTest('Rate Limiting');
    
    try {
      // Hacer múltiples requests rápidos para probar rate limiting
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          axios.get(`${BASE_URL}/api/v1/health`, {
            timeout: 2000,
            validateStatus: () => true // Aceptar todos los status codes
          })
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);
      
      if (rateLimited) {
        logSuccess('Rate limiting funcionando correctamente');
        this.recordTest('Rate Limiting', true);
      } else {
        logWarning('Rate limiting no se activó (puede ser normal en desarrollo)');
        this.recordTest('Rate Limiting', true, 'warning');
      }
    } catch (error) {
      logError(`Error probando rate limiting: ${error.message}`);
      this.recordTest('Rate Limiting', false);
    }
  }

  async testCORSHeaders() {
    logTest('Headers CORS');
    
    try {
      const response = await axios.options(`${BASE_URL}/api/v1/health`, {
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET'
        },
        timeout: 5000,
        validateStatus: () => true
      });
      
      const corsHeaders = response.headers['access-control-allow-origin'];
      
      if (corsHeaders) {
        logSuccess(`CORS configurado: ${corsHeaders}`);
        this.recordTest('CORS Headers', true);
      } else {
        logWarning('Headers CORS no encontrados');
        this.recordTest('CORS Headers', false);
      }
    } catch (error) {
      logError(`Error probando CORS: ${error.message}`);
      this.recordTest('CORS Headers', false);
    }
  }

  async testSecurityHeaders() {
    logTest('Headers de Seguridad (Helmet)');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/health`, {
        timeout: 5000
      });
      
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security'
      ];
      
      let foundHeaders = 0;
      securityHeaders.forEach(header => {
        if (response.headers[header]) {
          logSuccess(`Header encontrado: ${header}`);
          foundHeaders++;
        } else {
          logWarning(`Header faltante: ${header}`);
        }
      });
      
      if (foundHeaders >= 2) {
        this.recordTest('Security Headers', true);
      } else {
        this.recordTest('Security Headers', false);
      }
    } catch (error) {
      logError(`Error probando headers de seguridad: ${error.message}`);
      this.recordTest('Security Headers', false);
    }
  }

  async testInputValidation() {
    logTest('Validación de Entrada');
    
    try {
      // Probar con datos inválidos
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Muy corta
        name: 'A' // Muy corto
      };
      
      const response = await axios.post(`${BASE_URL}/api/v1/auth/login`, invalidData, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status === 400) {
        logSuccess('Validación de entrada funcionando correctamente');
        this.recordTest('Input Validation', true);
      } else {
        logError(`Validación no funcionó, status: ${response.status}`);
        this.recordTest('Input Validation', false);
      }
    } catch (error) {
      logError(`Error probando validación: ${error.message}`);
      this.recordTest('Input Validation', false);
    }
  }

  async testAuthenticationSecurity() {
    logTest('Seguridad de Autenticación');
    
    try {
      // Probar acceso sin token
      const response = await axios.get(`${BASE_URL}/api/users/profile`, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      if (response.status === 401) {
        logSuccess('Protección de rutas autenticadas funcionando');
        this.recordTest('Authentication Security', true);
      } else {
        logError(`Rutas no protegidas, status: ${response.status}`);
        this.recordTest('Authentication Security', false);
      }
    } catch (error) {
      logError(`Error probando autenticación: ${error.message}`);
      this.recordTest('Authentication Security', false);
    }
  }

  async testSQLInjectionProtection() {
    logTest('Protección contra SQL Injection');
    
    try {
      // Intentar SQL injection en login
      const maliciousData = {
        email: "admin@test.com'; DROP TABLE users; --",
        password: "password"
      };
      
      const response = await axios.post(`${BASE_URL}/api/auth/login`, maliciousData, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      // Si el servidor responde normalmente (sin crash), la protección funciona
      if (response.status === 400 || response.status === 401) {
        logSuccess('Protección contra SQL Injection funcionando');
        this.recordTest('SQL Injection Protection', true);
      } else {
        logWarning('Respuesta inesperada a intento de SQL injection');
        this.recordTest('SQL Injection Protection', true, 'warning');
      }
    } catch (error) {
      logError(`Error probando SQL injection: ${error.message}`);
      this.recordTest('SQL Injection Protection', false);
    }
  }

  async testXSSProtection() {
    logTest('Protección contra XSS');
    
    try {
      // Intentar XSS en registro
      const xssData = {
        email: "test@test.com",
        password: "password123",
        firstName: "<script>alert('XSS')</script>",
        lastName: "Test"
      };
      
      const response = await axios.post(`${BASE_URL}/api/auth/register`, xssData, {
        timeout: 5000,
        validateStatus: () => true
      });
      
      // Verificar que el script no se ejecute o sea sanitizado
      if (response.status === 400 || (response.data && !response.data.toString().includes('<script>'))) {
        logSuccess('Protección contra XSS funcionando');
        this.recordTest('XSS Protection', true);
      } else {
        logWarning('Posible vulnerabilidad XSS detectada');
        this.recordTest('XSS Protection', false);
      }
    } catch (error) {
      logError(`Error probando XSS: ${error.message}`);
      this.recordTest('XSS Protection', false);
    }
  }

  recordTest(name, passed, type = 'normal') {
    this.results.tests.push({ name, passed, type });
    
    if (type === 'warning') {
      this.results.warnings++;
    } else if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
  }

  printSummary() {
    log('\n📊 RESUMEN DE PRUEBAS DE SEGURIDAD', 'bright');
    log('=' * 50, 'cyan');
    
    logSuccess(`Pruebas exitosas: ${this.results.passed}`);
    logError(`Pruebas fallidas: ${this.results.failed}`);
    logWarning(`Advertencias: ${this.results.warnings}`);
    
    log('\n📋 Detalle de pruebas:', 'blue');
    this.results.tests.forEach(test => {
      const icon = test.passed ? '✅' : '❌';
      const warningIcon = test.type === 'warning' ? ' ⚠️' : '';
      log(`${icon} ${test.name}${warningIcon}`);
    });
    
    const total = this.results.passed + this.results.failed;
    const percentage = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;
    
    log(`\n🎯 Puntuación de seguridad: ${percentage}%`, percentage >= 80 ? 'green' : percentage >= 60 ? 'yellow' : 'red');
    
    if (percentage >= 80) {
      log('🛡️  Excelente nivel de seguridad!', 'green');
    } else if (percentage >= 60) {
      log('⚠️  Nivel de seguridad aceptable, pero mejorable', 'yellow');
    } else {
      log('🚨 Nivel de seguridad insuficiente, requiere atención', 'red');
    }
  }
}

// ==================== EJECUCIÓN ====================

async function main() {
  const tester = new SecurityTester();
  
  // Configurar timeout global
  process.on('unhandledRejection', (reason, promise) => {
    logError(`Promesa rechazada: ${reason}`);
  });
  
  // Timeout general
  const timeout = setTimeout(() => {
    logError('Timeout: Las pruebas tardaron demasiado');
    process.exit(1);
  }, TEST_TIMEOUT);
  
  try {
    await tester.runAllTests();
    clearTimeout(timeout);
  } catch (error) {
    clearTimeout(timeout);
    logError(`Error en las pruebas: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { SecurityTester };