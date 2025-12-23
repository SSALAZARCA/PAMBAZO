import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Esquemas de validación para usuarios
export const userSchemas = {
  // Validación para crear usuario
  createUser: Joi.object({
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
    role: Joi.string()
      .valid('guest', 'user', 'admin', 'owner')
      .optional()
      .default('user')
      .messages({
        'any.only': 'El rol debe ser: guest, user, admin o owner',
      }),
    phone: Joi.string()
      .pattern(/^(\+52)?[1-9]\d{9}$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'El teléfono debe tener un formato válido (ej: +525512345678 o 5512345678)',
      }),
    isActive: Joi.boolean()
      .optional()
      .default(true),
    emailVerified: Joi.boolean()
      .optional()
      .default(false),
  }),

  // Validación para actualizar usuario
  updateUser: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 100 caracteres',
        'string.pattern.base': 'El nombre solo puede contener letras y espacios',
      }),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu', 'gov', 'mx', 'es'] } })
      .optional()
      .max(255)
      .messages({
        'string.email': 'Debe proporcionar un email válido',
        'string.max': 'El email no puede exceder 255 caracteres',
      }),
    phone: Joi.string()
      .pattern(/^(\+52)?[1-9]\d{9}$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'El teléfono debe tener un formato válido (ej: +525512345678 o 5512345678)',
      }),
    isActive: Joi.boolean().optional(),
    emailVerified: Joi.boolean().optional(),
  }),

  // Validación para actualizar rol (solo admin/owner)
  updateUserRole: Joi.object({
    role: Joi.string()
      .valid('guest', 'user', 'admin', 'owner')
      .required()
      .messages({
        'any.only': 'El rol debe ser: guest, user, admin o owner',
        'any.required': 'El rol es requerido',
      }),
  }),

  // Validación para actualizar perfil (usuario actual)
  updateProfile: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede exceder 100 caracteres',
        'string.pattern.base': 'El nombre solo puede contener letras y espacios',
      }),
    phone: Joi.string()
      .pattern(/^(\+52)?[1-9]\d{9}$/)
      .optional()
      .allow('')
      .messages({
        'string.pattern.base': 'El teléfono debe tener un formato válido (ej: +525512345678 o 5512345678)',
      }),
    preferences: Joi.object({
      notifications: Joi.object({
        email: Joi.boolean().optional().default(true),
        push: Joi.boolean().optional().default(true),
        sms: Joi.boolean().optional().default(false),
      }).optional(),
      language: Joi.string()
        .valid('es', 'en')
        .optional()
        .default('es')
        .messages({
          'any.only': 'El idioma debe ser: es o en',
        }),
      theme: Joi.string()
        .valid('light', 'dark', 'auto')
        .optional()
        .default('light')
        .messages({
          'any.only': 'El tema debe ser: light, dark o auto',
        }),
    }).optional(),
  }),

  // Validación para búsqueda de usuarios
  searchUsers: Joi.object({
    query: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'La búsqueda debe tener al menos 2 caracteres',
        'string.max': 'La búsqueda no puede exceder 100 caracteres',
      }),
    role: Joi.string()
      .valid('guest', 'user', 'admin', 'owner')
      .optional()
      .messages({
        'any.only': 'El rol debe ser: guest, user, admin o owner',
      }),
    isActive: Joi.boolean().optional(),
    emailVerified: Joi.boolean().optional(),
    sortBy: Joi.string()
      .valid('name', 'email', 'createdAt', 'lastLogin', 'role')
      .optional()
      .default('createdAt')
      .messages({
        'any.only': 'Ordenar por: name, email, createdAt, lastLogin o role',
      }),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .optional()
      .default('desc')
      .messages({
        'any.only': 'Orden debe ser: asc o desc',
      }),
  }),
};

// Validaciones para parámetros de ruta
export const userParamSchemas = {
  userId: Joi.object({
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

  userEmail: Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu', 'gov', 'mx', 'es'] } })
      .required()
      .max(255)
      .messages({
        'string.email': 'Debe proporcionar un email válido',
        'any.required': 'El email es requerido',
        'string.max': 'El email no puede exceder 255 caracteres',
      }),
  }),
};

// Validaciones para query parameters
export const userQuerySchemas = {
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

  userFilters: Joi.object({
    role: Joi.string()
      .valid('guest', 'user', 'admin', 'owner')
      .optional()
      .messages({
        'any.only': 'El rol debe ser: guest, user, admin o owner',
      }),
    isActive: Joi.boolean().optional(),
    emailVerified: Joi.boolean().optional(),
    createdAfter: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'La fecha debe estar en formato ISO (YYYY-MM-DD)',
      }),
    createdBefore: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'La fecha debe estar en formato ISO (YYYY-MM-DD)',
      }),
    lastLoginAfter: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'La fecha debe estar en formato ISO (YYYY-MM-DD)',
      }),
    lastLoginBefore: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'La fecha debe estar en formato ISO (YYYY-MM-DD)',
      }),
  }),
};

// Middleware de validación genérico
export const validateUser = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' | 'headers' = 'body') => {
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
    req[source] = value;
    next();
  };
};

// Middleware para validar que el usuario puede modificar el recurso
export const validateUserPermissions = (req: Request, res: Response, next: NextFunction) => {
  const currentUser = (req as any).user;
  const targetUserId = parseInt(req.params.id || '0');

  // El usuario puede modificar su propio perfil
  if (currentUser.id === targetUserId) {
    return next();
  }

  // Admin puede modificar usuarios normales
  if (currentUser.role === 'admin' && !['admin', 'owner'].includes(req.body.role)) {
    return next();
  }

  // Owner puede modificar cualquier usuario
  if (currentUser.role === 'owner') {
    return next();
  }

  res.status(403).json({
    error: 'Forbidden',
    message: 'No tienes permisos para realizar esta acción',
  });
  return;
};

// Middleware para validar cambios de rol
export const validateRoleChange = (req: Request, res: Response, next: NextFunction) => {
  const currentUser = (req as any).user;
  const newRole = req.body.role;
  const targetUserId = parseInt(req.params.id || '0');

  // No se puede cambiar el propio rol
  if (currentUser.id === targetUserId) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'No puedes cambiar tu propio rol',
    });
  }

  // Solo owner puede asignar rol de admin u owner
  if (['admin', 'owner'].includes(newRole) && currentUser.role !== 'owner') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Solo el propietario puede asignar roles de administrador',
    });
    return;
  }

  // Admin puede asignar roles de guest y user
  if (['guest', 'user'].includes(newRole) && ['admin', 'owner'].includes(currentUser.role)) {
    return next();
  }

  // Owner puede asignar cualquier rol
  if (currentUser.role === 'owner') {
    return next();
  }

  res.status(403).json({
    error: 'Forbidden',
    message: 'No tienes permisos para cambiar este rol',
  });
  return;
};

// Middlewares específicos para cada endpoint
export const validateCreateUser = validateUser(userSchemas.createUser);
export const validateUpdateUser = validateUser(userSchemas.updateUser);
export const validateUpdateUserRole = validateUser(userSchemas.updateUserRole);
export const validateUpdateProfile = validateUser(userSchemas.updateProfile);
export const validateSearchUsers = validateUser(userSchemas.searchUsers, 'query');

// Validadores para parámetros
export const validateUserId = validateUser(userParamSchemas.userId, 'params');
export const validateUserEmail = validateUser(userParamSchemas.userEmail, 'params');

// Validadores para query parameters
export const validateUserPagination = validateUser(userQuerySchemas.pagination, 'query');
export const validateUserFilters = validateUser(userQuerySchemas.userFilters, 'query');

export default {
  schemas: userSchemas,
  paramSchemas: userParamSchemas,
  querySchemas: userQuerySchemas,
  validate: validateUser,
  validateCreateUser,
  validateUpdateUser,
  validateUpdateUserRole,
  validateUpdateProfile,
  validateSearchUsers,
  validateUserId,
  validateUserEmail,
  validateUserPagination,
  validateUserFilters,
  validateUserPermissions,
  validateRoleChange,
};
