import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProdutoService } from './produto.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@ApiTags('produtos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('produtos')
export class ProdutoController {
  constructor(private readonly service: ProdutoService) {}

  @Post()
  create(@Request() req: any, @Body() body: CreateProdutoDto) {
    return this.service.create(req.user.userId, body);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user.userId, req.user.cargo);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(req.user.userId, req.user.cargo, id);
  }

  @Put(':id')
  update(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProdutoDto,
  ) {
    return this.service.update(req.user.userId, req.user.cargo, id, body);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(req.user.userId, req.user.cargo, id);
  }
}
