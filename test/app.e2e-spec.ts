import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpErrorFilter } from '../src/filters/http-exception.filter';

describe('API e2e', () => {
  let app: INestApplication;
  let server: any;
  let adminToken: string;
  let userToken: string;
  let createdUserId: number;
  let createdProductId: number;
  const uniq = Date.now();
  const newUser = { nome: `user_${uniq}`, senha: 'pass123', cargo: 'user' };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpErrorFilter());
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('auth: login admin', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({ nome: 'sistematxai', senha: '123456789' })
      .expect(201);
    expect(res.body.access_token).toBeDefined();
    adminToken = res.body.access_token;
  });

  it('auth: login inválido -> 401', async () => {
    await request(server)
      .post('/auth/login')
      .send({ nome: 'naoexiste', senha: 'errada' })
      .expect(401);
  });

  it('usuarios: criar (admin)', async () => {
    const res = await request(server)
      .post('/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newUser)
      .expect(201);
    expect(res.body.id).toBeDefined();
    createdUserId = res.body.id;
  });

  it('usuarios: listar (admin)', async () => {
    const res = await request(server)
      .get('/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((u: any) => u.nome === newUser.nome)).toBe(true);
  });

  it('usuarios: admin não pode se auto deletar -> 403', async () => {
    const resList = await request(server)
      .get('/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    const admin = resList.body.find((u: any) => u.nome === 'sistematxai');
    expect(admin).toBeDefined();
    await request(server)
      .delete(`/usuarios/${admin.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(403);
  });

  it('usuarios: obter por id (admin)', async () => {
    const res = await request(server)
      .get(`/usuarios/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.id).toBe(createdUserId);
    expect(res.body.nome).toBe(newUser.nome);
  });

  it('usuarios: update (admin)', async () => {
    const res = await request(server)
      .put(`/usuarios/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nome: `${newUser.nome}_upd` })
      .expect(200);
    expect(res.body.id).toBe(createdUserId);
    expect(res.body.nome).toBe(`${newUser.nome}_upd`);
  });

  it('auth: login do novo usuário', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({ nome: `${newUser.nome}_upd`, senha: newUser.senha })
      .expect(201);
    userToken = res.body.access_token;
    expect(userToken).toBeDefined();
  });

  it('produtos: criar (do usuário)', async () => {
    const res = await request(server)
      .post('/produtos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nome: 'Teclado', valor: 199.9, quantidade: 2 })
      .expect(201);
    expect(res.body.id).toBeDefined();
    createdProductId = res.body.id;
  });

  it('produtos: listar (apenas do usuário)', async () => {
    const res = await request(server)
      .get('/produtos')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((p: any) => p.id === createdProductId)).toBe(true);
  });

  it('produtos: obter por id (do usuário)', async () => {
    const res = await request(server)
      .get(`/produtos/${createdProductId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body.id).toBe(createdProductId);
  });

  it('produtos: update (do usuário)', async () => {
    const res = await request(server)
      .put(`/produtos/${createdProductId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ valor: 149.9 })
      .expect(200);
    expect(res.body.valor).toBe(149.9);
  });

  it('produtos: listar (admin vê todos)', async () => {
    const res = await request(server)
      .get('/produtos')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((p: any) => p.id === createdProductId)).toBe(true);
  });

  it('permissão: usuario comum não acessa /usuarios -> 403', async () => {
    await request(server)
      .get('/usuarios')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });

  it('permissão: admin acessa produto de qualquer usuário -> 200', async () => {
    const res = await request(server)
      .get(`/produtos/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.id).toBe(createdProductId);
  });

  it('produtos: delete (do usuário)', async () => {
    const res = await request(server)
      .delete(`/produtos/${createdProductId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(res.body.deleted).toBe(true);
  });

  it('usuarios: delete (admin)', async () => {
    const res = await request(server)
      .delete(`/usuarios/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.deleted).toBe(true);
  });

  it('usuarios: obter deletado -> 404', async () => {
    await request(server)
      .get(`/usuarios/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('auth: login usuário deletado -> 401', async () => {
    await request(server)
      .post('/auth/login')
      .send({ nome: `${newUser.nome}_upd`, senha: newUser.senha })
      .expect(401);
  });

  it('usuarios: sem token -> 401', async () => {
    await request(server).get('/usuarios').expect(401);
  });

  it('produtos: sem token -> 401', async () => {
    await request(server).get('/produtos').expect(401);
  });
});
