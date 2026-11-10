# Configuración local de RemindME

Esta guía prepara el entorno local. No contiene contraseñas ni credenciales reales.

## 1. Base de datos MySQL

1. Abre MySQL Workbench o tu cliente MySQL.
2. Ejecuta el archivo `backend/database/schema.sql`.
3. Comprueba que se creó la base de datos `remindme` y las tablas `users`, `categories` y `reminders`.

## 2. Backend

Desde la raíz del repositorio:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edita `backend/.env` y configura DB_USER, DB_PASSWORD, DB_HOST, DB_PORT y un JWT_SECRET aleatorio de al menos 32 caracteres. No publiques ni compartas el archivo .env.

Inicia el servidor:

```powershell
npm run dev
```

La API local escucha por defecto en `http://localhost:4000`. Comprueba `http://localhost:4000/api/v1/health`.

## 3. Frontend Expo

En otra terminal, vuelve a la raíz del proyecto y crea `.env.local`:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Para Android Emulator normalmente se utiliza `http://10.0.2.2:4000/api/v1`. Para un teléfono físico, utiliza la IP local del computador y asegúrate de que ambos estén en la misma red. En web, localhost funciona si el navegador y el backend están en el mismo equipo.

Luego:

```powershell
npm install
npx expo start --web
```

## 4. Importante antes de producción

- `EXPO_PUBLIC_*` es visible en el bundle del cliente: nunca pongas contraseñas ni secretos allí.
- Configura HTTPS y CORS para el dominio real.
- El token JWT no debe guardarse en almacenamiento inseguro para una publicación de producción. La estrategia de sesión debe completarse con almacenamiento seguro nativo y cookies HttpOnly/Secure/SameSite para web, además de expiración y revocación.
- Configura backups de MySQL y monitoreo.
