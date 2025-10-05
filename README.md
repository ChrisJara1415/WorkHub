<div align="center">
	<img src="frontend/static/img/logo/logotipoWK.svg" alt="WorkHub" height="90"/>
  
	WorkHub
	Plataforma de gestión de ofertas laborales temporales que conecta empleadores con empleados
</div>

---

## 📌 Descripción breve
WorkHub es una aplicación web que conecta empleadores con trabajadores para servicios puntuales. Integra:
- Backend Express (API REST + autenticación + lógica de negocio)
- Frontend Express/EJS (SSR + vistas dinámicas + modales)
- MongoDB (Atlas) con modelos para usuarios, ofertas, postulaciones, contratos y reportes.
- Flujo completo de autenticación y recuperación de contraseña vía correo (Nodemailer).
- Proxy frontend → backend para simplificar consumo desde vistas.
- Pruebas de carga con k6 para endpoints críticos (login y ofertas).

## 🏗️ Arquitectura y separación de responsabilidades

| Capa | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| Backend API | `backend/` | Endpoints REST, autenticación, validaciones, persistencia MongoDB |
| Frontend SSR | `frontend/` | Render de vistas EJS, rutas públicas/protegidas, assets estáticos, modales |
| Modelos | `backend/models/` | Definición de esquemas Mongoose |
| Controladores | `backend/controllers/` | Reglas de negocio y respuestas HTTP |
| Ruteo API | `backend/routers/` | Organización de endpoints por recurso |
| Middlewares | `backend/middlewares/` | API Key, logging, inyección de usuario |
| Configuración | `backend/config/` | DB, mailer, backup, cron |
| Frontend Rutas | `frontend/routes/` | Vistas públicas y paneles autenticados |
| Frontend Controllers | `frontend/controllers/` | Lógica para preparar datos de vistas |
| Frontend Services | `frontend/services/` | Cliente Axios para API (uso interno) |
| Scripts UI | `frontend/static/scripts/` | Comportamiento dinámico (login modal, ofertas, perfil, registro) |
| Vistas | `frontend/views/` | EJS (layout, parciales, páginas) |

Principales principios aplicados:
- Single Responsibility: cada archivo hace una cosa clara.
- No exposición directa de credenciales en cliente.
- Tokens de recuperación de contraseña de un solo uso con TTL.
- Validaciones en backend y feedback inmediato en frontend.
- Uso de eventos y localStorage para hidratar avatar del usuario logueado.

## 📂 Estructura de carpetas (resumen)
```
WorkHub/
├── backend/
│   ├── index.js                
│   ├── config/
│   │   ├── db.js               # Conexión MongoDB Atlas
│   │   ├── mailer.js           # Nodemailer transporter
│   │   └── backup.js           # Tarea mongodump
│   ├── controllers/            # Lógica de negocio
│   ├── models/                 # Esquemas Mongoose
│   ├── routers/                # Rutas agrupadas
│   ├── middlewares/            # API key, logging
│   └── logs/                   # Archivos de log
├── frontend/
│   ├── index.js                # Servidor SSR (EJS) + proxies + auth guard
│   ├── routes/                 # Rutas de vistas (landing, paneles)
│   ├── controllers/            # Controladores de render
│   ├── services/               # Axios client (apiService)
│   ├── static/                 # CSS, JS, imágenes, fuentes
│   ├── views/                  # EJS (pages, partials, layout)
│   └── config/api.js           # Configuración baseURL API
├── tests/                      # Scripts k6 (rendimiento)
├── .env                        # Variables de entorno (local)
└── README.md
```

## 🔐 Autenticación y seguridad
- Login via `/login` (frontend proxy a `/auth/login`).
- JWT firmado con `JWT_SECRET` almacenado en cookie httpOnly (`auth`).
- API protegida por API Key en endpoints de creación/modificación (`x-api-key`).
- Prevención de enumeración de correos en recuperación: respuesta neutra.
- Token de restablecimiento: 32 bytes hex, expira en 15 min, invalidación previa.

## 🔄 Flujo de recuperación de contraseña
1. Usuario abre modal “Olvidaste tu contraseña?”
2. Envía email → `POST /auth/password/forgot`
3. Backend genera token (colección `password_resets`) y envía enlace: `${FRONT_URL}/restablecer?token=...`
4. Usuario visita la página (pendiente implementar UI si se desea ampliar) y envía nueva password → `POST /auth/password/reset`
5. Token se marca como usado y se actualiza `passwordHash` del usuario.

## ⚙️ Variables de entorno (.env)
Ejemplo (ya incluido):
```
# Backend
PORT_BACK=6061
USER_DB=...
PASS_DB=...
NAME_DB=WorkHub
API_KEY=api-key-mas-segura-del-mundo
JWT_SECRET=...
ENABLE_ADMIN_SEED=true
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin12345

# Frontend
PORT_FRONT=6060
BACK_URL=http://localhost:6061/workhubApi
FRONT_URL=http://localhost:6060

# SMTP (recuperación de contraseña)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=clave_de_aplicacion
MAIL_FROM=WorkHub <no-reply@workhub.com>
```

## 🧩 Dependencias (Backend)
| Paquete | Uso |
|---------|-----|
| express | Framework HTTP principal |
| mongoose | ODM para MongoDB |
| jsonwebtoken | Firmar/verificar JWT |
| bcryptjs | Hash de contraseñas |
| nodemailer | Envío de correos (reset password) |
| node-cron | Programar backup periódico |
| morgan | Logging de peticiones |
| dotenv | Carga de variables entorno |
| cors | (Si se habilita) control de orígenes cruzados |

## 🧩 Dependencias (Frontend)
| Paquete | Uso |
|---------|-----|
| express | Servidor SSR + proxies |
| ejs | Motor de plantillas |
| express-ejs-layouts | Soporte de layout compartido |
| axios | Cliente HTTP interno (services) |
| jsonwebtoken | Decodificación mínima si se requiere (no exponer secreto) |
| method-override | Soporte PUT/PATCH/DELETE en formularios |
| cookie-parser | Lectura de cookies (auth) |
| morgan | Logs de desarrollo |
| concurrently | Lanzar frontend + backend juntos en dev |
| nodemon (dev) | Reload automático |

## 🚀 Instalación (desarrollo)
Requisitos: Node 18+, npm, MongoDB Atlas (o local), cuenta SMTP (Gmail con clave de app u otro proveedor).

```bash
git clone https://github.com/ChrisJara1415/WorkHub.git
cd WorkHub

# Instalar dependencias backend y frontend
cd backend && npm install && cd ../frontend && npm install && cd ..

# Crear .env (si no existe) basado en ejemplo mostrado

# Lanzar ambos (desde carpeta frontend usando script dev)
cd frontend
npm run dev
```
Frontend: http://localhost:${PORT_FRONT}  |  Backend API: http://localhost:${PORT_BACK}/workhubApi

## ▶️ Scripts útiles
| Ubicación | Script | Acción |
|----------|--------|--------|
| frontend | `npm run dev` | Inicia frontend + backend en paralelo |
| frontend | `npm start` | Inicia frontend con PM2 (producción, requiere pm2 global) |
| backend  | `npm run dev` | Ejecuta backend con nodemon |
| backend  | `npm start` | Inicia backend con PM2 |

## 🧪 Pruebas de carga (k6)
Instala k6: https://k6.io (binario) 

Archivo ejemplo: `tests/login-offers.test.js`
```javascript
export let options = { vus: 1000, duration: '30s' }
```
Ejecutar (desde raíz):
```bash
k6 run tests/login-offers.test.js
```
Métricas clave: tasa de éxito login, latencia de `/api/ofertas`, errores HTTP.

## 🔁 Backup automático
`node-cron` ejecuta `mongodump` (ver `backend/config/backup.js`). Asegura que `mongodump` esté disponible en PATH. Salida comprimida en `backend/backup/`.

## 🧪 Validaciones destacadas
- Registro: email + teléfono únicos, password policy (mínimo 8, mayúscula, minúscula, dígito).
- Postulaciones: un usuario no puede postularse dos veces a misma oferta; empleador no se postula a su propia oferta.
- Ofertas: normalización de municipio/categoría.

## 🖼️ UI dinámica (ejemplos)
- `modal-login.ejs`: login AJAX + enlace a recuperación.
- `employer.js`: CRUD de ofertas + métricas.
- `employee.js`: Listado y detalles de ofertas + postulaciones.
- `profile.ejs`: Edición inline de perfil + avatar persistido.

## 🔄 Flujo de avatar
Se almacena avatar en localStorage `avatar:<userId>` y se hidrata en navbar y vistas llamando a `hydrateCurrentUserAvatar()` tras cambios.

## 🧷 Endpoints principales (resumen mínimo)
```
POST /auth/register
POST /auth/login
POST /auth/password/forgot
POST /auth/password/reset
GET  /workhubApi/ofertas
POST /workhubApi/ofertas (x-api-key)
PATCH/DELETE /workhubApi/ofertas/:id (x-api-key)
```

## 🛡️ Buenas prácticas usadas
- Respuestas consistentes: `{ success, message, data }`.
- Errores capturados con logging contextual.
- Tokens sensibles nunca expuestos en HTML directo.
- Sanitización básica y normalización de datos de entrada.

## 🚧 Roadmap sugerido
- Página UI para restablecer contraseña (form nueva contraseña).
- Internacionalización (i18n).
- Reemplazar variables inline de estilos por un sistema de design tokens consolidado (parcial ya en `workhub-tokens.css`).
- Tests unitarios (Jest) para controladores críticos.
- Docker Compose (mongo + app).

## 🛠️ Troubleshooting
| Problema | Causa común | Solución |
|----------|-------------|----------|
| No envía correo | SMTP mal configurado | Revisar `.env` y credenciales app password |
| 404 en `/api/ofertas` desde frontend | `BACK_URL` incorrecto | Verificar valor en `.env` frontend |
| `ECONNREFUSED` Mongo | URI mal formado | Revisar usuario, pass y cluster en `.env` |
| k6 no encuentra script | Ruta relativa errónea | Ejecutar desde raíz: `k6 run tests/...` |
| CORS bloqueos (si se habilita SPA) | Falta `cors()` | Agregar middleware en backend |

## 🤝 Contribuciones
1. Fork & branch (`feat/mi-feature`)
2. Mantén estilo consistente.
3. Añade explicación en PR (contexto + Screenshots si UI).
4. Asegura que no rompes flujos de auth ni recuperación.

## 📜 Licencia
Proyecto educativo / interno. Ajusta a la licencia que prefieras (MIT sugerida).

---
