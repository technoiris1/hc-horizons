import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

import { randomInt } from 'crypto';
import { RedisService } from '../redis.service';
import { MailService } from '../mail/mail.service';
import * as jose from 'jose';

interface HackClubTokenResponse {
  access_token: string;
  token_type: string;
  id_token: string;
}

interface HackClubIdTokenClaims {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  birthdate?: string;
  slack_id?: string;
  verification_status?: string;
}

@Injectable()
export class AuthService {
  private readonly SESSION_EXPIRY_MS = 21 * 24 * 60 * 60 * 1000;
  private readonly OTP_EXPIRY_MS = 600000;
  private readonly HACKCLUB_AUTH_URL = 'https://auth.hackclub.com';
  private jwks: jose.JWTVerifyGetKey | null = null;

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private mailService: MailService,
  ) {}

  getAuthUrl(referralCode?: string): string {
    const clientId = process.env.HACKCLUB_CLIENT_ID;
    const redirectUri = process.env.HACKCLUB_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new HttpException('OAuth not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email slack_id',
    });

    if (referralCode) {
      params.set('state', referralCode);
    }

    return `${this.HACKCLUB_AUTH_URL}/oauth/authorize?${params.toString()}`;
  }

  async handleCallback(code: string, state?: string): Promise<{ sessionId: string; isNewUser: boolean; user: any }> {
    const clientId = process.env.HACKCLUB_CLIENT_ID;
    const clientSecret = process.env.HACKCLUB_CLIENT_SECRET;
    const redirectUri = process.env.HACKCLUB_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new HttpException('OAuth not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const tokenResponse = await fetch(`${this.HACKCLUB_AUTH_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      throw new UnauthorizedException('Failed to authenticate with Hack Club');
    }

    const tokens: HackClubTokenResponse = await tokenResponse.json();
    const claims = await this.verifyIdToken(tokens.id_token);

    if (!claims.email) {
      throw new BadRequestException('Email not provided by Hack Club Auth');
    }

    const referralCode = state || null;
    const { user, isNewUser } = await this.findOrCreateUser(claims, referralCode);

    if (!isNewUser && this.calculateAge(user.birthday) >= 19) {
      throw new ForbiddenException('You must be under 19 to sign in.');
    }

    const session = await this.prisma.userSession.create({
      data: {
        userId: user.userId,
        expiresAt: new Date(Date.now() + this.SESSION_EXPIRY_MS),
      },
    });

    return {
      sessionId: session.id,
      isNewUser: !user.onboardComplete || user.firstName === 'Temporary',
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  private async verifyIdToken(idToken: string): Promise<HackClubIdTokenClaims> {
    if (!this.jwks) {
      this.jwks = jose.createRemoteJWKSet(new URL(`${this.HACKCLUB_AUTH_URL}/oauth/discovery/keys`));
    }

    try {
      const { payload } = await jose.jwtVerify(idToken, this.jwks, {
        issuer: this.HACKCLUB_AUTH_URL,
        audience: process.env.HACKCLUB_CLIENT_ID,
      });
      return payload as unknown as HackClubIdTokenClaims;
    } catch (error) {
      console.error('ID token verification failed:', error);
      throw new UnauthorizedException('Invalid ID token');
    }
  }

  private async findOrCreateUser(claims: HackClubIdTokenClaims, referralCode: string | null) {
    const email = claims.email!;
    const hcaId = claims.sub;

    let existingUser = await this.prisma.user.findUnique({ where: { hcaId } });
    if (!existingUser) {
      existingUser = await this.prisma.user.findUnique({ where: { email } });
    }

    if (!existingUser) {
      const hackatimeAccount = await this.checkHackatimeAccount(email);

      const firstName = claims.given_name || 'Temporary';
      const lastName = claims.family_name || 'User';
      const birthday = claims.birthdate ? new Date(claims.birthdate) : null;
      const slackUserId = claims.slack_id || null;
      const verificationStatus = claims.verification_status || null;

      let rafflePos: string | null = null;
      try {
        const airtableUser = await this.prisma.$queryRaw<Array<{
          code: string | null;
        }>>`
          SELECT CAST(code AS TEXT) as code
          FROM users_airtable
          WHERE email = ${email}
          LIMIT 1
        `;

        if (airtableUser && airtableUser.length > 0) {
          rafflePos = airtableUser[0].code ?? null;
        } else {
          const maxUserCodeResult = await this.prisma.$queryRaw<Array<{ max_code: string | null }>>`
            SELECT CAST(MAX(CAST(raffle_pos AS INTEGER)) AS TEXT) as max_code
            FROM users WHERE raffle_pos IS NOT NULL AND raffle_pos ~ '^[0-9]+$'
          `;
          const maxAirtableCodeResult = await this.prisma.$queryRaw<Array<{ max_code: string | null }>>`
            SELECT CAST(MAX(code) AS TEXT) as max_code FROM users_airtable
          `;
          const maxUserCode = maxUserCodeResult?.[0]?.max_code ? parseInt(maxUserCodeResult[0].max_code, 10) : 0;
          const maxAirtableCode = maxAirtableCodeResult?.[0]?.max_code ? parseInt(maxAirtableCodeResult[0].max_code, 10) : 0;
          rafflePos = (Math.max(maxUserCode, maxAirtableCode) + 1).toString();
        }
      } catch (error) {
        console.error('Error checking users_airtable:', error);
      }

      existingUser = await this.prisma.user.create({
        data: {
          hcaId,
          email,
          firstName,
          lastName,
          birthday,
          slackUserId,
          verificationStatus,
          role: 'user',
          hackatimeAccount: hackatimeAccount?.toString() || null,
          referralCode,
          rafflePos,
        },
      });

      return { user: existingUser, isNewUser: true };
    }

    const updateData: Record<string, any> = {};
    if (!existingUser.hcaId) {
      updateData.hcaId = hcaId;
    }
    if (referralCode && !existingUser.referralCode) {
      updateData.referralCode = referralCode;
    }
    if (claims.slack_id && !existingUser.slackUserId) {
      updateData.slackUserId = claims.slack_id;
    }
    if (claims.verification_status && existingUser.verificationStatus !== claims.verification_status) {
      updateData.verificationStatus = claims.verification_status;
    }
    if (claims.birthdate && !existingUser.birthday) {
      updateData.birthday = new Date(claims.birthdate);
    }

    if (Object.keys(updateData).length > 0) {
      existingUser = await this.prisma.user.update({
        where: { userId: existingUser.userId },
        data: updateData,
      });
    }

    return { user: existingUser, isNewUser: false };
  }

  async getCurrentUser(sessionId: string) {
    if (!sessionId) {
      throw new UnauthorizedException('Session not found');
    }

    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          include: {
            projects: {
              include: { submissions: true },
            },
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return session.user;
  }

  async logout(sessionId: string) {
    if (sessionId) {
      await this.prisma.userSession.deleteMany({ where: { id: sessionId } });
    }
    return { message: 'Logged out successfully' };
  }

  async getRafflePos(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { rafflePos: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { rafflePos: user.rafflePos };
  }

  async completeOnboarding(userId: number) {
    const user = await this.prisma.user.update({
      where: { userId },
      data: { onboardComplete: true },
    });

    return {
      message: 'Onboarding completed successfully',
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        onboardComplete: user.onboardComplete,
      },
    };
  }

  async getOnboardingStatus(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        onboardComplete: true,
        firstName: true,
        lastName: true,
        birthday: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const defaultBirthday = new Date('2000-01-01');
    const needsBirthday = user.birthday.getTime() === defaultBirthday.getTime();
    const isTemporaryUser = user.firstName === 'Temporary';

    return {
      onboardComplete: user.onboardComplete,
      needsBirthday,
      isTemporaryUser,
      hasPrefilledData: !isTemporaryUser && !needsBirthday,
    };
  }

  async checkHackatimeAccount(email: string): Promise<number | null> {
    const STATS_API_KEY = process.env.STATS_API_KEY;

    if (!STATS_API_KEY) {
      console.warn('STATS_API_KEY not configured, skipping Hackatime lookup');
      return null;
    }

    try {
      const encodedEmail = encodeURIComponent(email);
      const url = `https://hackatime.hackclub.com/api/v1/users/lookup_email/${encodedEmail}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${STATS_API_KEY}` },
      });

      if (!res.ok) {
        if (res.status === 404) return null;
        console.error('Failed to check Hackatime account:', res.status);
        return null;
      }

      const data = await res.json();
      return data.user_id || null;
    } catch (error) {
      console.error('Error checking Hackatime account:', error);
      return null;
    }
  }

  async sendHackatimeLinkOtp(userId: number, email: string) {
    const user = await this.prisma.user.findUnique({ where: { userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const hackatimeAccountId = await this.checkHackatimeAccount(email);

    if (!hackatimeAccountId) {
      throw new BadRequestException('No Hackatime account found with this email');
    }

    const linkedUser = await this.prisma.user.findFirst({
      where: { hackatimeAccount: hackatimeAccountId.toString(), NOT: { userId } },
      select: { userId: true },
    });

    if (linkedUser) {
      throw new BadRequestException('This Hackatime account is already linked to another user');
    }

    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MS);

    await this.prisma.hackatimeLinkOtp.deleteMany({ where: { userId } });

    await this.prisma.hackatimeLinkOtp.create({
      data: { userId, email, otpCode: otp, expiresAt },
    });

    const otpEmailHtml = this.mailService.generateOtpEmailHtml(otp);
    await this.mailService.sendImmediateEmail(email, otpEmailHtml, 'Link Your Hackatime Account', {
      type: 'hackatime-link-otp',
    });

    return { message: 'Verification code sent to your email' };
  }

  async verifyHackatimeLinkOtp(userId: number, otp: string) {
    const otpRecord = await this.prisma.hackatimeLinkOtp.findFirst({
      where: { userId, otpCode: otp, expiresAt: { gt: new Date() }, isUsed: false },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    const hackatimeAccount = await this.checkHackatimeAccount(otpRecord.email);

    if (!hackatimeAccount) {
      throw new BadRequestException('No Hackatime account found with this email');
    }

    await this.prisma.user.update({
      where: { userId },
      data: { hackatimeAccount: hackatimeAccount.toString() },
    });

    await this.prisma.hackatimeLinkOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true, usedAt: new Date() },
    });

    return { message: 'Hackatime account linked successfully', hackatimeAccountId: hackatimeAccount };
  }

  private calculateAge(birthday: Date) {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      age -= 1;
    }
    return age;
  }
}
