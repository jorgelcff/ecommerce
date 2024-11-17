import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: Prisma.OrderCreateInput) {
    return await this.prisma.order.create({
      data: createOrderDto,
    });
  }

  async findAll() {
    return await this.prisma.order.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.order.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateOrderDto: Prisma.OrderUpdateInput) {
    return await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.order.delete({
      where: { id },
    });
  }
}
