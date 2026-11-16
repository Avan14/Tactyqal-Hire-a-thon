import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { Transform } from 'class-transformer';
import { ValidateIf } from 'class-validator';

/** Trims strings before validation, so "   " fails @IsNotEmpty. */
export const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

/**
 * Optional, but never null. @IsOptional skips validation for null as well as
 * undefined, which would let a PATCH write null into a required column.
 * This skips only undefined, so null is validated and rejected.
 */
export const OptionalNotNull = () =>
  ValidateIf((_object, value) => value !== undefined);

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
