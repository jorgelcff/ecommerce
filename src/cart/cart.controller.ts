import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

export class CreateCartProductDto {
  productId: string;
  quantity: number;
}

@UseGuards(AuthGuard('jwt'))
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Body() createCartDto: Prisma.CartCreateInput) {
    return this.cartService.create(createCartDto);
  }

  @Get()
  findAll() {
    return this.cartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cartService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCartDto: Prisma.CartUpdateInput,
  ) {
    return this.cartService.update(id, updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(id);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.cartService.findByUser(userId);
  }

  @Post(':userId/items')
  addProduct(
    @Body() addProductDto: CreateCartProductDto,
    @Param('userId') userId: string,
  ) {
    return this.cartService.addProductToCart(addProductDto, userId);
  }

  @Post(':cartId/checkout')
  checkout(@Param('cartId') cartId: string, @Body() data: { address: string }) {
    return this.cartService.checkout(cartId, data.address);
  }
}
