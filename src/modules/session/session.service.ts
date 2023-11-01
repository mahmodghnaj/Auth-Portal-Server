import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { NullableType } from 'src/utils/types/nullable.type';
import * as bcrypt from 'bcrypt';

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
  async update(
    id: SessionDocument['id'],
    payload: EntityCondition<SessionDocument>,
  ): Promise<Session> {
    const session = await this.sessionModel.findByIdAndUpdate(
      id,
      { ...payload },
      {
        new: true,
      },
    );

    return session;
  }
  async softDelete(id: SessionDocument['id']): Promise<SessionDocument> {
    const user = await this.sessionModel
      .findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true })
      .exec();
    return user;
  }
  async infoSession(
    options: EntityCondition<SessionDocument>,
  ): Promise<NullableType<SessionDocument>> {
    const res = await this.sessionModel
      .findOne({
        ...options,
      })
      .populate('user');

    return res;
  }
}
