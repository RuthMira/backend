import { ApiProperty } from '@nestjs/swagger';

export class CreateProdutoDto {
  @ApiProperty()
  nome!: string;

  @ApiProperty({ type: Number })
  valor!: number;

  @ApiProperty({ type: Number })
  quantidade!: number;
}

