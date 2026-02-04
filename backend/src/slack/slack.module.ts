import { Module } from '@nestjs/common';
import { SlackController } from './slack.controller';
import { SlackService } from './slack.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SlackController],
  providers: [SlackService, PrismaService],
  exports: [SlackService],
})
export class SlackModule {}


