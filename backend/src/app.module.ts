import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
@Module({
  imports: [
    ConfigModule.forRoot({envFilePath: [".env.local", ".env"]}), 
    UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
