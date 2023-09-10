import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Users } from 'src/modules/users/schemas/users.schema';

export type ForgotDocument = HydratedDocument<Forgot>;

@Schema({ timestamps: true })
export class Forgot {
  @Prop({ required: true })
  hash: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  user: Users;
  @Prop({ type: Date, default: null })
  deletedAt: Date;
  @Prop({ type: Date, default: null, required: true })
  expires: Date;
}
export const ForgeSchema = SchemaFactory.createForClass(Forgot);
