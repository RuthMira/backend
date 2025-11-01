## API Backend — NestJS + Prisma (MySQL)

### Subir com Docker + MySQL
- Requisitos: Docker Desktop

Passo a passo
- Copie `.env.example` para `.env` e ajuste valores se necessario.
  - `DATABASE_URL=`
  - `SHADOW_DATABASE_URL=`
  - `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_PORT`
- Suba o MySQL: `npm run db:up`
  - Verifique saúde: `npm run db:ps` (status healthy) ou `npm run db:logs`
- Criar tabelas (sem migrações):
  - Recomendada: `npm run prisma:push` (ou `npx prisma db push`)
- Verificar tabelas no MySQL:
  - `docker exec -it prova_mysql mysql -uprova -pdevpass -e "SHOW TABLES" prova`
- Opcional (usar migrações com shadow DB):
  - Desenvolvimento: `npm run migrate:dev` (requer `SHADOW_DATABASE_URL` com usuário root)
- Iniciar API: `npm run start:dev`

Admin inicial
- O admin é criado automaticamente quando a API sobe (não na migration).
- Credenciais padrão: nome `sistematxai`, senha `123456789`.

Utilidades e segurança
- Compose lê credenciais do `.env` (não há senhas dentro do `docker-compose.yml`).

### Autenticação
- POST `auth/login` — body: `{ "nome": string, "senha": string }`
- retorna `{ access_token }`

### Swagger (Docs)

- Acesse: `http://localhost:3000/docs`
- Clique em “Authorize” e cole `Bearer <access_token>`
- Use “Try it out” para testar cada rota:
  - Auth: `POST /auth/login`
  - Usuários (admin): `GET/POST/PUT/DELETE /usuarios`
  - Produtos (user): `GET/POST/PUT/DELETE /produtos`

### Testes (Jest e2e)

- Rodar: `npm run test:e2e`
- O arquivo `test/app.e2e-spec.ts` cobre:
  - Login válido e inválido
  - CRUD de usuários (apenas admin)
  - CRUD de produtos (somente do usuário autenticado)
  - Regras de permissão (401/403/404)

### Usuários (somente ADMIN)
Headers: `Authorization: Bearer <token>`
- GET `usuarios`
- GET `usuarios/:id`
- POST `usuarios` — `{ nome, senha, cargo }`
- PUT `usuarios/:id` — `{ nome?, senha?, cargo? }`
- DELETE `usuarios/:id`

### Produtos (do usuário autenticado)
Headers: `Authorization: Bearer <token>`
- GET `produtos` — lista apenas seus produtos
- GET `produtos/:id` — somente se for seu
- POST `produtos` — `{ nome, valor, quantidade }`
- PUT `produtos/:id` — `{ nome?, valor?, quantidade? }`
- DELETE `produtos/:id`

Notas:
- Respostas de erro seguem filtro global: `{ statusCode, message, timestamp }`.
