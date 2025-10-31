import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async validateUser(nome: string, senha: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { nome } });
    if (!usuario) return null;
    const ok = await bcrypt.compare(senha, usuario.senha);
    if (!ok) return null;
    return usuario;
  }

  async login(nome: string, senha: string) {
    const usuario = await this.validateUser(nome, senha);
    if (!usuario) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }
    const payload = { sub: usuario.id, cargo: usuario.cargo, nome: usuario.nome };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
