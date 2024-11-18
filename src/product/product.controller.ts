import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('admin/:adminId')
  create(
    @Body() createProductDto: Prisma.ProductCreateInput,
    @Param('adminId') adminId: string,
  ) {
    return this.productService.create(createProductDto, adminId);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('admin/:adminId/:id')
  update(
    @Param('id') id: string,
    @Param('adminId') adminId: string,
    @Body() updateProductDto: Prisma.ProductUpdateInput,
  ) {
    return this.productService.update(adminId, id, updateProductDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('admin/:adminId/:id')
  remove(@Param('id') id: string, @Param('adminId') adminId: string) {
    return this.productService.remove(id, adminId);
  }
}
