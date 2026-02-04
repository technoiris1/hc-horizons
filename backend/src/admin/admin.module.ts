import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma.service';
import { AirtableModule } from '../airtable/airtable.module';
import { MailModule } from '../mail/mail.module';
import { SlackModule } from '../slack/slack.module';

@Module({
  imports: [AirtableModule, MailModule, SlackModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
})
export class AdminModule {}
