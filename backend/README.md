# RemindME API

Backend REST inicial de RemindME. Está construido con Node.js, Express, TypeScript y MySQL.

## Requisitos

- Node.js 20 o superior
- MySQL 8 o compatible
- npm

## Instalación local

1. Entra a la carpeta `backend`.
2. Instala dependencias: `npm install`.
3. Crea una base de datos ejecutando `database/schema.sql` en MySQL.
4. Copia `.env.example` a `.env` y completa las credenciales locales.
5. Sustituye `JWT_SECRET` por un secreto aleatorio de al menos 32 caracteres. No lo publiques ni lo envíes por chat.
6. Inicia el servidor: `npm run dev`.

La API estará disponible en `http://localhost:4000`.

## Rutas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | /api/v1/health | Público | Estado de API y conexión MySQL |
| POST | /api/v1/auth/register | Público | Crear cuenta |
| POST | /api/v1/auth/login | Público | Iniciar sesión |
| GET | /api/v1/auth/me | JWT | Consultar usuario actual |
| GET | /api/v1/reminders | JWT | Listar recordatorios propios |
| POST | /api/v1/reminders | JWT | Crear recordatorio |
| PATCH | /api/v1/reminders/:id | JWT | Actualizar recordatorio propio |
| DELETE | /api/v1/reminders/:id | JWT | Eliminar recordatorio propio |

Las rutas de recordatorios filtran por el usuario autenticado. Nunca se debe confiar en un user_id enviado por el cliente.

## Ejemplo de registro

```json
{
  "name": "Nombre de usuario",
  "email": "usuario@ejemplo.com",
  "password": "una-clave-segura"
}
```

La respuesta contiene un token JWT y el perfil básico. Para las rutas protegidas envía:
`Authorization: Bearer <token>`.

## Notas de seguridad y despliegue

- No subir el archivo `.env` ni credenciales reales.
- Configurar HTTPS, CORS con el dominio exacto del frontend y secretos fuertes en el proveedor de despliegue.
- Para producción, usar un gestor de secretos, copias de seguridad de MySQL, monitoreo y rotación de JWT.
- El token se entrega como bearer token. Antes de publicar las apps, el frontend debe almacenarlo en un almacenamiento seguro (SecureStore en Android; estrategia segura equivalente en web).
- La recuperación de contraseña por correo, notificaciones push, verificación de correo y gestión de sesiones/dispositivos quedan como siguientes módulos; no están habilitados todavía.
