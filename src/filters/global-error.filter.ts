import { Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
class GlobalErrorFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const errorResponse = exception?.response;
    let status: number;
    let message: string;

    if (errorResponse) {
      status = errorResponse instanceof HttpException ? errorResponse.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      message = errorResponse.message ?? 'Internal server error';
      Logger.error(request.url, errorResponse.message, errorResponse.stack);
    } else {
      status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message ?? 'Internal server error';
      Logger.error(request.url, exception.message, exception.stack);
    }

    response.status(HttpStatus.OK).json({
      data: null,
      status,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}

export { GlobalErrorFilter };
