import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: Prisma.ProductCreateInput, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!user) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(`User with ID ${adminId} is not an admin`);
    }

    return await this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(categoriaId?: string) {
    if (categoriaId) {
      return await this.prisma.product.findMany({
        where: {
          categoryId: categoriaId,
        },
      });
    }
    return await this.prisma.product.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.product.findUnique({
      where: { id },
    });
  }

  async update(
    adminId: string,
    id: string,
    updateProductDto: Prisma.ProductUpdateInput,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: adminId },
    });
    if (!user) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(`User with ID ${adminId} is not an admin`);
    }
    return await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: adminId },
    });
    if (!user) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException(`User with ID ${adminId} is not an admin`);
    }

    return await this.prisma.product.delete({
      where: { id },
    });
  }
}
