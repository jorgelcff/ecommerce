import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'prisma/prisma.service';
import { OrderService } from 'src/order/order.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, OrderService],
})
export class UserModule {}
