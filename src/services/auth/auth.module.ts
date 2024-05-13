import { Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth-guard.service'
import { JwtStrategy } from './jwt.strategy'

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60d' },
      verifyOptions: {
        issuer: process.env.NODE_ENV === 'development' ? 'local' : 'paperplane-api',
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, { provide: APP_GUARD, useClass: JwtAuthGuard }],
  controllers: [],
  exports: [AuthService],
})
export class AuthModule {}
