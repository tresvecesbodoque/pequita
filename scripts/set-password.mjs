// Fija la contraseña del editor. Uso:
//   npm run set-password -- "tuContraseñaSecreta"
//
// Guarda el hash bcrypt en pequita-secrets.json (gitignored), generando
// también el secreto de sesión si aún no existe.

import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const password = process.argv[2];
if (!password || password.length < 4) {
  console.error("\n❌ Debes pasar una contraseña de al menos 4 caracteres:\n");
  console.error('   npm run set-password -- "tuClaveSecreta"\n');
  process.exit(1);
}

const SECRETS_PATH = join(process.cwd(), "pequita-secrets.json");

let secrets = {};
if (existsSync(SECRETS_PATH)) {
  try {
    secrets = JSON.parse(readFileSync(SECRETS_PATH, "utf8"));
  } catch {
    secrets = {};
  }
}

if (!secrets.sessionSecret) {
  secrets.sessionSecret = randomBytes(48).toString("hex");
}
secrets.passwordHash = bcrypt.hashSync(password, 10);

writeFileSync(SECRETS_PATH, JSON.stringify(secrets, null, 2) + "\n", "utf8");

console.log("\n✅ Contraseña del editor actualizada (guardada en pequita-secrets.json para desarrollo).");
console.log("   Ya puedes entrar en /login con esa clave en local.\n");
console.log("──────────────────────────────────────────────────────────────");
console.log("👉 Para PRODUCCIÓN (Vercel), añade estas dos variables de entorno:\n");
console.log(`   EDITOR_PASSWORD_HASH=${secrets.passwordHash}`);
console.log(`   SESSION_SECRET=${secrets.sessionSecret}`);
console.log("\n   (Project → Settings → Environment Variables)");
console.log("──────────────────────────────────────────────────────────────\n");
