import {
  HttpException,
  HttpStatus,
  ValidationError,
  ValidationPipeOptions,
} from '@nestjs/common';

const validationOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  exceptionFactory: (errors: ValidationError[]) =>
    new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        errors: errors.reduce(
          (accumulator, currentValue) => ({
            ...accumulator,
            [currentValue.property]: Object.values(
              currentValue.constraints ?? {},
            ).join(', '),
          }),
          {},
        ),
      },
      HttpStatus.BAD_REQUEST,
    ),
};

export default validationOptions;
