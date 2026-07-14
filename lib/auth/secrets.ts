import "server-only";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Secretos del editor (hash de contraseña + secreto de sesión).
//
// PRODUCCIÓN (Vercel): vienen de variables de entorno
//   - SESSION_SECRET        secreto para firmar la sesión (jose)
//   - EDITOR_PASSWORD_HASH  hash bcrypt de la contraseña del editor
//
// DESARROLLO local: si no hay variables, se usa un archivo JSON gitignored
// (pequita-secrets.json) gestionado por `npm run set-password -- "clave"`.
// El acceso al archivo es 100% defensivo: en un filesystem de solo lectura
// (serverless) nunca lanza, solo cae al valor en memoria.

type Secrets = {
  passwordHash?: string;
  sessionSecret?: string;
};

const SECRETS_PATH = join(process.cwd(), "pequita-secrets.json");

function fileSecrets(): Secrets {
  try {
    if (existsSync(SECRETS_PATH)) {
      return JSON.parse(readFileSync(SECRETS_PATH, "utf8")) as Secrets;
    }
  } catch {
    // ausente o corrupto: se ignora
  }
  return {};
}

function persist(next: Secrets) {
  try {
    writeFileSync(SECRETS_PATH, JSON.stringify(next, null, 2) + "\n", "utf8");
  } catch {
    // fs de solo lectura (serverless): no se persiste
  }
}

// El secreto de sesión se cachea en memoria para que sea ESTABLE dentro de una
// misma instancia (si se regenerara en cada request, ninguna sesión validaría).
let cachedSessionSecret: string | null = null;

export function getSessionSecret(): Uint8Array {
  if (!cachedSessionSecret) {
    const fromEnv = process.env.SESSION_SECRET;
    if (fromEnv && fromEnv.length > 0) {
      cachedSessionSecret = fromEnv;
    } else {
      const file = fileSecrets();
      if (file.sessionSecret) {
        cachedSessionSecret = file.sessionSecret;
      } else {
        // Sin env ni archivo: genera uno e intenta persistirlo (solo dev).
        cachedSessionSecret = randomBytes(48).toString("hex");
        persist({ ...file, sessionSecret: cachedSessionSecret });
      }
    }
  }
  return new TextEncoder().encode(cachedSessionSecret);
}

export function getPasswordHash(): string | undefined {
  return process.env.EDITOR_PASSWORD_HASH || fileSecrets().passwordHash || undefined;
}

export function setPasswordHash(hash: string) {
  const file = fileSecrets();
  persist({
    ...file,
    passwordHash: hash,
    sessionSecret: file.sessionSecret ?? randomBytes(48).toString("hex"),
  });
}

export function hasPassword(): boolean {
  return Boolean(getPasswordHash());
}
