import {
  ErrorHandlingModule,
  ResponseInterceptor,
  AuthModule,
} from '@kemuko-org/shared-utils';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import dataSource from '@database/datasource';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CourseModule } from './course/course.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return dataSource.options;
      },
      dataSourceFactory: async (options) => {
        const logger = new Logger('Database');
        const dataSource = new DataSource(options);
        try {
          if (!dataSource.isInitialized) {
            await dataSource.initialize();
            logger.log('🚀 Data Source has been initialized!');
          }
          return dataSource;
        } catch (error) {
          logger.error('Error during Data Source initialization', error);
          throw error;
        }
      },
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
export class AppModule {}
