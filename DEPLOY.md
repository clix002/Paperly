# Paperly — Guía de Deploy

## Local (Testing)

Para probar los Dockerfiles localmente:

```bash
# Copiar el archivo de config local
cp .env.local.docker .env

# Levantar servicios (PostgreSQL, API, Web, Nginx)
docker compose up --build

# En otra terminal, ejecutar migrations:
docker compose exec api bun run db:migrate

# Acceder a:
# - Web: http://localhost
# - API GraphQL: http://localhost/graphql
```

Para limpiar después:
```bash
docker compose down -v
```

---

## Production (CubePath)

### 1. En el VPS (primera vez)

SSH al VPS:
```bash
ssh root@TU_IP
```

Instalar Dokploy:
```bash
curl -fsSL https://dokploy.com/install.sh | sh
```

Clona el repo:
```bash
git clone https://github.com/TU_USUARIO/paperly.git
cd paperly
```

### 2. En el panel de Dokploy (http://TU_IP:3000)

1. **Create New Project** → `Paperly`
2. **Add Service** → `Docker Compose`
3. **Repository Settings:**
   - URL: `https://github.com/TU_USUARIO/paperly.git`
   - Branch: `main`
   - Compose File: `docker-compose.yml`
4. **Environment Variables:**
   ```
   POSTGRES_PASSWORD=pon-una-password-fuerte-aqui
   BETTER_AUTH_SECRET=secreto-de-32-caracteres-aleatorio
   API_URL=http://TU_IP
   WEB_URL=http://TU_IP
   ```
5. **Deploy** → Dokploy corre `docker compose up` automáticamente

### 3. Después del primer deploy

Ejecutar migrations:
```bash
ssh root@TU_IP
cd /path/al/paperly  # Dokploy te dice la ruta
docker compose exec api bun run db:migrate
```

---

## Troubleshooting

**NextJS build falla por RAM:**
- Usar gp.micro (4GB) mínimo, no nano

**PostgreSQL no inicia:**
- Revisar: `docker compose logs postgres`

**API y Web no se conectan:**
- Verificar URLs en `.env`: `API_URL` debe ser accesible desde Web container
- Revisar nginx.conf

---

## Variables importantes

- `POSTGRES_PASSWORD` — contraseña de DB (cambiar en prod)
- `BETTER_AUTH_SECRET` — generar con: `openssl rand -base64 32`
- `API_URL` — URL pública de la API (http://IP o http://dominio)
- `WEB_URL` — URL pública del Web (http://IP o http://dominio)
