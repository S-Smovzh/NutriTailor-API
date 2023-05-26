import { Body, Controller, Delete, Get, Inject, Logger, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService, UserWithToken } from './user.service';
import { UserEndpoints } from './endpoints.enum';
import { UserCrudService } from '../../cruds';
import { SignUpDto, UserDto, SignInDto, UpdateProfileDataDto, ResetPasswordDto } from '../../dtos';
import { User as UserSchema } from '../../schemas';
import { Controllers } from '../../enums';
import { User } from '../../decorators';

@ApiTags(Controllers.USER, 'apiName#user')
@Controller(Controllers.USER)
export class UserController {
  constructor(
    @Inject(Logger)
    private readonly logger: Logger,
    @Inject(UserCrudService)
    private readonly userCrudService: UserCrudService,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  @Post(UserEndpoints.POST_REGISTER)
  public async register(@Body() signUpDto: SignUpDto): Promise<void> {
    return await this.userService.register(signUpDto);
  }

  @Post(UserEndpoints.POST_LOGIN)
  public async login(@Body() userLoginDto: SignInDto): Promise<UserWithToken> {
    return await this.userService.login(userLoginDto);
  }

  @Delete(UserEndpoints.DELETE_USER)
  public delete(@User() user: UserSchema): Promise<UserDto> {
    return this.userCrudService.delete(user._id);
  }

  @Patch(UserEndpoints.PATCH_UPDATE)
  public async update(@User() { _id }: UserSchema, @Body() body: UpdateProfileDataDto): Promise<UserDto> {
    return await this.userCrudService.update(_id, body);
  }

  @Patch(UserEndpoints.PATCH_RESET_PASSWORD)
  public resetPassword(@Body() { email }: { email: UserSchema['email'] }): Promise<void> {
    return this.userService.resetPassword(email);
  }

  @Patch(UserEndpoints.PATCH_ACTIVATE_ACCOUNT)
  public activateAccount(
    @Query('activationToken') activationToken: string,
    @Query('isEmailVerification') isEmailVerification: 'true' | 'false',
  ): Promise<{ success: boolean }> {
    return this.userService.activateAccount(activationToken, isEmailVerification === 'true');
  }

  @Patch(UserEndpoints.PATCH_UPDATE_PASSWORD)
  public updateAccountPassword(
    @Param('userId') userId: UserSchema['_id'],
    @Body() updateUserPasswordDto: ResetPasswordDto,
  ): Promise<UserWithToken> {
    return this.userService.updateAccountPassword(userId, updateUserPasswordDto);
  }

  @Get(UserEndpoints.GET_PROFILE_DATA)
  public async get(@User() { _id }: UserSchema): Promise<UserDto> {
    return this.userCrudService.findById(_id);
  }

  @Patch(UserEndpoints.PATCH_UPDATE_PROFILE_DATA)
  public async updateContactData(@User() { _id }: UserSchema, @Body() profileData: Partial<UpdateProfileDataDto>): Promise<UserDto> {
    return this.userCrudService.update(_id, profileData);
  }
}
