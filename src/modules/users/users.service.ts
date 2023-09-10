import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NullableType } from 'src/utils/types/nullable.type';
import { CreateUserDto } from './dto/create-user.dto';
import { Users, UsersDocument } from './schemas/users.schema';
import { EntityCondition } from 'src/utils/types/entity-condition.type';

@Injectable()
export class UsersService {
  constructor(@InjectModel('Users') private usersModel: Model<Users>) {}

  async createUser(createUser: CreateUserDto): Promise<UsersDocument> {
    const createdUser = new this.usersModel(createUser);
    return await createdUser.save();
  }

  async validateUser(
    payload: EntityCondition<UsersDocument>,
  ): Promise<NullableType<UsersDocument>> {
    return await this.usersModel
      .findOne({
        ...payload,
      })
      .select('+password')
      .select('+refreshToken')
      .select('+hash')
      .exec();
  }
  async findOne(
    fields: EntityCondition<UsersDocument>,
  ): Promise<NullableType<UsersDocument>> {
    return await this.usersModel.findOne({
      ...fields,
    });
  }
  async update(
    id: UsersDocument['id'],
    payload: EntityCondition<UsersDocument>,
  ): Promise<Users> {
    const user = await this.usersModel.findByIdAndUpdate(
      id,
      { ...payload },
      {
        new: true,
      },
    );

    return user;
  }
}
