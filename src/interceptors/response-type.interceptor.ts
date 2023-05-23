import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
class ResponseTypeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    response.setHeader('Content-Type', 'application/json');

    return next.handle().pipe(
      map((data) => {
        // You can modify the response data here if needed
        return data;
      }),
    );
  }
}

export { ResponseTypeInterceptor };
