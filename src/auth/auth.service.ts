import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client'; // Importe o enum Role
import { UserService } from 'src/user/user.service';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly orderService: OrderService,
  ) {}

  /**
   * Registra um novo usuário no banco de dados
   * @param data Dados do registro (email, senha, etc.)
   * @returns O usuário criado (sem a senha)
   */
  async register(data: {
    email: string;
    name: string;
    password: string;
    telefone: string;
    role: string;
  }) {
    try {
      // Verifica se o email já está em uso
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new ConflictException('Este email já está em uso');
      }

      // Verifica se a senha foi fornecida
      if (!data.password) {
        throw new ConflictException('A senha é obrigatória');
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Cria o usuário
      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
          telefone: data.telefone,
          role: data.role as Role,
        },
      });

      if (user.role == 'USER') {
        await this.prisma.cart.create({
          data: {
            user: {
              connect: { id: user.id },
            },
          },
        });
      }

      const login = this.login(user.email, data.password);

      return login;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Erro ao registrar usuário');
      }
    }
  }

  /**
   * Realiza o login de um usuário existente
   * @param email Email do usuário
   * @param password Senha do usuário
   * @returns O token de acesso JWT
   */
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Cria o payload para o JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    delete user.password; // Remove a senha do retorno

    let dashboard = null;

    if (user.role == 'ADMIN') {
      const totalUsers = await this.userService.getTotalUsers();
      const totalOrdersCompleted = await this.orderService.ordersCompleted();
      const totalOrdersPending = await this.orderService.ordersPending();
      const totalSales = await this.orderService.ordersValue();

      dashboard = {
        totalUsers,
        totalOrdersCompleted,
        totalOrdersPending,
        totalSales,
      };
    }
    return { user: user, access_token: token, dashboard: dashboard };
  }

  /**
   * Recupera um usuário por ID
   * @param id ID do usuário
   * @returns Dados do usuário (sem a senha)
   */
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    delete user.password; // Remove a senha do retorno
    return user;
  }
}
