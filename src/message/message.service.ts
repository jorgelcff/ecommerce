import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async create(createMessageDto: Prisma.MessageCreateInput) {
    return await this.prisma.message.create({
      data: createMessageDto,
    });
  }

  async findAll() {
    return await this.prisma.message.findMany();
  }

  async findOne(id: string) {
    return await this.prisma.message.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateMessageDto: Prisma.MessageUpdateInput) {
    return await this.prisma.message.update({
      where: { id },
      data: updateMessageDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.message.delete({
      where: { id },
    });
  }
}
