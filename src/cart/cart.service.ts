import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async create(createCartDto: Prisma.CartCreateInput) {
    return await this.prisma.cart.create({
      data: createCartDto,
    });
  }

  async findAll() {
    return await this.prisma.cart.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.cart.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateCartDto: Prisma.CartUpdateInput) {
    return await this.prisma.cart.update({
      where: { id },
      data: updateCartDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.cart.delete({
      where: { id },
    });
  }
}
