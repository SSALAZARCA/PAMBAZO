import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Esquemas de validación para autenticación
export const authSchemas = {
  // Validación para login
  login: Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu', 'gov', 'mx', 'es'] } })
      .required()
      .max(255)
      .messages({
        'string.email': 'Debe proporcionar un email válido',
        'string.empty': 'El email es requerido',
        'any.required': 'El email es requerido',
        'string.max': 'El email no puede exceder 255 caracteres',
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'string.max': 'La contraseña no puede exceder 128 caracteres',
        'string.empty': 'La contraseña es requerida',
        'any.required': 'La contraseña es requerida',
      }),
    rememberMe: Joi.boolean().optional(),
  }),

  // Validación para registro
  register: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 100 caracteres',
        'string.empty': 'El nombre es requerido',
        'any.required': 'El nombre es requerido',
        'string.pattern.base': 'El nombre solo puede contener letras y espacios',
      }),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu', 'gov', 'mx', 'es'] } })
      .required()
      .max(255)
      .messages({
        'string.email': 'Debe proporcionar un email válido',
        'string.empty': 'El email es requerido',
        'any.required': 'El email es requerido',
        'string.max': 'El email no puede exceder 255 caracteres',
      }),
    password: Joi.string()
      .min(8)
      .max(128)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres',
        'string.max': 'La contraseña no puede exceder 128 caracteres',
        'string.empty': 'La contraseña es requerida',
        'any.required': 'La contraseña es requerida',
        'string.pattern.base': 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Las contraseñas no coinciden',
        'any.required': 'La confirmación de contraseña es requerida',
      }),
    phone: Joi.string()
      .pattern(/^(\+52)?[1-9]\d{9}$/)
      .optional()
      .messages({
        'string.pattern.base': 'El teléfono debe tener un formato válido (ej: +525512345678 o 5512345678)',
      }),
    acceptTerms: Joi.boolean()
      .valid(true)
      .required()
      .messages({
        'any.only': 'Debe aceptar los términos y condiciones',
        'any.required': 'Debe aceptar los términos y condiciones',
      }),
  }),

  // Validación para cambio de contraseña
  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'string.empty': 'La contraseña actual es requerida',
        'any.required': 'La contraseña actual es requerida',
      }),
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.min': 'La nueva contraseña debe tener al menos 8 caracteres',
        'string.max': 'La nueva contraseña no puede exceder 128 caracteres',
        'string.empty': 'La nueva contraseña es requerida',
        'any.required': 'La nueva contraseña es requerida',
        'string.pattern.base': 'La nueva contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial',
      }),
    confirmNewPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Las contraseñas no coinciden',
        'any.required': 'La confirmación de la nueva contraseña es requerida',
      }),
  }),

  // Validación para recuperación de contraseña
  forgotPassword: Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu', 'gov', 'mx', 'es'] } })
      .required()
      .max(255)
      .messages({
        'string.email': 'Debe proporcionar un email válido',
        'string.empty': 'El email es requerido',
        'any.required': 'El email es requerido',
        'string.max': 'El email no puede exceder 255 caracteres',
      }),
  }),

  // Validación para reset de contraseña
  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .length(64)
      .hex()
      .messages({
        'string.empty': 'El token es requerido',
        'any.required': 'El token es requerido',
        'string.length': 'Token inválido',
        'string.hex': 'Token inválido',
      }),
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.min': 'La contraseña debe tener al menos 8 caracteres',
        'string.max': 'La contraseña no puede exceder 128 caracteres',
        'string.empty': 'La contraseña es requerida',
        'any.required': 'La contraseña es requerida',
        'string.pattern.base': 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Las contraseñas no coinciden',
        'any.required': 'La confirmación de contraseña es requerida',
      }),
  }),

  // Validación para verificación de email
  verifyEmail: Joi.object({
    token: Joi.string()
      .required()
      .length(64)
      .hex()
      .messages({
        'string.empty': 'El token es requerido',
        'any.required': 'El token es requerido',
        'string.length': 'Token inválido',
        'string.hex': 'Token inválido',
      }),
  }),

  // Validación para refresh token
  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'string.empty': 'El refresh token es requerido',
        'any.required': 'El refresh token es requerido',
      }),
  }),

  // Validación para logout
  logout: Joi.object({
    refreshToken: Joi.string().optional(),
    logoutFromAllDevices: Joi.boolean().optional().default(false),
  }),
};

// Validaciones para headers
export const authHeaderSchemas = {
  authorization: Joi.object({
    authorization: Joi.string()
      .pattern(/^Bearer [A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Token de autorización inválido',
        'any.required': 'Token de autorización requerido',
      }),
  }),

  apiKey: Joi.object({
    'x-api-key': Joi.string()
      .required()
      .length(32)
      .hex()
      .messages({
        'string.length': 'API Key inválida',
        'string.hex': 'API Key inválida',
        'any.required': 'API Key requerida',
      }),
  }),
};

// Validaciones para query parameters
export const authQuerySchemas = {
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
};

// Middleware de validación genérico
export const validateAuth = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' | 'headers' = 'body') => {
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

    // Reemplazar los datos originales con los validados y transformados
    (req as any)[source] = value;
    next();
  };
};

// Middlewares específicos para cada endpoint
export const validateLogin = validateAuth(authSchemas.login);
export const validateRegister = validateAuth(authSchemas.register);
export const validateChangePassword = validateAuth(authSchemas.changePassword);
export const validateForgotPassword = validateAuth(authSchemas.forgotPassword);
export const validateResetPassword = validateAuth(authSchemas.resetPassword);
export const validateVerifyEmail = validateAuth(authSchemas.verifyEmail);
export const validateRefreshToken = validateAuth(authSchemas.refreshToken);
export const validateLogout = validateAuth(authSchemas.logout);

// Validadores para headers
export const validateAuthHeader = validateAuth(authHeaderSchemas.authorization, 'headers');
export const validateApiKeyHeader = validateAuth(authHeaderSchemas.apiKey, 'headers');

// Validadores para query parameters
export const validatePagination = validateAuth(authQuerySchemas.pagination, 'query');

export default {
  schemas: authSchemas,
  headerSchemas: authHeaderSchemas,
  querySchemas: authQuerySchemas,
  validate: validateAuth,
  validateLogin,
  validateRegister,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyEmail,
  validateRefreshToken,
  validateLogout,
  validateAuthHeader,
  validateApiKeyHeader,
  validatePagination,
};
