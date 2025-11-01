import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutoService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: CreateProdutoDto) {
    return this.prisma.produto.create({
      data: { ...data, usuarioId: userId },
    });
  }

  async findAll(userId: number, cargo: string) {
    if (cargo === 'admin') {
      return this.prisma.produto.findMany();
    }
    return this.prisma.produto.findMany({ where: { usuarioId: userId } });
  }

  async findOne(userId: number, cargo: string, id: number) {
    const prod = await this.prisma.produto.findUnique({ where: { id } });
    if (!prod) throw new NotFoundException('Produto não encontrado');
    if (cargo !== 'admin' && prod.usuarioId !== userId)
      throw new ForbiddenException('Sem acesso a este produto');
    return prod;
  }

  async update(userId: number, cargo: string, id: number, data: UpdateProdutoDto) {
    const prod = await this.prisma.produto.findUnique({ where: { id } });
    if (!prod) throw new NotFoundException('Produto não encontrado');
    if (cargo !== 'admin' && prod.usuarioId !== userId)
      throw new ForbiddenException('Sem acesso a este produto');
    return this.prisma.produto.update({ where: { id }, data });
  }

  async remove(userId: number, cargo: string, id: number) {
    const prod = await this.prisma.produto.findUnique({ where: { id } });
    if (!prod) throw new NotFoundException('Produto não encontrado');
    if (cargo !== 'admin' && prod.usuarioId !== userId)
      throw new ForbiddenException('Sem acesso a este produto');
    await this.prisma.produto.delete({ where: { id } });
    return { deleted: true };
  }
}
