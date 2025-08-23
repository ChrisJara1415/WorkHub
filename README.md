# WorkHub 🏢

## Descripción del Proyecto

WorkHub es una plataforma web full-stack desarrollada para facilitar la gestión de empleos temporales en el Área Metropolitana del Valle de Aburrá, Colombia. La aplicación conecta empleadores con trabajadores calificados en sectores como limpieza, mantenimiento y oficios varios, proporcionando una experiencia fluida, segura y eficiente para ambas partes.

## ¿Cómo Funciona el Proyecto?

WorkHub opera como un marketplace laboral donde:

- **Empleadores** pueden registrarse, publicar ofertas laborales y gestionar postulaciones
- **Trabajadores** pueden crear perfiles, buscar ofertas y postularse a empleos temporales
- **Administradores** supervisan la plataforma mediante un panel de control con estadísticas y gestión de usuarios

El sistema automatiza el proceso de contratación desde la publicación de ofertas hasta la asignación de contratos, incluyendo validaciones de negocio y notificaciones en tiempo real.

## Arquitectura y Tecnologías

### Stack Tecnológico
- **Runtime**: Node.js
- **Framework Backend**: Express.js
- **Base de Datos**: MongoDB con Mongoose ODM
- **Autenticación**: JSON Web Tokens (JWT)
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **UI Framework**: Bootstrap 5
- **Herramientas de Desarrollo**: Nodemon

### Estructura del Proyecto

```
WorkHub/
├── frontend/
│   ├── views/                 # Vistas HTML (adminPanel, users, index)
│   ├── assets/
│   │   ├── css/              # Estilos personalizados
│   │   ├── js/               # Scripts del cliente
│   │   └── img/              # Recursos gráficos
│   └── api/                  # Conexión con backend
├── backend/
│   ├── controllers/          # Lógica de negocio
│   ├── models/              # Esquemas MongoDB (User, Offer, Contract)
│   ├── routes/              # Endpoints API REST
│   ├── middleware/          # JWT, CORS, validaciones
│   ├── config/              # Configuración de BD
│   ├── server.js            # Punto de entrada
│   └── .env                 # Variables de entorno
├── package.json
└── README.md
```

## Gestión del Proyecto con Node.js

### Instalación de Dependencias

```bash
# Instalar dependencias de producción
npm install express mongoose jsonwebtoken bcryptjs cors dotenv

# Instalar dependencias de desarrollo
npm install --save-dev nodemon
```

### Scripts de Desarrollo

```json
{
  "scripts": {
    "start": "node backend/server.js",
    "dev": "nodemon backend/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### Ejecución del Proyecto

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de Datos MongoDB
DB_USER=tu_usuario_mongodb
PASS=tu_contraseña_mongodb
DB_NAME=WorkHub

# Servidor
PORT=9090

# Autenticación JWT
JWT_SECRET=tu_clave_secreta_jwt

# Configuración adicional (recomendadas)
NODE_ENV=development
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
```

> **Nota**: Asegúrate de agregar `.env` a tu archivo `.gitignore` para mantener seguras las credenciales.

## Objetivos del Proyecto

### Objetivo General
Facilitar el acceso a trabajos temporales mediante un sistema intuitivo, seguro y accesible, que automatice el proceso de contratación, postulación y gestión de usuarios.

### Objetivos Específicos
- ✅ Implementar un sistema de autenticación robusto con roles diferenciados
- ✅ Crear un panel administrativo con estadísticas en tiempo real
- ✅ Desarrollar un módulo CRUD completo para gestión de usuarios
- ✅ Establecer un sistema de postulaciones y contrataciones automatizado
- ✅ Garantizar una experiencia de usuario responsive y accesible

## Funcionalidades Principales

### Módulos Implementados
- 🔐 **Autenticación**: Registro/Login con JWT y validación de roles
- 👥 **Gestión de Usuarios**: CRUD completo con roles (empleador/trabajador)
- 💼 **Ofertas Laborales**: Publicación, edición y eliminación de ofertas
- 📝 **Postulaciones**: Sistema de aplicación y gestión de candidatos
- 🤝 **Contratación**: Asignación y seguimiento de contratos
- 📊 **Panel Administrativo**: Dashboard con métricas y gestión
- 🔔 **Notificaciones**: Sistema de alertas y feedback visual

## Reglas de Negocio

- Un usuario tiene un único rol: empleador o trabajador
- Solo los empleadores pueden publicar ofertas laborales
- Un trabajador no puede aplicar más de una vez a la misma oferta
- No se puede eliminar un usuario con contratos activos
- Una oferta solo puede tener tantas contrataciones como vacantes disponibles

## Métricas y KPIs

- Tiempo promedio para registrar una oferta
- Cantidad de postulaciones por oferta
- Tiempo desde postulación hasta contratación
- Porcentaje de contrataciones exitosas
- Número de usuarios activos por día

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es desarrollado por **CatScript Studio** como proyecto estudiantil.

## Contacto

**Equipo de Desarrollo**: CatScript Studio  
**Proyecto**: WorkHub - Gestión de Empleos Temporales  
**Región**: Área Metropolitana del Valle de Aburrá, Colombia

USER_DB=jaym3gd2431 #db.js
PASS_DB=5312466211aA_ #db.js
NAME_DB=WorkHub #db.js
PORT=3002 #index.js
API_KEY=api-key-mas-segura-del-mundo #api.key.js

---
# WorkHub
