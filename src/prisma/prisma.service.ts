import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    const adminNome = 'sistematxai';
    const adminSenha = '123456789';
    const adminCargo = 'admin';

    const existing = await this.usuario.findUnique({ where: { nome: adminNome } });
    if (!existing) {
      const hash = await bcrypt.hash(adminSenha, 10);
      await this.usuario.create({ data: { nome: adminNome, senha: hash, cargo: adminCargo } });
    }
  }
}

