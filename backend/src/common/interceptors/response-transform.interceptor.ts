import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse<{ statusCode?: number }>();

    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'statusCode' in data &&
          'message' in data
        ) {
          return data;
        }

        const statusCode = res.statusCode ?? 200;
        const message = defaultSuccessMessage(statusCode);

        if (data && typeof data === 'object' && 'meta' in data && 'data' in data) {
          return { statusCode, message, ...data };
        }

        return { statusCode, message, data };
      }),
    );
  }
}

function defaultSuccessMessage(statusCode: number): string {
  if (statusCode === 201) return 'Created successfully';
  if (statusCode === 204) return 'Deleted successfully';
  return 'Request successful';
}
