# RemindME

**No olvides lo que importa.**

RemindME es una aplicación de recordatorios personales para Android y web. El proyecto conserva el cliente Expo existente y añade una API REST con Node.js, Express, TypeScript y MySQL.

## Estructura

- `/`: aplicación Expo + React Native + TypeScript.
- `backend/`: API REST, autenticación JWT y acceso a MySQL.
- `backend/database/schema.sql`: esquema inicial de base de datos.
- `docs/`: configuración local y hoja de ruta.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Aplicación | React Native, Expo, TypeScript |
| API | Node.js, Express, TypeScript |
| Base de datos | MySQL |
| Validación API | Zod |
| Autenticación API | bcrypt + JWT |

## Inicio rápido

Consulta [Configuración local](docs/LOCAL_SETUP.md) para preparar MySQL, backend y frontend.

## Estado del proyecto

El cliente original permite gestionar recordatorios locales. El backend inicial incorpora registro, inicio de sesión, consulta del usuario y CRUD de recordatorios protegidos por JWT. La integración completa del cliente, migración de datos locales, sesiones seguras multiplataforma, notificaciones, pruebas y despliegue continúan en desarrollo.

Consulta [la hoja de ruta](docs/ROADMAP.md).

## Seguridad

No publiques archivos `.env`, contraseñas, claves JWT ni credenciales. Los valores `EXPO_PUBLIC_*` son públicos dentro de la aplicación cliente.
