/**
 * Script para eliminar TODOS los datos mock del proyecto
 * Ejecutar: node remove-all-mocks.js
 */

const fs = require('fs');
const path = require('path');

const filesToClean = [
    // Components con mocks
    'components/InventorySystem.tsx',
    'components/LoyaltyProgram.tsx',
    'components/QRMenuSystem.tsx',
    'components/TableManagementDialog.tsx',
    'components/WaiterDashboard.tsx',
    'components/PaymentManagement.tsx',
    'components/OwnerDashboard.tsx',
    'components/MobileEmployeeDashboard.tsx',
    'components/EmployeeDashboard.tsx',
    'components/AdminDashboard.tsx',

    // Mobile components
    'components/mobile/MobileAdminDashboard.tsx',
    'components/mobile/MobileOwnerDashboard.tsx',
    'components/mobile/MobileCustomerDashboard.tsx',
    'components/mobile/MobileWaiterDashboard.tsx',
];

console.log('🔥 ELIMINANDO TODOS LOS DATOS MOCK\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const patterns = [
    /const mock\w+\s*[:=]\s*[\[\{][^;]*;/gs,
    /\/\/ Mock data[\s\S]*?(?=\n\s*(?:const|function|export|return|\/\/))/g,
    /\/\/ Mock[\s\S]*?(?=\n\s*(?:const|function|export|return|\/\/))/g,
];

let totalCleaned = 0;

filesToClean.forEach(file => {
    const filePath = path.join(__dirname, file);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Archivo no encontrado: ${file}`);
        return;
    }

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalLength = content.length;

        // Aplicar todos los patrones
        patterns.forEach(pattern => {
            content = content.replace(pattern, '');
        });

        // Limpiar líneas vacías múltiples
        content = content.replace(/\n{3,}/g, '\n\n');

        const cleaned = originalLength - content.length;

        if (cleaned > 0) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${file} - Eliminados ${cleaned} caracteres de mock data`);
            totalCleaned++;
        } else {
            console.log(`ℹ️  ${file} - Sin cambios`);
        }
    } catch (error) {
        console.error(`❌ Error procesando ${file}:`, error.message);
    }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`\n✨ Limpieza completada: ${totalCleaned} archivos modificados\n`);
console.log('⚠️  IMPORTANTE: Revisa los archivos manualmente para asegurar que todo funcione\n');
