import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Esquemas de validación para productos
export const productSchemas = {
  // Validación para crear producto
  createProduct: Joi.object({
    name: Joi.string()
      .min(2)
      .max(200)
      .required()
      .messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 200 caracteres',
        'string.empty': 'El nombre es requerido',
        'any.required': 'El nombre es requerido',
      }),
    description: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La descripción no puede exceder 1000 caracteres',
      }),
    price: Joi.number()
      .positive()
      .precision(2)
      .max(999999.99)
      .required()
      .messages({
        'number.base': 'El precio debe ser un número',
        'number.positive': 'El precio debe ser mayor a 0',
        'number.precision': 'El precio no puede tener más de 2 decimales',
        'number.max': 'El precio no puede exceder $999,999.99',
        'any.required': 'El precio es requerido',
      }),
    category: Joi.string()
      .valid('tortas', 'bebidas', 'postres', 'extras', 'combos', 'especiales')
      .required()
      .messages({
        'any.only': 'La categoría debe ser: tortas, bebidas, postres, extras, combos o especiales',
        'any.required': 'La categoría es requerida',
      }),
    subcategory: Joi.string()
      .max(100)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La subcategoría no puede exceder 100 caracteres',
      }),
    isAvailable: Joi.boolean()
      .optional()
      .default(true),
    isSpecial: Joi.boolean()
      .optional()
      .default(false),
    preparationTime: Joi.number()
      .integer()
      .min(1)
      .max(120)
      .optional()
      .messages({
        'number.base': 'El tiempo de preparación debe ser un número',
        'number.integer': 'El tiempo de preparación debe ser un número entero',
        'number.min': 'El tiempo de preparación debe ser al menos 1 minuto',
        'number.max': 'El tiempo de preparación no puede exceder 120 minutos',
      }),
    ingredients: Joi.array()
      .items(Joi.string().max(100))
      .max(20)
      .optional()
      .messages({
        'array.max': 'No puede tener más de 20 ingredientes',
        'string.max': 'Cada ingrediente no puede exceder 100 caracteres',
      }),
    allergens: Joi.array()
      .items(Joi.string().valid('gluten', 'lacteos', 'huevos', 'frutos_secos', 'soja', 'pescado', 'mariscos', 'sesamo'))
      .optional()
      .messages({
        'any.only': 'Los alérgenos deben ser: gluten, lacteos, huevos, frutos_secos, soja, pescado, mariscos, sesamo',
      }),
    nutritionalInfo: Joi.object({
      calories: Joi.number().integer().min(0).max(5000).optional(),
      protein: Joi.number().min(0).max(200).optional(),
      carbs: Joi.number().min(0).max(500).optional(),
      fat: Joi.number().min(0).max(200).optional(),
      fiber: Joi.number().min(0).max(100).optional(),
      sodium: Joi.number().min(0).max(10000).optional(),
    }).optional(),
    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(10)
      .optional()
      .messages({
        'array.max': 'No puede tener más de 10 etiquetas',
        'string.max': 'Cada etiqueta no puede exceder 50 caracteres',
      }),
    imageUrl: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'La URL de la imagen debe ser válida',
      }),
    weight: Joi.number()
      .positive()
      .max(10000)
      .optional()
      .messages({
        'number.positive': 'El peso debe ser mayor a 0',
        'number.max': 'El peso no puede exceder 10000 gramos',
      }),
    spicyLevel: Joi.number()
      .integer()
      .min(0)
      .max(5)
      .optional()
      .default(0)
      .messages({
        'number.integer': 'El nivel picante debe ser un número entero',
        'number.min': 'El nivel picante debe ser entre 0 y 5',
        'number.max': 'El nivel picante debe ser entre 0 y 5',
      }),
  }),

  // Validación para actualizar producto
  updateProduct: Joi.object({
    name: Joi.string()
      .min(2)
      .max(200)
      .optional()
      .messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 200 caracteres',
      }),
    description: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La descripción no puede exceder 1000 caracteres',
      }),
    price: Joi.number()
      .positive()
      .precision(2)
      .max(999999.99)
      .optional()
      .messages({
        'number.base': 'El precio debe ser un número',
        'number.positive': 'El precio debe ser mayor a 0',
        'number.precision': 'El precio no puede tener más de 2 decimales',
        'number.max': 'El precio no puede exceder $999,999.99',
      }),
    category: Joi.string()
      .valid('tortas', 'bebidas', 'postres', 'extras', 'combos', 'especiales')
      .optional()
      .messages({
        'any.only': 'La categoría debe ser: tortas, bebidas, postres, extras, combos o especiales',
      }),
    subcategory: Joi.string()
      .max(100)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La subcategoría no puede exceder 100 caracteres',
      }),
    isAvailable: Joi.boolean().optional(),
    isSpecial: Joi.boolean().optional(),
    preparationTime: Joi.number()
      .integer()
      .min(1)
      .max(120)
      .optional()
      .messages({
        'number.base': 'El tiempo de preparación debe ser un número',
        'number.integer': 'El tiempo de preparación debe ser un número entero',
        'number.min': 'El tiempo de preparación debe ser al menos 1 minuto',
        'number.max': 'El tiempo de preparación no puede exceder 120 minutos',
      }),
    ingredients: Joi.array()
      .items(Joi.string().max(100))
      .max(20)
      .optional()
      .messages({
        'array.max': 'No puede tener más de 20 ingredientes',
        'string.max': 'Cada ingrediente no puede exceder 100 caracteres',
      }),
    allergens: Joi.array()
      .items(Joi.string().valid('gluten', 'lacteos', 'huevos', 'frutos_secos', 'soja', 'pescado', 'mariscos', 'sesamo'))
      .optional()
      .messages({
        'any.only': 'Los alérgenos deben ser: gluten, lacteos, huevos, frutos_secos, soja, pescado, mariscos, sesamo',
      }),
    nutritionalInfo: Joi.object({
      calories: Joi.number().integer().min(0).max(5000).optional(),
      protein: Joi.number().min(0).max(200).optional(),
      carbs: Joi.number().min(0).max(500).optional(),
      fat: Joi.number().min(0).max(200).optional(),
      fiber: Joi.number().min(0).max(100).optional(),
      sodium: Joi.number().min(0).max(10000).optional(),
    }).optional(),
    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(10)
      .optional()
      .messages({
        'array.max': 'No puede tener más de 10 etiquetas',
        'string.max': 'Cada etiqueta no puede exceder 50 caracteres',
      }),
    imageUrl: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'La URL de la imagen debe ser válida',
      }),
    weight: Joi.number()
      .positive()
      .max(10000)
      .optional()
      .messages({
        'number.positive': 'El peso debe ser mayor a 0',
        'number.max': 'El peso no puede exceder 10000 gramos',
      }),
    spicyLevel: Joi.number()
      .integer()
      .min(0)
      .max(5)
      .optional()
      .messages({
        'number.integer': 'El nivel picante debe ser un número entero',
        'number.min': 'El nivel picante debe ser entre 0 y 5',
        'number.max': 'El nivel picante debe ser entre 0 y 5',
      }),
  }),

  // Validación para búsqueda de productos
  searchProducts: Joi.object({
    query: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'La búsqueda debe tener al menos 2 caracteres',
        'string.max': 'La búsqueda no puede exceder 100 caracteres',
      }),
    category: Joi.string()
      .valid('tortas', 'bebidas', 'postres', 'extras', 'combos', 'especiales')
      .optional()
      .messages({
        'any.only': 'La categoría debe ser: tortas, bebidas, postres, extras, combos o especiales',
      }),
    subcategory: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'La subcategoría no puede exceder 100 caracteres',
      }),
    isAvailable: Joi.boolean().optional(),
    isSpecial: Joi.boolean().optional(),
    minPrice: Joi.number()
      .min(0)
      .max(999999.99)
      .optional()
      .messages({
        'number.min': 'El precio mínimo debe ser mayor o igual a 0',
        'number.max': 'El precio mínimo no puede exceder $999,999.99',
      }),
    maxPrice: Joi.number()
      .min(0)
      .max(999999.99)
      .optional()
      .messages({
        'number.min': 'El precio máximo debe ser mayor o igual a 0',
        'number.max': 'El precio máximo no puede exceder $999,999.99',
      }),
    spicyLevel: Joi.number()
      .integer()
      .min(0)
      .max(5)
      .optional()
      .messages({
        'number.integer': 'El nivel picante debe ser un número entero',
        'number.min': 'El nivel picante debe ser entre 0 y 5',
        'number.max': 'El nivel picante debe ser entre 0 y 5',
      }),
    allergens: Joi.array()
      .items(Joi.string().valid('gluten', 'lacteos', 'huevos', 'frutos_secos', 'soja', 'pescado', 'mariscos', 'sesamo'))
      .optional()
      .messages({
        'any.only': 'Los alérgenos deben ser: gluten, lacteos, huevos, frutos_secos, soja, pescado, mariscos, sesamo',
      }),
    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(10)
      .optional()
      .messages({
        'array.max': 'No puede buscar más de 10 etiquetas',
        'string.max': 'Cada etiqueta no puede exceder 50 caracteres',
      }),
    sortBy: Joi.string()
      .valid('name', 'price', 'category', 'createdAt', 'popularity', 'preparationTime')
      .optional()
      .default('name')
      .messages({
        'any.only': 'Ordenar por: name, price, category, createdAt, popularity o preparationTime',
      }),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .optional()
      .default('asc')
      .messages({
        'any.only': 'Orden debe ser: asc o desc',
      }),
  }),

  // Validación para actualización masiva de disponibilidad
  bulkUpdateAvailability: Joi.object({
    productIds: Joi.array()
      .items(Joi.number().integer().positive())
      .min(1)
      .max(100)
      .required()
      .messages({
        'array.min': 'Debe seleccionar al menos 1 producto',
        'array.max': 'No puede actualizar más de 100 productos a la vez',
        'number.integer': 'Los IDs deben ser números enteros',
        'number.positive': 'Los IDs deben ser números positivos',
        'any.required': 'Los IDs de productos son requeridos',
      }),
    isAvailable: Joi.boolean()
      .required()
      .messages({
        'any.required': 'El estado de disponibilidad es requerido',
      }),
  }),

  // Validación para actualización masiva de precios
  bulkUpdatePrices: Joi.object({
    updates: Joi.array()
      .items(
        Joi.object({
          id: Joi.number().integer().positive().required(),
          price: Joi.number().positive().precision(2).max(999999.99).required(),
        })
      )
      .min(1)
      .max(100)
      .required()
      .messages({
        'array.min': 'Debe actualizar al menos 1 producto',
        'array.max': 'No puede actualizar más de 100 productos a la vez',
        'any.required': 'Las actualizaciones son requeridas',
      }),
  }),
};

// Validaciones para parámetros de ruta
export const productParamSchemas = {
  productId: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'El ID debe ser un número',
        'number.integer': 'El ID debe ser un número entero',
        'number.positive': 'El ID debe ser un número positivo',
        'any.required': 'El ID es requerido',
      }),
  }),

  productSlug: Joi.object({
    slug: Joi.string()
      .min(2)
      .max(200)
      .pattern(/^[a-z0-9-]+$/)
      .required()
      .messages({
        'string.min': 'El slug debe tener al menos 2 caracteres',
        'string.max': 'El slug no puede exceder 200 caracteres',
        'string.pattern.base': 'El slug solo puede contener letras minúsculas, números y guiones',
        'any.required': 'El slug es requerido',
      }),
  }),

  category: Joi.object({
    category: Joi.string()
      .valid('tortas', 'bebidas', 'postres', 'extras', 'combos', 'especiales')
      .required()
      .messages({
        'any.only': 'La categoría debe ser: tortas, bebidas, postres, extras, combos o especiales',
        'any.required': 'La categoría es requerida',
      }),
  }),
};

// Validaciones para query parameters
export const productQuerySchemas = {
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .optional()
      .default(1)
      .messages({
        'number.base': 'La página debe ser un número',
        'number.integer': 'La página debe ser un número entero',
        'number.min': 'La página debe ser mayor a 0',
        'number.max': 'La página no puede ser mayor a 1000',
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .default(10)
      .messages({
        'number.base': 'El límite debe ser un número',
        'number.integer': 'El límite debe ser un número entero',
        'number.min': 'El límite debe ser mayor a 0',
        'number.max': 'El límite no puede ser mayor a 100',
      }),
  }),

  productFilters: Joi.object({
    category: Joi.string()
      .valid('tortas', 'bebidas', 'postres', 'extras', 'combos', 'especiales')
      .optional()
      .messages({
        'any.only': 'La categoría debe ser: tortas, bebidas, postres, extras, combos o especiales',
      }),
    isAvailable: Joi.boolean().optional(),
    isSpecial: Joi.boolean().optional(),
    minPrice: Joi.number().min(0).max(999999.99).optional(),
    maxPrice: Joi.number().min(0).max(999999.99).optional(),
    spicyLevel: Joi.number().integer().min(0).max(5).optional(),
    hasAllergens: Joi.boolean().optional(),
    createdAfter: Joi.date().iso().optional(),
    createdBefore: Joi.date().iso().optional(),
  }),
};

// Middleware de validación genérico
export const validateProduct = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' | 'headers' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = (req as any)[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }));

      res.status(400).json({
        error: 'Validation failed',
        message: 'Los datos proporcionados no son válidos',
        details: errors,
      });
      return;
    }

    // Validaciones adicionales
    if (source === 'query' && value.minPrice && value.maxPrice && value.minPrice > value.maxPrice) {
      res.status(400).json({
        error: 'Validation failed',
        message: 'El precio mínimo no puede ser mayor al precio máximo',
      });
      return;
    }

    // Reemplazar los datos originales con los validados y transformados
    req[source] = value;
    next();
  };
};

// Middleware para validar permisos de producto
export const validateProductPermissions = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  // Solo admin y owner pueden crear/modificar productos
  if (!['admin', 'owner'].includes(user.role)) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'No tienes permisos para realizar esta acción',
    });
    return;
  }

  next();
};

// Middlewares específicos para cada endpoint
export const validateCreateProduct = validateProduct(productSchemas.createProduct);
export const validateUpdateProduct = validateProduct(productSchemas.updateProduct);
export const validateSearchProducts = validateProduct(productSchemas.searchProducts, 'query');
export const validateBulkUpdateAvailability = validateProduct(productSchemas.bulkUpdateAvailability);
export const validateBulkUpdatePrices = validateProduct(productSchemas.bulkUpdatePrices);

// Validadores para parámetros
export const validateProductId = validateProduct(productParamSchemas.productId, 'params');
export const validateProductSlug = validateProduct(productParamSchemas.productSlug, 'params');
export const validateCategory = validateProduct(productParamSchemas.category, 'params');

// Validadores para query parameters
export const validateProductPagination = validateProduct(productQuerySchemas.pagination, 'query');
export const validateProductFilters = validateProduct(productQuerySchemas.productFilters, 'query');

export default {
  schemas: productSchemas,
  paramSchemas: productParamSchemas,
  querySchemas: productQuerySchemas,
  validate: validateProduct,
  validateCreateProduct,
  validateUpdateProduct,
  validateSearchProducts,
  validateBulkUpdateAvailability,
  validateBulkUpdatePrices,
  validateProductId,
  validateProductSlug,
  validateCategory,
  validateProductPagination,
  validateProductFilters,
  validateProductPermissions,
};
