import Joi from 'joi';

export const createTableSchema = Joi.object({
  number: Joi.number()
    .integer()
    .min(1)
    .max(999)
    .required()
    .messages({
      'number.integer': 'El número de mesa debe ser un número entero',
      'number.min': 'El número de mesa debe ser al menos 1',
      'number.max': 'El número de mesa no puede exceder 999',
      'any.required': 'El número de mesa es requerido',
    }),
  capacity: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .required()
    .messages({
      'number.integer': 'La capacidad debe ser un número entero',
      'number.min': 'La capacidad debe ser al menos 1',
      'number.max': 'La capacidad no puede exceder 20',
      'any.required': 'La capacidad es requerida',
    }),
  location: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'La ubicación no puede exceder 100 caracteres',
    }),
  qr_code: Joi.string()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'El código QR no puede exceder 200 caracteres',
    }),
  is_active: Joi.boolean()
    .default(true),
});

export const updateTableSchema = Joi.object({
  number: Joi.number()
    .integer()
    .min(1)
    .max(999)
    .optional()
    .messages({
      'number.integer': 'El número de mesa debe ser un número entero',
      'number.min': 'El número de mesa debe ser al menos 1',
      'number.max': 'El número de mesa no puede exceder 999',
    }),
  capacity: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .optional()
    .messages({
      'number.integer': 'La capacidad debe ser un número entero',
      'number.min': 'La capacidad debe ser al menos 1',
      'number.max': 'La capacidad no puede exceder 20',
    }),
  location: Joi.string()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'La ubicación no puede exceder 100 caracteres',
    }),
  qr_code: Joi.string()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'El código QR no puede exceder 200 caracteres',
    }),
  is_active: Joi.boolean()
    .optional(),
  status: Joi.string()
    .valid('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING')
    .optional()
    .messages({
      'any.only': 'El estado debe ser AVAILABLE, OCCUPIED, RESERVED o CLEANING',
    }),
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar',
});
