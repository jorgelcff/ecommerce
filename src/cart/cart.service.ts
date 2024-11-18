import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export class CreateCartProductDto {
  productId: string;
  quantity: number;
}
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

  async findByUser(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: {
        userId,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    const orders = await this.prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return { cart, orders };
  }

  async addProductToCart(
    createCartProductDto: CreateCartProductDto,
    userId: string,
  ) {
    const cart = await this.prisma.cart.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart for user with ID ${userId} not found`);
    }

    return await this.prisma.cartProduct.create({
      data: {
        quantity: createCartProductDto.quantity,
        cart: {
          connect: { id: cart.id },
        },
        product: {
          connect: { id: createCartProductDto.productId }, // Use productId diretamente
        },
      },
    });
  }

  async checkout(cartId: string, address: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    const products = cart.products.map((cartProduct) => {
      return {
        product: {
          connect: { id: cartProduct.productId }, // Conecte o produto pelo ID
        },
        quantity: cartProduct.quantity,
        price: cartProduct.product.price, // Inclua o preço do produto aqui
      };
    });

    const total = products.reduce((acc, product) => {
      return acc + product.quantity * product.price;
    }, 0);

    const orderProducts = products.map(({ price, ...rest }) => rest);

    const order = await this.prisma.order.create({
      data: {
        user: {
          connect: { id: cart.userId },
        },
        products: {
          create: orderProducts,
        },
        address: address, // Passe o endereço diretamente como string
        total: total, // Calculate the total amount here
      },
    });

    await this.prisma.cartProduct.deleteMany({
      where: {
        cartId,
      },
    });

    return order;
  }
}
