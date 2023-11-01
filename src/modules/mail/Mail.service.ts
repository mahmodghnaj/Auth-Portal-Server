import { Injectable } from '@nestjs/common';
import { MailerService } from '../mailer/mailer.service';
import { AllConfigType } from 'src/config/config.type';
import { ConfigService } from '@nestjs/config';
import { MailData } from './interfaces/mail-data.interface';
import path from 'path';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}
  async userSignUp(mailData: MailData<{ hash: string }>): Promise<void> {
    this.mailerService.sendMail({
      to: mailData.to,
      subject: 'Confirm email',
      text: `${this.configService.get('app.frontendDomain', {
        infer: true,
      })}/auth/confirm-email?hash=${mailData.data.hash}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'modules',
        'mail',
        'mail-templates',
        'activation.hbs',
      ),
      context: {
        title: 'Confirm email',
        url: `${this.configService.get('app.frontendDomain', {
          infer: true,
        })}/auth/confirm-email?hash=${mailData.data.hash}`,
        actionTitle: 'Confirm email',
        app_name: this.configService.get('app.name', { infer: true }),
        text1: 'Hey!',
        text2: 'You’re almost ready to start enjoying',
      },
    });
  }

  async forgotPassword(mailData: MailData<{ hash: string }>): Promise<void> {
    await this.mailerService.sendMail({
      to: mailData.to,
      subject: 'Reset password',
      text: `${this.configService.get('app.frontendDomain', {
        infer: true,
      })}/auth/password-change?hash=${mailData.data.hash}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'modules',
        'mail',
        'mail-templates',
        'reset-password.hbs',
      ),
      context: {
        title: 'Reset password',
        url: `${this.configService.get('app.frontendDomain', {
          infer: true,
        })}/auth/password-change?hash=${mailData.data.hash}`,
        actionTitle: 'Reset password',
        app_name: this.configService.get('app.name', {
          infer: true,
        }),
        text1: 'Trouble signing in?',
        text2: 'Resetting your password is easy.',
        text3:
          'Just press the button below and follow the instructions. We’ll have you up and running in no time',
        text4:
          'If you did not make this request then please ignore this email.',
      },
    });
  }
}
