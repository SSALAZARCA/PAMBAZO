export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';

    // Mantener el stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  // Métodos estáticos para errores comunes
  static badRequest(message: string = 'Solicitud incorrecta', details?: any): ApiError {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message: string = 'No autorizado', details?: any): ApiError {
    return new ApiError(401, 'UNAUTHORIZED', message, details);
  }

  static forbidden(message: string = 'Acceso prohibido', details?: any): ApiError {
    return new ApiError(403, 'FORBIDDEN', message, details);
  }

  static notFound(message: string = 'Recurso no encontrado', details?: any): ApiError {
    return new ApiError(404, 'NOT_FOUND', message, details);
  }

  static conflict(message: string = 'Conflicto de datos', details?: any): ApiError {
    return new ApiError(409, 'CONFLICT', message, details);
  }

  static validation(message: string = 'Error de validación', details?: any): ApiError {
    return new ApiError(422, 'VALIDATION_ERROR', message, details);
  }

  static internal(message: string = 'Error interno del servidor', details?: any): ApiError {
    return new ApiError(500, 'INTERNAL_SERVER_ERROR', message, details);
  }
}
