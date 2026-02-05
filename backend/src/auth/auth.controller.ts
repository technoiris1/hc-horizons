import { Controller, Post, Body, Get, UseGuards, Req, Res, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('api/user/auth')
export class AuthController {
  private readonly SESSION_EXPIRY_MS = 21 * 24 * 60 * 60 * 1000;

  constructor(private authService: AuthService) {}

  @Get('login')
  async getAuthUrl(@Query('referralCode') referralCode?: string) {
    const url = this.authService.getAuthUrl(referralCode);
    return { url };
  }

  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.handleCallback(code, state);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
      path: '/',
      domain: process.env.COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? undefined : 'localhost'),
    };

    res.cookie('sessionId', result.sessionId, {
      ...cookieOptions,
      maxAge: this.SESSION_EXPIRY_MS,
    });

    if (result.isNewUser) {
      res.cookie('email', result.user.email, {
        ...cookieOptions,
        maxAge: 10 * 60 * 1000,
      });
    }

    return result;
  }

  @Get('me')
  @SkipThrottle()
  @UseGuards(AuthGuard)
  async getCurrentUser(@Req() req: Request) {
    return this.authService.getCurrentUser(req.cookies.sessionId);
  }

  @Post('verify-session')
  @UseGuards(AuthGuard)
  async verifySession(@Req() req: Request) {
    const sessionId = req.cookies.sessionId;
    return this.authService.getCurrentUser(sessionId);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = req.cookies.sessionId;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const,
      path: '/',
      domain: process.env.COOKIE_DOMAIN || (process.env.NODE_ENV === 'production' ? undefined : 'localhost'),
    };

    res.clearCookie('sessionId', cookieOptions);
    res.clearCookie('email', cookieOptions);

    return this.authService.logout(sessionId);
  }

  @Post('complete-onboarding')
  @UseGuards(AuthGuard)
  async completeOnboarding(@Req() req: Request) {
    const userId = req.user.userId;
    return this.authService.completeOnboarding(userId);
  }

  @Get('onboarding-status')
  @UseGuards(AuthGuard)
  async getOnboardingStatus(@Req() req: Request) {
    const userId = req.user.userId;
    return this.authService.getOnboardingStatus(userId);
  }

  @Post('hackatime-link/send-otp')
  @UseGuards(AuthGuard)
  async sendHackatimeLinkOtp(@Req() req: Request, @Body() body: { email: string }) {
    const userId = req.user.userId;
    return this.authService.sendHackatimeLinkOtp(userId, body.email);
  }

  @Post('hackatime-link/verify-otp')
  @UseGuards(AuthGuard)
  async verifyHackatimeLinkOtp(@Req() req: Request, @Body() body: { otp: string }) {
    const userId = req.user.userId;
    return this.authService.verifyHackatimeLinkOtp(userId, body.otp);
  }

  @Get('raffle-pos')
  @UseGuards(AuthGuard)
  async getRafflePos(@Req() req: Request) {
    const userId = req.user.userId;
    return this.authService.getRafflePos(userId);
  }
}
