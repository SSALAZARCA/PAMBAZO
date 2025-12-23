/**
 * Utilidades para formateo de moneda en pesos colombianos (COP)
 */

/**
 * Formatea un número como moneda en pesos colombianos
 * @param amount - El monto a formatear
 * @param showCurrency - Si mostrar "COP" al final (por defecto true)
 * @returns String formateado como moneda colombiana
 */
export const formatCOP = (amount: number, showCurrency: boolean = true): string => {
  if (isNaN(amount)) return '$0';
  
  // Formatear con separador de miles
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  if (showCurrency) {
    return formatted;
  } else {
    // Remover el símbolo de moneda y devolver solo el número formateado
    return formatted.replace('COP', '').trim();
  }
};

/**
 * Formatea un número como moneda simple sin símbolo COP
 * @param amount - El monto a formatear
 * @returns String formateado con separador de miles
 */
export const formatPrice = (amount: number): string => {
  if (isNaN(amount)) return '$0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('COP', '').trim();
};

/**
 * Convierte un precio de pesos mexicanos a pesos colombianos
 * Tasa aproximada: 1 MXN = 200 COP (ajustable según necesidades)
 * @param mxnAmount - Monto en pesos mexicanos
 * @returns Monto equivalente en pesos colombianos
 */
export const convertMXNtoCOP = (mxnAmount: number): number => {
  const conversionRate = 200; // 1 MXN ≈ 200 COP
  return Math.round(mxnAmount * conversionRate);
};

/**
 * Precios base recomendados para productos en Colombia (COP)
 */
export const COLOMBIA_PRICES = {
  // Panadería
  PAN_DULCE: 2500,
  CROISSANT: 3500,
  CONCHA: 2000,
  PASTEL_CHOCOLATE: 8000,
  
  // Bebidas
  CAFE_AMERICANO: 4000,
  JUGO_NARANJA: 3500,
  BEBIDA_CALIENTE: 4500,
  
  // Comidas
  SANDWICH_CLUB: 12000,
  COMIDA_PRINCIPAL: 15000,
  SNACK: 5000,
  
  // Inventario (costo por unidad)
  HARINA_KG: 3000,
  AZUCAR_KG: 4000,
  CAFE_KG: 25000,
  LECHE_LITRO: 3500
};