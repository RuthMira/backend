import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty()
  nome!: string;

  @ApiProperty()
  senha!: string;

  @ApiProperty({ enum: ['admin', 'user'] })
  cargo!: string;
}

