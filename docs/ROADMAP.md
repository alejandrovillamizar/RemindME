# RemindME — Plan de desarrollo

## Estado de partida

La aplicación Expo existente permite crear, listar, completar y eliminar recordatorios guardados localmente mediante AsyncStorage. Esta información no se sincroniza entre dispositivos ni cuentas.

## Fases

### Fase 1 — Fundamento del backend
- [x] Estructura Node.js + Express + TypeScript.
- [x] Configuración de MySQL mediante variables de entorno.
- [x] Esquema relacional inicial: usuarios, categorías y recordatorios.
- [x] Registro e inicio de sesión con contraseñas hasheadas y JWT.
- [x] CRUD de recordatorios con autorización por propietario.
- [x] Validación de entradas, Helmet, CORS y rate limiting básico.
- [ ] Instalar dependencias, compilar y probar localmente con MySQL.

### Fase 2 — Integración de aplicaciones
- [ ] Pantallas de registro, inicio y cierre de sesión.
- [ ] Cliente API tipado y manejo de errores.
- [ ] Almacenamiento de sesión seguro para Android y web.
- [ ] Migrar datos locales existentes al backend sin perder recordatorios.
- [ ] Conectar el CRUD de inicio y creación con la API.

### Fase 3 — Funcionalidades
- [ ] Editar recordatorios.
- [ ] Categorías y filtros.
- [ ] Búsqueda, ordenamiento y paginación.
- [ ] Vistas de calendario y próximos vencimientos.
- [ ] Notificaciones locales en Android y notificaciones web cuando aplique.
- [ ] Preferencias de notificación y zona horaria.

### Fase 4 — Cuenta y operación
- [ ] Verificación de correo y recuperación de contraseña con proveedor SMTP.
- [ ] Gestión de perfil y cambio de contraseña.
- [ ] Revocación/rotación de sesiones.
- [ ] Registro de auditoría y políticas de retención.

### Fase 5 — Calidad y publicación
- [ ] Pruebas unitarias e integración (API y frontend).
- [ ] Pruebas de seguridad y autorización multiusuario.
- [ ] CI para lint, typecheck y build.
- [ ] Despliegue de API y MySQL administrado con HTTPS y backups.
- [ ] Configuración de builds Android y publicación web.
- [ ] Documentación de operación y soporte.

## Criterio de finalización

RemindME se considera listo para producción cuando todas las fases aplicables estén implementadas, probadas en Android y web, desplegadas con secretos seguros, backups y monitoreo. El backend inicial no implica que la aplicación ya esté lista para producción.
