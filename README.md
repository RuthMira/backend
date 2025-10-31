## API Backend — NestJS + Prisma (SQLite)

### Rodando
- `npm install`
- `npx prisma migrate deploy` ou `npx prisma db push` (gera `prisma/dev.db`)
- `npm run start:dev`

Env:
- `DATABASE_URL=file:./dev.db`
- `JWT_SECRET` opcional (default `secret`)

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
- Admin inicial é criado automaticamente no db.
- Respostas de erro seguem filtro global: `{ statusCode, message, timestamp }`.
