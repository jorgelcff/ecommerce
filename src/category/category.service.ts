import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: Prisma.CategoryCreateInput) {
    return await this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return await this.prisma.category.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.category.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateCategoryDto: Prisma.CategoryUpdateInput) {
    return await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.category.delete({
      where: { id },
    });
  }
}
