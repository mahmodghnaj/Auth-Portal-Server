import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { NullableType } from 'src/utils/types/nullable.type';
import { Forgot, ForgotDocument } from './schemas/forgot.schema';

@Injectable()
export class ForgotService {
  constructor(@InjectModel('Forgot') private forgotModel: Model<Forgot>) {}

  async create(data: EntityCondition<Forgot>): Promise<ForgotDocument> {
    const createdUser = new this.forgotModel(data);
    return await createdUser.save();
  }

  async findOne(
    options: EntityCondition<ForgotDocument>,
  ): Promise<NullableType<ForgotDocument>> {
    return this.forgotModel.findOne({
      ...options,
    });
  }

  async softDelete(id: ForgotDocument['id']): Promise<ForgotDocument> {
    const user = await this.forgotModel
      .findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true })
      .exec();
    return user;
  }
}
