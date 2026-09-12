import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@Inject('winston') private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const status = res.statusCode;
        const elapsed = Date.now() - startTime;

        const meta = { method, url, status, elapsed: `${elapsed}ms` };

        if (status >= 500) {
          this.logger.error(`${method} ${url} ${status} ${elapsed}ms`, meta);
        } else if (status >= 400) {
          this.logger.warn(`${method} ${url} ${status} ${elapsed}ms`, meta);
        } else {
          this.logger.info(`${method} ${url} ${status} ${elapsed}ms`, meta);
        }
      }),
    );
  }
}
