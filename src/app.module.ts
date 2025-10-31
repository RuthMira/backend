import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProdutoModule } from './produto/produto.module';
import { UsuarioModule } from './usuario/usuario.module';

@Module({
  imports: [AuthModule, ProdutoModule, UsuarioModule],
})
export class AppModule {}
