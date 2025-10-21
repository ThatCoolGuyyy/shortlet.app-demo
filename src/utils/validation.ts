import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationError } from './errors';

export async function validateDto<T>(cls: ClassConstructor<T>, payload: unknown): Promise<T> {
  const instance = plainToInstance(cls, payload);
  const errors = await validate(instance as object, {
    whitelist: true,
    forbidUnknownValues: true,
    forbidNonWhitelisted: true
  });

  if (errors.length > 0) {
    const details = errors.map((error) => ({
      property: error.property,
      constraints: error.constraints,
      children: error.children
    }));
    throw new ValidationError('Validation failed', details);
  }

  return instance;
}
