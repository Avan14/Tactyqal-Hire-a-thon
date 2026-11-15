import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

export interface FieldError {
  field: string;
  messages: string[];
}

function flatten(errors: ValidationError[], parent = ''): FieldError[] {
  return errors.flatMap((e) => {
    const field = parent ? `${parent}.${e.property}` : e.property;
    const own = e.constraints
      ? [{ field, messages: Object.values(e.constraints) }]
      : [];
    return [...own, ...flatten(e.children ?? [], field)];
  });
}

/**
 * Strict input validation. Unknown fields are rejected, and query-string
 * values are coerced to the DTO's declared types.
 */
export function createValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors) =>
      new BadRequestException({
        message: 'Validation failed',
        details: flatten(errors),
      }),
  });
}
