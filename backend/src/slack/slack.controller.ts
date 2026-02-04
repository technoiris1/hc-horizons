import { Controller, Post, Body, Headers, Res, HttpStatus, RawBodyRequest, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { SlackService } from './slack.service';

@Controller('api/slack')
export class SlackController {
  constructor(private slackService: SlackService) {}

  @Post('commands')
  async handleSlashCommand(
    @Body() body: any,
    @Headers('x-slack-signature') signature: string,
    @Headers('x-slack-request-timestamp') timestamp: string,
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    const rawBody = req.rawBody?.toString() || '';

    if (!this.slackService.verifySlackRequest(signature, timestamp, rawBody)) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Invalid signature' });
    }

    const { command, text, user_id: slackUserId, user_name: slackUsername } = body;

    if (command !== '/midnight') {
      return res.status(HttpStatus.OK).json({
        response_type: 'ephemeral',
        text: 'Unknown command.',
      });
    }

    const args = (text || '').trim().split(/\s+/);
    const subcommand = args[0]?.toLowerCase();

    if (subcommand === 'link') {
      const result = await this.slackService.generateSlackLinkToken(slackUserId);

      if (!result.success) {
        return res.status(HttpStatus.OK).json({
          response_type: 'ephemeral',
          text: `❌ ${result.message}`,
        });
      }

      return res.status(HttpStatus.OK).json({
        response_type: 'ephemeral',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: result.message,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `<${result.link}|🔗 Click here to link your Midnight account>`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: 'This link expires in 1 hour. You must be logged into your Midnight account to complete the link.',
              },
            ],
          },
        ],
        text: `${result.message}\n\n${result.link}`,
      });
    }

    if (subcommand === 'unlink') {
      const result = await this.slackService.unlinkSlackAccount(slackUserId);

      return res.status(HttpStatus.OK).json({
        response_type: 'ephemeral',
        text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
      });
    }

    return res.status(HttpStatus.OK).json({
      response_type: 'ephemeral',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*🌙 Midnight Slack Commands*',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '`/midnight link` - Get a link to connect your Slack to any Midnight account\n`/midnight unlink` - Unlink your Slack from your Midnight account',
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: 'Once linked, you\'ll receive notifications about your submission reviews directly in Slack!',
            },
          ],
        },
      ],
      text: 'Midnight Slack Commands:\n/midnight link - Get a link to connect your Slack\n/midnight unlink - Unlink your Slack',
    });
  }
}

