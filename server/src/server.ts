import 'dotenv/config';

import { env } from './config/env';
import { buildApp } from './app';

async function main() {
  const app = await buildApp();
  await app.listen({ port: env.PORT, host: env.HOST });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
