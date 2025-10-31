import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

class LoginDto {
  nome!: string;
  senha!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login com nome e senha' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ schema: { properties: { access_token: { type: 'string' } } } })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.nome, body.senha);
  }
}
