import {
  ErrorHandlingModule,
  ResponseInterceptor,
  AuthModule,
} from '@kemuko-org/shared-utils';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { CourseModule } from './courses/course.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { dbNames, typeOrmConfig } from '@kemuko-org/db-schemas';
import { InjectDataSource, TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      name: dbNames.USER,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        typeOrmConfig(dbNames.USER, config),
    }),
    TypeOrmModule.forRootAsync({
      name: dbNames.COURSE,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        typeOrmConfig(dbNames.COURSE, config),
    }),
    ErrorHandlingModule.registerGlobal({
      includeStacktrace: process.env.NODE_ENV !== 'production',
      useSnakeCase: true,
    }),
    AuthModule.registerGlobalAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        defaultRoles: configService.get<string[]>('DEFAULT_ROLES', []),
        jwtOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
          issuer: configService.get<string>('JWT_ISSUER'),
          audience: configService.get<string>('JWT_AUDIENCE'),
          algorithms: configService.get<string[]>('JWT_ALGORITHMS', ['HS256']),
        },
      }),
    }),
    CourseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger,
    ConfigService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);
  constructor(
    @InjectDataSource(dbNames.USER) private readonly userDb: DataSource,
    @InjectDataSource(dbNames.COURSE)
    private readonly coursesDb: DataSource,
  ) { }

  onModuleInit() {
    this.logger.log(`✅ USER_DB initialized: ${this.userDb.isInitialized}`);
    this.logger.log(
      `✅ COURSES_DB initialized: ${this.coursesDb.isInitialized}`,
    );
  }
}
