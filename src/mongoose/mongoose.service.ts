import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

@Injectable()
export class MongooseService {
  private readonly mongodbUri: string;
  private readonly mongodbName: string;

  constructor(
    @Inject(ConfigService)
    private readonly config: ConfigService,
  ) {
    this.mongodbUri = this.config.get('mongodbUri');
    this.mongodbName = this.config.get('mongodbName');
  }

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.mongodbUri,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  }
}
