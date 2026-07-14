# Pequita 💌

Web para que **varios familiares escriban, cada uno, una carta** con motivo del
cumpleaños de alguien especial. Cada familiar entra por un enlace, redacta su
carta (nombre + mensaje + una foto y un estilo opcionales) y la envía. El dueño
la **aprueba** desde un panel privado y, una vez aprobada, aparece en un **álbum
sorpresa** donde la cumpleañera abre cada sobre con una animación.

- **Portada pública** `/` → invita a escribir.
- **Escribir** `/escribir` → formulario sencillo (sin login).
- **Álbum** `/para-ella` → todas las cartas aprobadas, como sobres para abrir.
- **Taller** `/editor` → panel privado (con contraseña) para aprobar/crear/editar.

Stack: Next.js 16 · React 19 · Prisma 7 (SQLite/Turso) · Tailwind v4 · Framer Motion.

---

## Desarrollo local

```bash
npm install
npm run set-password -- "tu-clave-del-taller"   # define la contraseña del /editor
npm run dev                                       # http://localhost:3000
```

> El `set-password` guarda la clave para local **y además imprime** dos valores
> (`EDITOR_PASSWORD_HASH` y `SESSION_SECRET`) que necesitarás para producción.

En local la base de datos es el archivo `dev.db` (SQLite) y las imágenes se
guardan en `public/uploads/`. No se expone nada a la red: el server corre solo en
`localhost`.

**Personaliza el nombre** de la cumpleañera y los textos de portada en
[`lib/site.ts`](lib/site.ts).

---

## Desplegar en Vercel (gratis)

Necesitas 3 cosas: una base de datos **Turso**, un almacén **Vercel Blob** y unas
**variables de entorno**.

### 1. Sube el proyecto a GitHub
```bash
git add -A && git commit -m "Pequita"
git branch -M main && git remote add origin <tu-repo> && git push -u origin main
```

### 2. Base de datos Turso
```bash
# instala la CLI: https://docs.turso.tech/cli/installation
turso auth signup
turso db create pequita
turso db show pequita --url          # → TURSO_DATABASE_URL (libsql://…)
turso db tokens create pequita       # → TURSO_AUTH_TOKEN

# aplica el esquema (Turso es compatible con SQLite):
for f in prisma/migrations/*/migration.sql; do turso db shell pequita < "$f"; done
```

### 3. Almacén de imágenes (Vercel Blob)
En el proyecto de Vercel → **Storage → Create → Blob**. Copia el
`BLOB_READ_WRITE_TOKEN` que te da.

### 4. Variables de entorno en Vercel
Project → Settings → Environment Variables:

| Variable | De dónde sale |
| --- | --- |
| `TURSO_DATABASE_URL` | `turso db show pequita --url` |
| `TURSO_AUTH_TOKEN` | `turso db tokens create pequita` |
| `BLOB_READ_WRITE_TOKEN` | Storage → Blob |
| `SESSION_SECRET` | lo imprime `npm run set-password` (o `openssl rand -hex 48`) |
| `EDITOR_PASSWORD_HASH` | lo imprime `npm run set-password` |
| `NEXT_PUBLIC_BASE_URL` | *(opcional)* tu dominio, ej. `https://pequita.vercel.app` |
| `ALBUM_CODE` | *(opcional)* clave del álbum; si no la pones, se usa la de `lib/site.ts` |

### 5. Deploy
Importa el repo en Vercel y despliega. El `postinstall` genera el cliente Prisma
automáticamente.

### 6. Después del primer deploy
- Abre `/login`, entra al taller con tu clave y comprueba que puedes aprobar.
- Si usas los **QR** de las cartas, regenéralos **desde el dominio de producción**
  (en el editor de cada carta) para que apunten a la URL pública y no a localhost.
- Comparte `/escribir` con la familia y guarda `/para-ella` para el día del
  cumpleaños. 🎂

---

## Notas

- El álbum `/para-ella` está protegido con una **clave** (por defecto `cumple`;
  cámbiala en `lib/site.ts` o con la variable `ALBUM_CODE`). Solo muestra cartas
  ya aprobadas. Comparte el enlace **y la clave** cuando quieras que lo vea.
- Cambiar la contraseña del taller: vuelve a correr `npm run set-password` (local)
  y actualiza `EDITOR_PASSWORD_HASH` en Vercel.
