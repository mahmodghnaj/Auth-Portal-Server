import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersSchema } from './schemas/users.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: UsersSchema, name: 'Users' }]),
    MailerModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
