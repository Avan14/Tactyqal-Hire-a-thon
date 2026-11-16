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
 * Strict input validation. Unknown fields are rejected. There is no implicit
 * type conversion, so a number sent where a string belongs is an error rather
 * than silently stringified; query DTOs convert numbers explicitly with @Type.
 */
export function createValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) =>
      new BadRequestException({
        message: 'Validation failed',
        details: flatten(errors),
      }),
  });
}
