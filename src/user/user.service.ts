import { Injectable, NotFoundException, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { OrderService } from 'src/order/order.service';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly orderService: OrderService,
  ) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    return await this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateUserDto: Prisma.UserUpdateInput) {
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.user.delete({
      where: { id },
    });
  }

  async getTotalUsers() {
    return await this.prisma.user.count({
      where: {
        role: 'USER',
      },
    });
  }

  @UseGuards(AuthGuard('jwt'))
  async getDashboardData(userID) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userID,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userID} not found`);
    }

    if (user.role !== 'ADMIN') {
      throw new NotFoundException(`User with ID ${userID} is not an admin`);
    }

    const totalUsers = await this.getTotalUsers();
    const totalOrdersCompleted = await this.orderService.ordersCompleted();
    const totalOrdersPending = await this.orderService.ordersPending();
    const totalSales = await this.orderService.ordersValue();

    return {
      dashboard: {
        totalUsers,
        totalOrdersCompleted,
        totalOrdersPending,
        totalSales,
      },
    };
  }
}
