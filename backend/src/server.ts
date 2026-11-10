import app from './app';
import { env } from './config/env';
import { pool } from './config/database';

const server = app.listen(env.PORT, () => {
  console.log(`RemindME API escuchando en http://localhost:${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`\n${signal}: cerrando servidor...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));