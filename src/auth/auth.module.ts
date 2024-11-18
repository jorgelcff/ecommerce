import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from 'src/user/user.service';
import { OrderService } from 'src/order/order.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    UserService,
    OrderService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
