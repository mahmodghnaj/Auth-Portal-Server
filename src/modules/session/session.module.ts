import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from './schemas/session.schema';

@Module({
  exports: [SessionService],
  providers: [SessionService],
  imports: [
    MongooseModule.forFeature([{ schema: SessionSchema, name: 'Session' }]),
  ],
})
export class SessionModule {}
