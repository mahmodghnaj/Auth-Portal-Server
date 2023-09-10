import { Module } from '@nestjs/common';
import { ForgotService } from './forgot.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ForgeSchema } from './schemas/forgot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: ForgeSchema, name: 'Forgot' }]),
  ],
  providers: [ForgotService],
  exports: [ForgotService],
})
export class ForgotModule {}
