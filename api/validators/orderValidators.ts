import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Esquemas de validación para órdenes
export const orderSchemas = {
  // Validación para crear orden
  createOrder: Joi.object({
    tableNumber: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .required()
      .messages({
        'number.base': 'El número de mesa debe ser un número',
        'number.integer': 'El número de mesa debe ser un número entero',
        'number.min': 'El número de mesa debe ser mayor a 0',
        'number.max': 'El número de mesa no puede ser mayor a 100',
        'any.required': 'El número de mesa es requerido',
      }),
    customerName: Joi.string()
      .min(2)
      .max(100)
      .required()
      .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .messages({
        'string.min': 'El nombre del cliente debe tener al menos 2 caracteres',
        'string.max': 'El nombre del cliente no puede exceder 100 caracteres',
        'string.empty': 'El nombre del cliente es requerido',
        'any.required': 'El nombre del cliente es requerido',
        'string.pattern.base': 'El nombre del cliente solo puede contener letras y espacios',
      }),
    customerPhone: Joi.string()
      .pattern(/^(\+52)?[1-9]\d{9}$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'El teléfono debe tener un formato válido (ej: +525512345678 o 5512345678)',
      }),
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
              'number.base': 'El ID del producto debe ser un número',
              'number.integer': 'El ID del producto debe ser un número entero',
              'number.positive': 'El ID del producto debe ser positivo',
              'any.required': 'El ID del producto es requerido',
            }),
          quantity: Joi.number()
            .integer()
            .min(1)
            .max(50)
            .required()
            .messages({
              'number.base': 'La cantidad debe ser un número',
              'number.integer': 'La cantidad debe ser un número entero',
              'number.min': 'La cantidad debe ser al menos 1',
              'number.max': 'La cantidad no puede exceder 50 por producto',
              'any.required': 'La cantidad es requerida',
            }),
          specialInstructions: Joi.string()
            .max(500)
            .optional()
            .allow('')
            .messages({
              'string.max': 'Las instrucciones especiales no pueden exceder 500 caracteres',
            }),
          modifications: Joi.array()
            .items(
              Joi.object({
                type: Joi.string()
                  .valid('add', 'remove', 'substitute')
                  .required()
                  .messages({
                    'any.only': 'El tipo de modificación debe ser: add, remove o substitute',
                    'any.required': 'El tipo de modificación es requerido',
                  }),
                ingredient: Joi.string()
                  .max(100)
                  .required()
                  .messages({
                    'string.max': 'El ingrediente no puede exceder 100 caracteres',
                    'any.required': 'El ingrediente es requerido',
                  }),
                extraCost: Joi.number()
                  .min(0)
                  .max(100)
                  .precision(2)
                  .optional()
                  .default(0)
                  .messages({
                    'number.min': 'El costo extra no puede ser negativo',
                    'number.max': 'El costo extra no puede exceder $100',
                    'number.precision': 'El costo extra no puede tener más de 2 decimales',
                  }),
              })
            )
            .max(10)
            .optional()
            .messages({
              'array.max': 'No puede tener más de 10 modificaciones por producto',
            }),
        })
      )
      .min(1)
      .max(20)
      .required()
      .messages({
        'array.min': 'Debe incluir al menos 1 producto',
        'array.max': 'No puede incluir más de 20 productos por orden',
        'any.required': 'Los productos son requeridos',
      }),
    orderType: Joi.string()
      .valid('dine_in', 'takeout', 'delivery')
      .optional()
      .default('dine_in')
      .messages({
        'any.only': 'El tipo de orden debe ser: dine_in, takeout o delivery',
      }),
    notes: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Las notas no pueden exceder 1000 caracteres',
      }),
    priority: Joi.string()
      .valid('low', 'normal', 'high', 'urgent')
      .optional()
      .default('normal')
      .messages({
        'any.only': 'La prioridad debe ser: low, normal, high o urgent',
      }),
    estimatedDeliveryTime: Joi.date()
      .iso()
      .min('now')
      .optional()
      .messages({
        'date.format': 'La fecha debe estar en formato ISO',
        'date.min': 'La fecha de entrega no puede ser en el pasado',
      }),
    discountCode: Joi.string()
      .max(50)
      .optional()
      .allow('')
      .messages({
        'string.max': 'El código de descuento no puede exceder 50 caracteres',
      }),
  }),

  // Validación para actualizar orden
  updateOrder: Joi.object({
    status: Joi.string()
      .valid('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')
      .optional()
      .messages({
        'any.only': 'El estado debe ser: pending, confirmed, preparing, ready, delivered o cancelled',
      }),
    tableNumber: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'number.base': 'El número de mesa debe ser un número',
        'number.integer': 'El número de mesa debe ser un número entero',
        'number.min': 'El número de mesa debe ser mayor a 0',
        'number.max': 'El número de mesa no puede ser mayor a 100',
      }),
    customerName: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .messages({
        'string.min': 'El nombre del cliente debe tener al menos 2 caracteres',
        'string.max': 'El nombre del cliente no puede exceder 100 caracteres',
        'string.pattern.base': 'El nombre del cliente solo puede contener letras y espacios',
      }),
    customerPhone: Joi.string()
      .pattern(/^(\+52)?[1-9]\d{9}$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'El teléfono debe tener un formato válido (ej: +525512345678 o 5512345678)',
      }),
    notes: Joi.string()
      .max(1000)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Las notas no pueden exceder 1000 caracteres',
      }),
    priority: Joi.string()
      .valid('low', 'normal', 'high', 'urgent')
      .optional()
      .messages({
        'any.only': 'La prioridad debe ser: low, normal, high o urgent',
      }),
    estimatedDeliveryTime: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'La fecha debe estar en formato ISO',
      }),
    actualDeliveryTime: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'La fecha debe estar en formato ISO',
      }),
    cancellationReason: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La razón de cancelación no puede exceder 500 caracteres',
      }),
  }),

  // Validación para búsqueda de órdenes
  searchOrders: Joi.object({
    status: Joi.string()
      .valid('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')
      .optional()
      .messages({
        'any.only': 'El estado debe ser: pending, confirmed, preparing, ready, delivered o cancelled',
      }),
    tableNumber: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'number.base': 'El número de mesa debe ser un número',
        'number.integer': 'El número de mesa debe ser un número entero',
        'number.min': 'El número de mesa debe ser mayor a 0',
        'number.max': 'El número de mesa no puede ser mayor a 100',
      }),
    customerName: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'El nombre del cliente debe tener al menos 2 caracteres',
        'string.max': 'El nombre del cliente no puede exceder 100 caracteres',
      }),
    orderType: Joi.string()
      .valid('dine_in', 'takeout', 'delivery')
      .optional()
      .messages({
        'any.only': 'El tipo de orden debe ser: dine_in, takeout o delivery',
      }),
    priority: Joi.string()
      .valid('low', 'normal', 'high', 'urgent')
      .optional()
      .messages({
        'any.only': 'La prioridad debe ser: low, normal, high o urgent',
      }),
    dateFrom: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'La fecha debe estar en formato ISO (YYYY-MM-DD)',
      }),
    dateTo: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'La fecha debe estar en formato ISO (YYYY-MM-DD)',
      }),
    minTotal: Joi.number()
      .min(0)
      .max(999999.99)
      .optional()
      .messages({
        'number.min': 'El total mínimo debe ser mayor o igual a 0',
        'number.max': 'El total mínimo no puede exceder $999,999.99',
      }),
    maxTotal: Joi.number()
      .min(0)
      .max(999999.99)
      .optional()
      .messages({
        'number.min': 'El total máximo debe ser mayor o igual a 0',
        'number.max': 'El total máximo no puede exceder $999,999.99',
      }),
    sortBy: Joi.string()
      .valid('createdAt', 'updatedAt', 'total', 'tableNumber', 'status', 'priority')
      .optional()
      .default('createdAt')
      .messages({
        'any.only': 'Ordenar por: createdAt, updatedAt, total, tableNumber, status o priority',
      }),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .optional()
      .default('desc')
      .messages({
        'any.only': 'Orden debe ser: asc o desc',
      }),
  }),

  // Validación para actualización masiva de estado
  bulkUpdateStatus: Joi.object({
    orderIds: Joi.array()
      .items(Joi.number().integer().positive())
      .min(1)
      .max(50)
      .required()
      .messages({
        'array.min': 'Debe seleccionar al menos 1 orden',
        'array.max': 'No puede actualizar más de 50 órdenes a la vez',
        'number.integer': 'Los IDs deben ser números enteros',
        'number.positive': 'Los IDs deben ser números positivos',
        'any.required': 'Los IDs de órdenes son requeridos',
      }),
    status: Joi.string()
      .valid('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')
      .required()
      .messages({
        'any.only': 'El estado debe ser: pending, confirmed, preparing, ready, delivered o cancelled',
        'any.required': 'El estado es requerido',
      }),
    reason: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La razón no puede exceder 500 caracteres',
      }),
  }),

  // Validación para agregar productos a orden existente
  addItemsToOrder: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
              'number.base': 'El ID del producto debe ser un número',
              'number.integer': 'El ID del producto debe ser un número entero',
              'number.positive': 'El ID del producto debe ser positivo',
              'any.required': 'El ID del producto es requerido',
            }),
          quantity: Joi.number()
            .integer()
            .min(1)
            .max(50)
            .required()
            .messages({
              'number.base': 'La cantidad debe ser un número',
              'number.integer': 'La cantidad debe ser un número entero',
              'number.min': 'La cantidad debe ser al menos 1',
              'number.max': 'La cantidad no puede exceder 50 por producto',
              'any.required': 'La cantidad es requerida',
            }),
          specialInstructions: Joi.string()
            .max(500)
            .optional()
            .allow('')
            .messages({
              'string.max': 'Las instrucciones especiales no pueden exceder 500 caracteres',
            }),
        })
      )
      .min(1)
      .max(10)
      .required()
      .messages({
        'array.min': 'Debe incluir al menos 1 producto',
        'array.max': 'No puede agregar más de 10 productos a la vez',
        'any.required': 'Los productos son requeridos',
      }),
  }),

  // Validación para aplicar descuento
  applyDiscount: Joi.object({
    discountCode: Joi.string()
      .max(50)
      .optional()
      .allow('')
      .messages({
        'string.max': 'El código de descuento no puede exceder 50 caracteres',
      }),
    discountType: Joi.string()
      .valid('percentage', 'fixed', 'free_item')
      .required()
      .messages({
        'any.only': 'El tipo de descuento debe ser: percentage, fixed o free_item',
        'any.required': 'El tipo de descuento es requerido',
      }),
    discountValue: Joi.number()
      .min(0)
      .max(100)
      .required()
      .messages({
        'number.min': 'El valor del descuento no puede ser negativo',
        'number.max': 'El valor del descuento no puede exceder 100',
        'any.required': 'El valor del descuento es requerido',
      }),
    reason: Joi.string()
      .max(200)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La razón no puede exceder 200 caracteres',
      }),
  }),
};

// Validaciones para parámetros de ruta
export const orderParamSchemas = {
  orderId: Joi.object({
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

  tableNumber: Joi.object({
    tableNumber: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .required()
      .messages({
        'number.base': 'El número de mesa debe ser un número',
        'number.integer': 'El número de mesa debe ser un número entero',
        'number.min': 'El número de mesa debe ser mayor a 0',
        'number.max': 'El número de mesa no puede ser mayor a 100',
        'any.required': 'El número de mesa es requerido',
      }),
  }),
};

// Validaciones para query parameters
export const orderQuerySchemas = {
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

  orderFilters: Joi.object({
    status: Joi.string()
      .valid('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')
      .optional(),
    orderType: Joi.string()
      .valid('dine_in', 'takeout', 'delivery')
      .optional(),
    priority: Joi.string()
      .valid('low', 'normal', 'high', 'urgent')
      .optional(),
    tableNumber: Joi.number().integer().min(1).max(100).optional(),
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().optional(),
    minTotal: Joi.number().min(0).max(999999.99).optional(),
    maxTotal: Joi.number().min(0).max(999999.99).optional(),
  }),
};

// Middleware de validación genérico
export const validateOrder = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' | 'headers' = 'body') => {
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
    if (source === 'query') {
      if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'La fecha de inicio no puede ser posterior a la fecha de fin',
        });
        return;
      }

      if (value.minTotal && value.maxTotal && value.minTotal > value.maxTotal) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'El total mínimo no puede ser mayor al total máximo',
        });
        return;
      }
    }

    // Reemplazar los datos originales con los validados y transformados
    req[source] = value;
    next();
  };
};

// Middleware para validar transiciones de estado
export const validateStatusTransition = (req: Request, res: Response, next: NextFunction) => {
  const newStatus = req.body.status;

  if (!newStatus) {
    return next();
  }

  // Definir transiciones válidas
  const validTransitions: { [key: string]: string[] } = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['delivered', 'cancelled'],
    delivered: [], // Estado final
    cancelled: [], // Estado final
  };

  // Aquí normalmente obtendrías el estado actual de la base de datos
  // Por ahora, asumimos que se validará en el controlador

  next();
};

// Middleware para validar permisos de orden
export const validateOrderPermissions = (action: 'create' | 'update' | 'delete' | 'view') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    switch (action) {
      case 'create':
        // Todos los usuarios autenticados pueden crear órdenes
        if (['user', 'admin', 'owner'].includes(user.role)) {
          return next();
        }
        break;

      case 'update':
        // Solo admin y owner pueden actualizar órdenes
        if (['admin', 'owner'].includes(user.role)) {
          return next();
        }
        break;

      case 'delete':
        // Solo owner puede eliminar órdenes
        if (user.role === 'owner') {
          return next();
        }
        break;

      case 'view':
        // Todos los usuarios autenticados pueden ver órdenes
        if (['user', 'admin', 'owner'].includes(user.role)) {
          return next();
        }
        break;
    }

    res.status(403).json({
      error: 'Forbidden',
      message: 'No tienes permisos para realizar esta acción',
    });
    return;
  };
};

// Middlewares específicos para cada endpoint
export const validateCreateOrder = validateOrder(orderSchemas.createOrder);
export const validateUpdateOrder = validateOrder(orderSchemas.updateOrder);
export const validateSearchOrders = validateOrder(orderSchemas.searchOrders, 'query');
export const validateBulkUpdateStatus = validateOrder(orderSchemas.bulkUpdateStatus);
export const validateAddItemsToOrder = validateOrder(orderSchemas.addItemsToOrder);
export const validateApplyDiscount = validateOrder(orderSchemas.applyDiscount);

// Validadores para parámetros
export const validateOrderId = validateOrder(orderParamSchemas.orderId, 'params');
export const validateTableNumber = validateOrder(orderParamSchemas.tableNumber, 'params');

// Validadores para query parameters
export const validateOrderPagination = validateOrder(orderQuerySchemas.pagination, 'query');
export const validateOrderFilters = validateOrder(orderQuerySchemas.orderFilters, 'query');

export default {
  schemas: orderSchemas,
  paramSchemas: orderParamSchemas,
  querySchemas: orderQuerySchemas,
  validate: validateOrder,
  validateCreateOrder,
  validateUpdateOrder,
  validateSearchOrders,
  validateBulkUpdateStatus,
  validateAddItemsToOrder,
  validateApplyDiscount,
  validateOrderId,
  validateTableNumber,
  validateOrderPagination,
  validateOrderFilters,
  validateStatusTransition,
  validateOrderPermissions,
};
