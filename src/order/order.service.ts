import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async findByAdmin(adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: adminId,
      },
    });

    if (!user) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(`User with ID ${adminId} is not an admin`);
    }

    return await this.prisma.order.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            telefone: true,
          },
        },
      },
    });
  }

  async deleteByAdmin(adminId: string, orderId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: adminId,
      },
    });

    if (!user) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(`User with ID ${adminId} is not an admin`);
    }

    return await this.prisma.order.delete({
      where: { id: orderId },
    });
  }

  async updateByAdmin(
    adminId: string,
    orderId: string,
    updateOrderDto: Prisma.OrderUpdateInput,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: adminId,
      },
    });

    if (!user) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(`User with ID ${adminId} is not an admin`);
    }

    return await this.prisma.order.update({
      where: { id: orderId },
      data: updateOrderDto,
    });
  }

  async updateByAdminStatus(
    adminId: string,
    orderId: string,
    status: 'PENDING' | 'COMPLETED' | 'CANCELED', // Use o tipo de enum diretamente
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: adminId,
      },
    });

    if (!user) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(`User with ID ${adminId} is not an admin`);
    }

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: status,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
    if (status === 'COMPLETED') {
      for (const orderProduct of order.products) {
        console.log(orderProduct);
        await this.prisma.product.update({
          where: { id: orderProduct.productId },
          data: {
            stock: {
              decrement: orderProduct.quantity,
            },
          },
        });
      }
    }

    return order;
  }
}
