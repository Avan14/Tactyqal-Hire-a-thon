import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '../generated/prisma/client';

export interface ErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

const CODE_BY_STATUS: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'PAYLOAD_TOO_LARGE',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'TOO_MANY_REQUESTS',
};

/**
 * Every error leaves the API in one shape:
 * { error: { code, message, details?, requestId } }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { id?: string }>();
    const response = ctx.getResponse<Response>();

    const { status, body } = toErrorResponse(exception);
    if (request.id) body.error.requestId = String(request.id);

    if (status >= 500) {
      this.logger.error(
        { err: exception, path: request.url },
        'Unhandled error while processing request',
      );
    }
    response.status(status).json(body);
  }
}

export function toErrorResponse(exception: unknown): {
  status: number;
  body: ErrorBody;
} {
  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const res = exception.getResponse();
    const payload =
      typeof res === 'object' && res !== null
        ? (res as Record<string, unknown>)
        : {};
    const message =
      typeof res === 'string'
        ? res
        : typeof payload.message === 'string'
          ? payload.message
          : exception.message;
    return build(
      status,
      CODE_BY_STATUS[status] ?? `HTTP_${status}`,
      message,
      payload.details,
    );
  }

  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2025':
        return build(HttpStatus.NOT_FOUND, 'NOT_FOUND', 'Resource not found');
      case 'P2002':
        return build(
          HttpStatus.CONFLICT,
          'CONFLICT',
          'A record with this value already exists',
          { fields: exception.meta?.target },
        );
      case 'P2003':
        return build(
          HttpStatus.BAD_REQUEST,
          'BAD_REQUEST',
          'A referenced record does not exist',
        );
    }
  }

  return build(
    HttpStatus.INTERNAL_SERVER_ERROR,
    'INTERNAL_ERROR',
    'Something went wrong',
  );
}

function build(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  const body: ErrorBody = { error: { code, message } };
  if (details !== undefined) body.error.details = details;
  return { status, body };
}
