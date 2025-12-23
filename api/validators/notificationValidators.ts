import Joi from 'joi';

export const createNotificationSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'El título debe tener al menos 2 caracteres',
      'string.max': 'El título no puede exceder 100 caracteres',
      'any.required': 'El título es requerido',
    }),
  message: Joi.string()
    .min(2)
    .max(500)
    .required()
    .messages({
      'string.min': 'El mensaje debe tener al menos 2 caracteres',
      'string.max': 'El mensaje no puede exceder 500 caracteres',
      'any.required': 'El mensaje es requerido',
    }),
  type: Joi.string()
    .valid('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'ORDER', 'INVENTORY', 'SYSTEM')
    .required()
    .messages({
      'any.only': 'El tipo debe ser INFO, WARNING, ERROR, SUCCESS, ORDER, INVENTORY o SYSTEM',
      'any.required': 'El tipo es requerido',
    }),
  user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.integer': 'El ID del usuario debe ser un número entero',
      'number.positive': 'El ID del usuario debe ser positivo',
    }),
  role: Joi.string()
    .valid('OWNER', 'ADMIN', 'WAITER', 'KITCHEN', 'CUSTOMER')
    .optional()
    .messages({
      'any.only': 'El rol debe ser OWNER, ADMIN, WAITER, KITCHEN o CUSTOMER',
    }),
  priority: Joi.string()
    .valid('LOW', 'MEDIUM', 'HIGH', 'URGENT')
    .default('MEDIUM')
    .messages({
      'any.only': 'La prioridad debe ser LOW, MEDIUM, HIGH o URGENT',
    }),
  action_url: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'La URL de acción debe ser válida',
    }),
  expires_at: Joi.date()
    .iso()
    .greater('now')
    .optional()
    .messages({
      'date.greater': 'La fecha de expiración debe ser futura',
    }),
}).or('user_id', 'role').messages({
  'object.missing': 'Debe especificar user_id o role',
});
