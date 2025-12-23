import { Request, Response, NextFunction } from 'express';

interface LoggedRequest extends Request {
  startTime?: number;
}

export const requestLogger = (req: LoggedRequest, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  req.startTime = startTime;

  // Log de la request entrante
  console.log(`📥 ${req.method} ${req.originalUrl} - ${req.ip} - ${new Date().toISOString()}`);

  // Interceptar la respuesta para loggear cuando termine
  const originalSend = res.send;
  res.send = function(body: any) {
    const duration = Date.now() - startTime;
    const statusColor = getStatusColor(res.statusCode);
    
    console.log(
      `📤 ${req.method} ${req.originalUrl} - ${statusColor}${res.statusCode}\x1b[0m - ${duration}ms - ${req.ip}`
    );

    // Si hay error (status >= 400), loggear más detalles
    if (res.statusCode >= 400) {
      console.log(`❌ Error details: ${body}`);
    }

    return originalSend.call(this, body);
  };

  next();
};

function getStatusColor(statusCode: number): string {
  if (statusCode >= 500) return '\x1b[31m'; // Rojo
  if (statusCode >= 400) return '\x1b[33m'; // Amarillo
  if (statusCode >= 300) return '\x1b[36m'; // Cian
  if (statusCode >= 200) return '\x1b[32m'; // Verde
  return '\x1b[0m'; // Default
}
