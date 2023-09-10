import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { NullableType } from 'src/utils/types/nullable.type';

@Injectable()
export class SessionService {
  constructor(@InjectModel('Session') private sessionModel: Model<Session>) {}

  async create(data: EntityCondition<Session>): Promise<SessionDocument> {
    const createdUser = new this.sessionModel(data);
    return await createdUser.save();
  }
  async findOne(
    options: EntityCondition<SessionDocument>,
  ): Promise<NullableType<SessionDocument>> {
    return this.sessionModel.findOne({
      ...options,
    });
  }
  async softDelete(id: SessionDocument['id']): Promise<SessionDocument> {
    const user = await this.sessionModel
      .findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true })
      .exec();
    return user;
  }
}
