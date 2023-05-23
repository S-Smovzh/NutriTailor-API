import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseService } from './mongoose.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongooseService,
    }),
  ],
  controllers: [],
  providers: [MongooseService],
})
export class Mongoose {}
