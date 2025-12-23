import Joi from 'joi';

export const createInventorySchema = Joi.object({
  product_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.integer': 'El ID del producto debe ser un número entero',
      'number.positive': 'El ID del producto debe ser positivo',
      'any.required': 'El ID del producto es requerido',
    }),
  current_stock: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.integer': 'El stock actual debe ser un número entero',
      'number.min': 'El stock actual no puede ser negativo',
      'any.required': 'El stock actual es requerido',
    }),
  min_stock: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.integer': 'El stock mínimo debe ser un número entero',
      'number.min': 'El stock mínimo no puede ser negativo',
      'any.required': 'El stock mínimo es requerido',
    }),
  max_stock: Joi.number()
    .integer()
    .min(Joi.ref('min_stock'))
    .optional()
    .messages({
      'number.integer': 'El stock máximo debe ser un número entero',
      'number.min': 'El stock máximo debe ser mayor o igual al stock mínimo',
    }),
  unit: Joi.string()
    .max(20)
    .required()
    .messages({
      'string.max': 'La unidad no puede exceder 20 caracteres',
      'any.required': 'La unidad es requerida',
    }),
  cost_per_unit: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      'number.positive': 'El costo por unidad debe ser positivo',
    }),
  supplier_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.integer': 'El ID del proveedor debe ser un número entero',
      'number.positive': 'El ID del proveedor debe ser positivo',
    }),
});

export const updateInventorySchema = Joi.object({
  current_stock: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.integer': 'El stock actual debe ser un número entero',
      'number.min': 'El stock actual no puede ser negativo',
    }),
  min_stock: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.integer': 'El stock mínimo debe ser un número entero',
      'number.min': 'El stock mínimo no puede ser negativo',
    }),
  max_stock: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.integer': 'El stock máximo debe ser un número entero',
    }),
  unit: Joi.string()
    .max(20)
    .optional()
    .messages({
      'string.max': 'La unidad no puede exceder 20 caracteres',
    }),
  cost_per_unit: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      'number.positive': 'El costo por unidad debe ser positivo',
    }),
  supplier_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.integer': 'El ID del proveedor debe ser un número entero',
      'number.positive': 'El ID del proveedor debe ser positivo',
    }),
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar',
});

export const adjustStockSchema = Joi.object({
  adjustment: Joi.number()
    .integer()
    .required()
    .messages({
      'number.integer': 'El ajuste debe ser un número entero',
      'any.required': 'El ajuste es requerido',
    }),
  reason: Joi.string()
    .valid('PURCHASE', 'SALE', 'WASTE', 'CORRECTION', 'TRANSFER')
    .required()
    .messages({
      'any.only': 'La razón debe ser PURCHASE, SALE, WASTE, CORRECTION o TRANSFER',
      'any.required': 'La razón es requerida',
    }),
  notes: Joi.string()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Las notas no pueden exceder 200 caracteres',
    }),
});
