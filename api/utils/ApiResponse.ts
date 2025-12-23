import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    version: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    requestId?: string;
  };
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200,
    meta?: any
  ): void {
    const response: ApiResponseData<T> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        ...meta,
      },
    };

    res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = 'Recurso creado exitosamente'
  ): void {
    ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response, message: string = 'Operación exitosa'): void {
    res.status(204).json({
      success: true,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message?: string
  ): void {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    ApiResponse.success(
      res,
      data,
      message,
      200,
      {
        pagination: {
          ...pagination,
          totalPages,
        },
      }
    );
  }

  static error(
    res: Response,
    statusCode: number,
    code: string,
    message: string,
    details?: any,
    requestId?: string
  ): void {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    res.status(statusCode).json(response);
  }
}
