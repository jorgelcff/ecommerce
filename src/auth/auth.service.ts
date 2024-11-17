import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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
        data: { ...data, password: hashedPassword, telefone: data.telefone },
      });

      delete user.password; // Remove a senha do retorno
      return user;
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
    return { user: user, access_token: token };
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
