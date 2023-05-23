import { BadRequestException, Inject, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { TokenService } from './token.service';
import { UserCrudService } from '../cruds';
import { UserDto } from '../dtos';

interface RequestWithUser extends Request {
  user: UserDto;
}

@Injectable()
class AuthenticationMiddleware implements NestMiddleware {
  constructor(
    @Inject(TokenService)
    private readonly tokenService: TokenService,
    @Inject(UserCrudService)
    private readonly userCrudService: UserCrudService,
  ) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    const accessToken = req.headers?.['access-token'] as string;
    const refreshToken = req.headers?.['refresh-token'] as string;

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException();
    }

    const [tokenType, token] = accessToken.split(' ');

    if (tokenType !== 'Bearer') {
      throw new UnauthorizedException('Only `Bearer` tokens are supported.');
    }

    const { user, errors } = await this.tokenService.decodeAccessToken(token);
    const [_, refreshTokenValue] = refreshToken.split(' ');

    if (errors instanceof TokenExpiredError && refreshTokenValue) {
      const { user: userRefreshed, errors } = await this.tokenService.decodeRefreshToken(refreshTokenValue);

      if (errors || !userRefreshed) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      const userFromDb = await this.userCrudService.findById(userRefreshed._id);

      if (!userFromDb) {
        throw new BadRequestException('Incorrect user details!');
      }

      const { token: newAccessToken, refreshToken: newRefreshToken } = this.tokenService.generateJwt(userFromDb, { _id: userFromDb._id });

      res.setHeader('a-access-token', newAccessToken);
      res.setHeader('a-refresh-token', newRefreshToken);
      req.user = userFromDb;
    } else if (!errors && user) {
      req.user = user as UserDto;
    } else {
      throw new UnauthorizedException('Invalid tokens');
    }

    next();
  }
}

export type { RequestWithUser };
export { AuthenticationMiddleware };
