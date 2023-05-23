import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDto } from '../dtos';

const User = createParamDecorator<any, any, UserDto>(
  (data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);

export { User };
