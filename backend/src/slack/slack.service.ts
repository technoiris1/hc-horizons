import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface SlackMessageBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  elements?: Array<{
    type: string;
    text?: string;
    url?: string;
  }>;
}

@Injectable()
export class SlackService {
  private botToken: string;
  private signingSecret: string;

  constructor(private prisma: PrismaService) {
    this.botToken = process.env.SLACK_BOT_TOKEN || '';
    this.signingSecret = process.env.SLACK_SIGNING_SECRET || '';

    if (!this.botToken) {
      console.warn('SLACK_BOT_TOKEN not configured - Slack notifications disabled');
    }
    if (!this.signingSecret) {
      console.warn('SLACK_SIGNING_SECRET not configured - Slack command verification disabled');
    }
  }

  async getSlackUserEmail(slackUserId: string): Promise<string | null> {
    if (!this.botToken) {
      return null;
    }

    try {
      const response = await fetch(`https://slack.com/api/users.info?user=${slackUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.ok) {
        console.error('Failed to fetch Slack user info:', data.error);
        return null;
      }

      return data.user?.profile?.email || null;
    } catch (error) {
      console.error('Error fetching Slack user email:', error);
      return null;
    }
  }

  async lookupSlackUserByEmail(email: string): Promise<{ slackUserId: string; displayName: string } | null> {
    if (!this.botToken) {
      return null;
    }

    try {
      const response = await fetch(`https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.ok) {
        if (data.error === 'users_not_found') {
          return null;
        }
        console.error('Failed to lookup Slack user by email:', data.error);
        return null;
      }

      return {
        slackUserId: data.user?.id,
        displayName: data.user?.profile?.display_name || data.user?.profile?.real_name || data.user?.name || 'Unknown',
      };
    } catch (error) {
      console.error('Error looking up Slack user by email:', error);
      return null;
    }
  }

  async getSlackUserInfo(slackUserId: string): Promise<{ displayName: string; email: string | null } | null> {
    if (!this.botToken || !slackUserId) {
      return null;
    }

    try {
      const response = await fetch(`https://slack.com/api/users.info?user=${slackUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.ok) {
        console.error('Failed to fetch Slack user info:', data.error);
        return null;
      }

      return {
        displayName: data.user?.profile?.display_name || data.user?.profile?.real_name || data.user?.name || 'Unknown',
        email: data.user?.profile?.email || null,
      };
    } catch (error) {
      console.error('Error fetching Slack user info:', error);
      return null;
    }
  }

  async generateSlackLinkToken(slackUserId: string): Promise<{ success: boolean; message: string; link?: string }> {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.slackLinkToken.create({
      data: {
        slackUserId,
        token,
        expiresAt,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'https://midnight.hackclub.com';
    const link = `${frontendUrl}/slack/link?token=${token}`;

    return {
      success: true,
      message: 'Click the link below to link your Slack account to your Midnight account. The link expires in 1 hour.',
      link,
    };
  }

  async linkSlackAccountWithToken(token: string, userId: number): Promise<{ success: boolean; message: string }> {
    if (!token || token.length !== 64) {
      return { success: false, message: 'Invalid token format.' };
    }

    const linkToken = await this.prisma.slackLinkToken.findUnique({
      where: { token },
    });

    if (!linkToken) {
      return { success: false, message: 'Invalid or expired link token.' };
    }

    const now = new Date();
    if (linkToken.expiresAt < now) {
      return { success: false, message: 'Invalid or expired link token.' };
    }

    if (linkToken.isUsed) {
      return { success: false, message: 'Invalid or expired link token.' };
    }

    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const existingLink = await this.prisma.user.findFirst({
      where: { 
        slackUserId: linkToken.slackUserId,
        NOT: { userId },
      },
    });

    if (existingLink) {
      return { success: false, message: 'This Slack account is already linked to a different Midnight account.' };
    }

    await this.prisma.user.update({
      where: { userId },
      data: { slackUserId: linkToken.slackUserId },
    });

    await this.prisma.slackLinkToken.update({
      where: { id: linkToken.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    return { success: true, message: 'Successfully linked your Slack account! You\'ll now receive notifications when your submissions are reviewed.' };
  }

  async unlinkSlackAccount(slackUserId: string): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { slackUserId },
    });

    if (!user) {
      return { success: false, message: 'No Midnight account is linked to this Slack account.' };
    }

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: { slackUserId: null },
    });

    return { success: true, message: 'Successfully unlinked Slack from your Midnight account.' };
  }

  async sendDirectMessage(
    slackUserId: string,
    message: string,
    blocks?: SlackMessageBlock[],
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.botToken) {
      console.log('Slack not configured, skipping DM');
      return { success: false, error: 'Slack not configured' };
    }

    try {
      const openResponse = await fetch('https://slack.com/api/conversations.open', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ users: slackUserId }),
      });

      const openData = await openResponse.json();

      if (!openData.ok) {
        console.error('Failed to open DM channel:', openData.error);
        return { success: false, error: openData.error };
      }

      const channelId = openData.channel.id;

      const messagePayload: any = {
        channel: channelId,
        text: message,
      };

      if (blocks) {
        messagePayload.blocks = blocks;
      }

      const messageResponse = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload),
      });

      const messageData = await messageResponse.json();

      if (!messageData.ok) {
        console.error('Failed to send Slack message:', messageData.error);
        return { success: false, error: messageData.error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending Slack DM:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async notifySubmissionReview(
    email: string,
    data: {
      projectTitle: string;
      projectId: number;
      approved: boolean;
      approvedHours?: number;
      feedback?: string;
    },
  ): Promise<{ success: boolean; error?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { slackUserId: true, firstName: true },
    });

    if (!user?.slackUserId) {
      return { success: false, error: 'User has no linked Slack account' };
    }

    const projectUrl = `${process.env.FRONTEND_URL || 'https://midnight.hackclub.com'}/app/projects/${data.projectId}`;
    const statusEmoji = data.approved ? '✅' : '❌';
    const statusText = data.approved ? 'approved' : 'needs changes';

    const blocks: SlackMessageBlock[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${statusEmoji} Submission ${data.approved ? 'Approved' : 'Needs Changes'}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Your submission for *${data.projectTitle}* has been ${statusText}.`,
        },
      },
    ];

    if (data.approved && data.approvedHours !== undefined) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Approved Hours:* ${data.approvedHours} hours`,
        },
      });
    }

    if (data.feedback) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Feedback:*\n${data.feedback}`,
        },
      });
    }

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `<${projectUrl}|View your project →>`,
      },
    });

    const fallbackText = `Your submission for "${data.projectTitle}" has been ${statusText}.${data.feedback ? ` Feedback: ${data.feedback}` : ''}`;

    return this.sendDirectMessage(user.slackUserId, fallbackText, blocks);
  }

  verifySlackRequest(
    signature: string,
    timestamp: string,
    body: string,
  ): boolean {
    if (!this.signingSecret) {
      console.warn('Slack signing secret not configured, skipping verification');
      return true;
    }

    const crypto = require('crypto');
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;

    if (parseInt(timestamp) < fiveMinutesAgo) {
      return false;
    }

    const sigBasestring = `v0:${timestamp}:${body}`;
    const mySignature = 'v0=' + crypto
      .createHmac('sha256', this.signingSecret)
      .update(sigBasestring, 'utf8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(mySignature, 'utf8'),
      Buffer.from(signature, 'utf8'),
    );
  }
}

