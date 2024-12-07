import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from 'src/utils/logger.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private consoleLogger = new Logger('HTTP');
  constructor(private logger: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    const start = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const processingTime = Date.now() - start;
      const msg = `${method} ${originalUrl} - status: ${statusCode} - size: ${contentLength} Bytes - userAgent: ${userAgent} - IP: ${ip} - ${processingTime}ms`;
      this.consoleLogger.log(msg);
      this.logger.log(msg);
    });

    next();
  }
}
