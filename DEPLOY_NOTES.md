# Notas de deploy — CubePath

## Problemas encontrados y soluciones

### 1. API se cerraba inmediatamente al iniciar
`export default { port, fetch }` en Bun solo arranca el servidor si es el entry point directo.
Al importarse desde `start.ts`, el proceso terminaba sin error.
**Fix:** Usar `Bun.serve({ port, fetch })` explícito en `index.ts`.

### 2. Docker cacheaba la imagen del web y no aplicaba cambios
Dokploy usaba layers cacheados aunque el código cambiara.
**Fix:** Desde el VPS: `docker compose build --no-cache web`

### 3. Cookies con flag `Secure` ignoradas en HTTP
Better Auth genera cookies con prefijo `__Secure-` y flag `Secure` cuando `baseURL` usa `https://`.
El browser **ignora cookies `Secure` en sitios `http://`** sin mostrar ningún error.
**Fix:** `advanced: { useSecureCookies: false }` en la config de Better Auth del API.

### 4. CORS bloqueaba requests
`FRONTEND_URL` tenía `https://` pero el browser hacía requests desde `http://`.
**Fix:** Incluir ambas variantes en `trustedOrigins`:
```ts
trustedOrigins: [env.FRONTEND_URL, env.FRONTEND_URL.replace("https://", "http://")]
```

### 5. Proxy Next.js → API fallaba con error SSL
El rewrite de Next.js intentaba hacer proxy a `https://api.traefik.me` desde dentro del contenedor,
pero el certificado no era verificable internamente.
**Fix:** Usar nombre de servicio Docker como destino del proxy:
```ts
// next.config.ts
const apiUrl = process.env.INTERNAL_API_URL ?? "http://api:4000"
```
Y en `docker-compose.yml`:
```yaml
web:
  environment:
    INTERNAL_API_URL: http://api:4000
```

### 6. traefik.me no soporta HTTPS
traefik.me es un servicio HTTP público. El toggle HTTPS en Dokploy no tiene efecto.
Para HTTPS real se necesita un dominio propio con Let's Encrypt.

### 7. Conflicto de puertos al redesplegar manualmente
Al levantar contenedores manualmente con `docker compose up` desde el VPS,
estos conflictan con los que Dokploy gestiona al hacer Deploy.
**Fix:** Parar los contenedores de Dokploy antes: `docker stop paperly-hygw0m-web-1`

### 8. `NEXT_PUBLIC_*` se bake en build time
Las variables `NEXT_PUBLIC_*` en Next.js se inyectan durante el build, no en runtime.
Cambiarlas en Dokploy sin rebuildar no tiene efecto.
**Fix:** Siempre redesplegar (rebuild) al cambiar `NEXT_PUBLIC_API_URL`.

## Arquitectura de red en producción

```
Browser → http://web.traefik.me → Next.js (port 3001)
                                     ↓ rewrite /api/*
                                   http://api:4000 (red Docker interna)
                                     ↓
                                   PostgreSQL (port 5432)
```
