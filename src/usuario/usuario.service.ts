import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

export type CreateUsuarioDto = { nome: string; senha: string; cargo: string };
export type UpdateUsuarioDto = Partial<CreateUsuarioDto>;

@Injectable()
export class UsuarioService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUsuarioDto) {
    const senha = await bcrypt.hash(data.senha, 10);
    return this.prisma.usuario.create({ data: { ...data, senha } });
  }

  async findAll() {
    return this.prisma.usuario.findMany({ select: { id: true, nome: true, cargo: true } });
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({ where: { id }, select: { id: true, nome: true, cargo: true } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: number, data: UpdateUsuarioDto) {
    const exists = await this.prisma.usuario.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Usuário não encontrado');
    const toUpdate: any = { ...data };
    if (data.senha) {
      toUpdate.senha = await bcrypt.hash(data.senha, 10);
    }
    return this.prisma.usuario.update({ where: { id }, data: toUpdate, select: { id: true, nome: true, cargo: true } });
  }

  async remove(id: number) {
    const exists = await this.prisma.usuario.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Usuário não encontrado');
    await this.prisma.usuario.delete({ where: { id } });
    return { deleted: true };
  }
}
