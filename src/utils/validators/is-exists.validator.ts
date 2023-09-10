import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
@ValidatorConstraint({ name: 'IsExist', async: true })
export class IsExist implements ValidatorConstraintInterface {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async validate(value: string, validationArguments: ValidationArguments) {
    try {
      const nameModel = validationArguments.constraints[0];
      const result = await this.connection
        .model(nameModel)
        .findOne({ [validationArguments.property]: value });
      return Boolean(result);
    } catch (error) {
      console.error('Error in IsExist validator:', error);
      return false;
    }
  }
}
