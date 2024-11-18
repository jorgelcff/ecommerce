import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: Prisma.OrderCreateInput) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: Prisma.OrderUpdateInput,
  ) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }

  @Get('admin/:adminId')
  findByAdmin(@Param('adminId') adminId: string) {
    return this.orderService.findByAdmin(adminId);
  }

  @Delete('admin/:adminId/:orderId')
  deleteByAdmin(
    @Param('adminId') adminId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.orderService.deleteByAdmin(adminId, orderId);
  }

  @Put('admin/:adminId/:orderId')
  updateByAdmin(
    @Param('adminId') adminId: string,
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: Prisma.OrderUpdateInput,
  ) {
    return this.orderService.updateByAdmin(adminId, orderId, updateOrderDto);
  }

  @Put('admin/:adminId/:orderId/status')
  updateByAdminStatus(
    @Param('adminId') adminId: string,
    @Param('orderId') orderId: string,
    @Body('status') status: 'PENDING' | 'COMPLETED' | 'CANCELED',
  ) {
    return this.orderService.updateByAdminStatus(adminId, orderId, status);
  }
}
