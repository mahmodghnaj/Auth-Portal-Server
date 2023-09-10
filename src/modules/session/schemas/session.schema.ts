import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Users } from 'src/modules/users/schemas/users.schema';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  user: Users;
  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
