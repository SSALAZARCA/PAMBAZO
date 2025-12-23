import Joi from 'joi';

export const createSupplierSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre es requerido',
    }),
  contact_name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.min': 'El nombre de contacto debe tener al menos 2 caracteres',
      'string.max': 'El nombre de contacto no puede exceder 100 caracteres',
    }),
  email: Joi.string()
    .email()
    .optional()
    .allow('')
    .messages({
      'string.email': 'El email debe tener un formato válido',
    }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'El teléfono debe tener un formato válido',
    }),
  address: Joi.string()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'La dirección no puede exceder 200 caracteres',
    }),
  tax_id: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'El ID fiscal no puede exceder 50 caracteres',
    }),
  payment_terms: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Los términos de pago no pueden exceder 100 caracteres',
    }),
  is_active: Joi.boolean()
    .default(true),
});

export const updateSupplierSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
    }),
  contact_name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.min': 'El nombre de contacto debe tener al menos 2 caracteres',
      'string.max': 'El nombre de contacto no puede exceder 100 caracteres',
    }),
  email: Joi.string()
    .email()
    .optional()
    .allow('')
    .messages({
      'string.email': 'El email debe tener un formato válido',
    }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'El teléfono debe tener un formato válido',
    }),
  address: Joi.string()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'La dirección no puede exceder 200 caracteres',
    }),
  tax_id: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'El ID fiscal no puede exceder 50 caracteres',
    }),
  payment_terms: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Los términos de pago no pueden exceder 100 caracteres',
    }),
  is_active: Joi.boolean()
    .optional(),
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar',
});
