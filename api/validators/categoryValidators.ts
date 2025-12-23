import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const createCategorySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'any.required': 'El nombre es requerido',
    }),
  description: Joi.string()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'La descripción no puede exceder 200 caracteres',
    }),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .messages({
      'string.pattern.base': 'El color debe ser un código hexadecimal válido (ej: #FF0000)',
    }),
  icon: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'El icono no puede exceder 50 caracteres',
    }),
  is_active: Joi.boolean()
    .default(true),
  sort_order: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.integer': 'El orden debe ser un número entero',
      'number.min': 'El orden debe ser mayor o igual a 0',
    }),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
    }),
  description: Joi.string()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'La descripción no puede exceder 200 caracteres',
    }),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .messages({
      'string.pattern.base': 'El color debe ser un código hexadecimal válido (ej: #FF0000)',
    }),
  icon: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'El icono no puede exceder 50 caracteres',
    }),
  is_active: Joi.boolean()
    .optional(),
  sort_order: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.integer': 'El orden debe ser un número entero',
      'number.min': 'El orden debe ser mayor o igual a 0',
    }),
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar',
});

// Middleware de validación genérico
export const validateCategory = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' | 'headers' = 'body') => {
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

    (req as any)[source] = value;
    next();
  };
};

export const validateCreateCategory = validateCategory(createCategorySchema);
export const validateUpdateCategory = validateCategory(updateCategorySchema);

export default {
  createCategorySchema,
  updateCategorySchema,
  validate: validateCategory,
  validateCreateCategory,
  validateUpdateCategory
};
