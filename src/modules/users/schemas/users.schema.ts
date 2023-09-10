import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UsersDocument = HydratedDocument<Users>;

export enum StatusEnum {
  'active' = 1,
  'inactive' = 2,
}
@Schema({ timestamps: true })
export class Users {
  @Prop({ required: true })
  firstName: string;
  @Prop({})
  lastName: string;
  @Prop({ unique: true })
  email: string;
  @Prop({ select: false })
  password: string;
  @Prop({ select: false })
  refreshToken: string[];
  @Prop({ enum: StatusEnum })
  status: StatusEnum;
  @Prop({ select: false })
  hash: string;
  @Prop({ type: Date })
  lastPasswordChange: Date;
}
export const UsersSchema = SchemaFactory.createForClass(Users);

UsersSchema.pre('save', async function (next) {
  const user = this as Users;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
    next();
  } catch (err) {
    return next(err);
  }
});

UsersSchema.pre('findOneAndUpdate', async function (next) {
  const update: any = this.getUpdate();

  if (!update.password) {
    return next();
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(update.password, saltRounds);
    update.password = hashedPassword;
    next();
  } catch (err) {
    return next(err);
  }
});
