import express from "express"
import expLayouts from "express-ejs-layouts"
import path from "path"
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import methodOverride from "method-override"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
process.loadEnvFile('../.env')
// Rutas
import indexRoutes from "./routes/indexRouter.js"
import adminRoutes from "./routes/globalRoutes.js"

const app = express()

// Configuración del motor de plantillas EJS
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ limit: '8mb' }))
app.use(methodOverride("_method"))
app.use(methodOverride((req) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method
    delete req.body._method
    return method
  }
}))
app.use(morgan("dev"))
app.use(cookieParser())

// Middleware para layouts
app.use(expLayouts)
app.set('layout', 'pages/layout');

// Evitar que el navegador use cache para páginas protegidas y post-login
app.use((req,res,next)=>{
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  next()
})

// Exponer usuario autenticado (si existe) a todas las vistas
app.use(async (req, res, next) => {
  try {
    const token = req.cookies?.auth
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      // Enriquecer con datos del usuario si faltan nombres/apellidos
      let userData = { ...payload }
      if (!userData.nombres || !userData.apellidos) {
        try {
          const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/workhubApi\/?$/, '')
          const resp = await fetch(`${BACK_ORIGIN}/workhubApi/clientes/${payload.sub}`, { headers: { 'x-api-key':'api-key-mas-segura-del-mundo' } })
          const data = await resp.json().catch(() => ({}))
          if (resp.ok && data?.data) {
            userData.nombres = data.data.nombres || userData.nombres
            userData.apellidos = data.data.apellidos || userData.apellidos
          }
        } catch {}
      }
  res.locals.user = userData
  res.locals.isAuthenticated = true
  res.locals.role = userData?.rol
      req.user = userData
    } else {
  res.locals.user = null
  res.locals.isAuthenticated = false
  res.locals.role = null
      req.user = null
    }
  } catch {
    res.locals.user = null
    res.locals.isAuthenticated = false
    res.locals.role = null
    req.user = null
  }
  next()
})

// Archivos estáticos
app.use(express.static(path.join(__dirname, "static")))

// mideleware para manejar rutas del index, usuarios, ofertas, postulaciones
app.use("/", indexRoutes)
// Guard para /admin
function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.auth
    if (!token) return res.status(302).redirect('/')
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload?.rol !== 'admin') return res.status(302).redirect('/')
    next()
  } catch (_) {
    return res.status(302).redirect('/')
  }
}
app.use("/admin", requireAdmin, adminRoutes)

// Login proxy para emitir cookie httpOnly
app.post('/login', async (req, res) => {
  try {
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/workhubApi\/?$/, '')
    const resp = await fetch(`${BACK_ORIGIN}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':'api-key-mas-segura-del-mundo' },
      body: JSON.stringify(req.body)
    })
    const data = await resp.json()
    if (!resp.ok) return res.status(resp.status).json(data)
    // Soporte "Recuérdame": si viene remember=true -> cookie por 30 minutos; si no, cookie de sesión (sin maxAge)
    const cookieOptions = { httpOnly: true, secure: false, sameSite: 'lax' }
    if (req.body?.remember) cookieOptions.maxAge = 30 * 60 * 1000
    res.cookie('auth', data.token, cookieOptions)
    res.json({ success:true, rol: data.rol })
  } catch (e) {
    res.status(500).json({ success:false, message:'Error en login', error:e.message })
  }
})

// Guard simple para API (requiere cookie JWT)
function requireLogin(req, res, next) {
  try {
    if (req.user) return next()
    const token = req.cookies?.auth
    if (!token) return res.status(401).json({ success:false, message:'No autenticado' })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch (e) {
    return res.status(401).json({ success:false, message:'Sesión inválida o expirada' })
  }
}

// Proxys API frontend -> backend para evitar CORS en el navegador
app.get('/api/ofertas', requireLogin, async (req, res) => {
  try {
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/+workhubApi\/?$/, '')
    const url = `${BACK_ORIGIN}/workhubApi/ofertas`;
    const resp = await fetch(url, { headers: { 'x-api-key':'api-key-mas-segura-del-mundo' } })
    const data = await resp.json().catch(() => ({}))
    return res.status(resp.status).json(data)
  } catch (e) {
    return res.status(500).json({ success:false, message:'Error obteniendo ofertas', error: e.message })
  }
})

// Listar postulaciones
app.get('/api/postulaciones', requireLogin, async (req, res) => {
  try {
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/+workhubApi\/?$/, '')
    const url = `${BACK_ORIGIN}/workhubApi/postulaciones`;
    const resp = await fetch(url, { headers: { 'x-api-key':'api-key-mas-segura-del-mundo' } })
    const data = await resp.json().catch(() => ({}))
    return res.status(resp.status).json(data)
  } catch (e) {
    return res.status(500).json({ success:false, message:'Error obteniendo postulaciones', error: e.message })
  }
})

app.post('/api/postulaciones', requireLogin, async (req, res) => {
  try {
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/+workhubApi\/?$/, '')
    const url = `${BACK_ORIGIN}/workhubApi/postulaciones`;
    // Usar el id del token (sub) como idUsuario
    const body = JSON.stringify({
      ...req.body,
      empleado: { idUsuario: req.user?.sub, nombre: `${req.user?.nombres || ''} ${req.user?.apellidos || ''}`.trim() || 'Usuario' }
    })
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type':'application/json', 'x-api-key':'api-key-mas-segura-del-mundo' }, body })
    const data = await resp.json().catch(() => ({}))
    return res.status(resp.status).json(data)
  } catch (e) {
    return res.status(500).json({ success:false, message:'Error creando postulación', error: e.message })
  }
})

app.post('/api/ofertas', requireLogin, async (req, res) => {
  try {
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/+workhubApi\/?$/, '')
    const url = `${BACK_ORIGIN}/workhubApi/ofertas`;
    const payload = {
      ...req.body,
      empleador: {
        idUsuario: req.user?.sub,
        nombre: (`${req.user?.nombres || ''} ${req.user?.apellidos || ''}`).trim() || 'Empleador'
      }
    }
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': 'api-key-mas-segura-del-mundo' }, body: JSON.stringify(payload) })
    const data = await resp.json().catch(() => ({}))
    res.status(resp.status).json(data)
    return
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Error creando oferta', error: e.message })
  }
})

app.put('/api/ofertas/:id', requireLogin, async (req, res) => {
  try {
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/+workhubApi\/?$/, '')
    const url = `${BACK_ORIGIN}/workhubApi/ofertas/${req.params.id}`;
    const resp = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-api-key': 'api-key-mas-segura-del-mundo' }, body: JSON.stringify(req.body) })
    const data = await resp.json().catch(() => ({}))
    return res.status(resp.status).json(data)
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Error actualizando oferta', error: e.message })
  }
})

app.get('/api/ofertas/:id', requireLogin, async (req, res) => {
  try {
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/+workhubApi\/?$/, '')
    const url = `${BACK_ORIGIN}/workhubApi/ofertas/${req.params.id}`;
    const resp = await fetch(url, { headers: { 'x-api-key': 'api-key-mas-segura-del-mundo' } })
    const data = await resp.json().catch(() => ({}))
    return res.status(resp.status).json(data)
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Error obteniendo oferta', error: e.message })
  }
})

// Incrementar visualizaciones de oferta
app.post('/api/ofertas/:id/view', requireLogin, async (req, res) => {
  try {
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/+workhubApi\/?$/, '')
    const url = `${BACK_ORIGIN}/workhubApi/ofertas/${req.params.id}/visualizar`;
    const resp = await fetch(url, { method: 'POST', headers: { 'x-api-key':'api-key-mas-segura-del-mundo' } })
    const data = await resp.json().catch(() => ({}))
    return res.status(resp.status).json(data)
  } catch (e) {
    return res.status(500).json({ success:false, message:'Error incrementando visualizaciones', error: e.message })
  }
})

app.delete('/api/ofertas/:id', requireLogin, async (req, res) => {
  try {
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/+workhubApi\/?$/, '')
    const url = `${BACK_ORIGIN}/workhubApi/ofertas/${req.params.id}`;
    const resp = await fetch(url, { method: 'DELETE', headers: { 'x-api-key':'api-key-mas-segura-del-mundo' } })
    const data = await resp.json().catch(() => ({}))
    return res.status(resp.status).json(data)
  } catch (e) {
    return res.status(500).json({ success:false, message:'Error eliminando oferta', error: e.message })
  }
})

// Actualizar estado de una postulación
app.patch('/api/postulaciones/:id', requireLogin, async (req, res) => {
  try {
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/+workhubApi\/?$/, '')
    const url = `${BACK_ORIGIN}/workhubApi/postulaciones/${req.params.id}`;
    const resp = await fetch(url, { method: 'PATCH', headers: { 'Content-Type':'application/json', 'x-api-key':'api-key-mas-segura-del-mundo' }, body: JSON.stringify(req.body) })
    const data = await resp.json().catch(() => ({}))
    return res.status(resp.status).json(data)
  } catch (e) {
    return res.status(500).json({ success:false, message:'Error actualizando postulación', error: e.message })
  }
})

// Obtener usuario por id (para detalles de postulaciones)
app.get('/api/usuarios/:id', requireLogin, async (req, res) => {
  try {
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/+workhubApi\/?$/, '')
    const url = `${BACK_ORIGIN}/workhubApi/clientes/${req.params.id}`
    const resp = await fetch(url, { headers: { 'x-api-key':'api-key-mas-segura-del-mundo' } })
    const data = await resp.json().catch(() => ({}))
    return res.status(resp.status).json(data)
  } catch (e) {
    return res.status(500).json({ success:false, message:'Error obteniendo usuario', error: e.message })
  }
})

// Actualizar usuario por id (perfil)
app.patch('/api/usuarios/:id', requireLogin, async (req, res) => {
  try {
    // Corregir reemplazo de sufijo /workhubApi para componer BACK_ORIGIN correctamente
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/workhubApi\/?$/, '')
    const url = `${BACK_ORIGIN}/workhubApi/clientes/${req.params.id}`
    const resp = await fetch(url, { method:'PATCH', headers: { 'Content-Type':'application/json', 'x-api-key':'api-key-mas-segura-del-mundo' }, body: JSON.stringify(req.body) })
    const data = await resp.json().catch(()=>({}))
    return res.status(resp.status).json(data)
  } catch (e) {
    return res.status(500).json({ success:false, message:'Error actualizando usuario', error:e.message })
  }
})

// Eliminar usuario por id (perfil)
app.delete('/api/usuarios/:id', requireLogin, async (req, res) => {
  try {
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/workhubApi\/?$/, '')
    const url = `${BACK_ORIGIN}/workhubApi/clientes/${req.params.id}`
    const resp = await fetch(url, { method:'DELETE', headers: { 'x-api-key':'api-key-mas-segura-del-mundo' } })
    const data = await resp.json().catch(()=>({}))
    return res.status(resp.status).json(data)
  } catch (e) {
    return res.status(500).json({ success:false, message:'Error eliminando usuario', error:e.message })
  }
})

// Logout: limpiar cookie y redirigir a landing
app.post('/logout', (req, res) => {
  res.clearCookie('auth', { httpOnly: true, secure: false, sameSite: 'lax' })
  // Soportar fetch/ajax y submits tradicionales
  const acceptsJson = req.headers['accept']?.includes('application/json') || req.headers['content-type']?.includes('application/json')
  if (acceptsJson) return res.json({ success: true })
  return res.redirect('/')
})

// Proxy frontend -> backend para auth/register y auth/check
app.post('/auth/register', async (req, res) => {
  try {
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/workhubApi\/?$/, '')
    const resp = await fetch(`${BACK_ORIGIN}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':'api-key-mas-segura-del-mundo' },
      body: JSON.stringify(req.body)
    })
    const data = await resp.json().catch(() => ({}))
    return res.status(resp.status).json(data)
  } catch (e) {
    return res.status(500).json({ success:false, message:'Error en registro', error: e.message })
  }
})

app.get('/auth/check', async (req, res) => {
  try {
    const BACK_ORIGIN = String(process.env.BACK_URL || '').replace(/\/workhubApi\/?$/, '')
    const url = new URL(`${BACK_ORIGIN}/auth/check`)
    if (req.query.field) url.searchParams.set('field', req.query.field)
    if (req.query.value) url.searchParams.set('value', req.query.value)
    const resp = await fetch(url, { headers: { 'x-api-key':'api-key-mas-segura-del-mundo' } })
    const data = await resp.json().catch(() => ({}))
    return res.status(resp.status).json(data)
  } catch (e) {
    return res.status(500).json({ success:false, message:'Error verificando disponibilidad', error: e.message })
  }
})

// Middleware de manejo de errores 404
app.use((req, res) => {
  res.status(404).render("pages/errors/404", {
    layout: false,
    title: "Página no encontrada",
    error: "La página que buscas no existe",
    activeMenu: ""
  })
})

// Middleware de manejo de errores del servidor (500)
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).render("pages/errors/500", {
    layout: false,
    title: "Error del servidor",
    error: "Algo salió mal en el servidor",
    activeMenu: ""
  })
})

const PORT_FRONT = process.env.PORT_FRONT

app.listen(PORT_FRONT, () => {
  console.log(`🎨 Frontend ejecutándose en el puerto ${PORT_FRONT}`)
  console.log(`🌐 Aplicación disponible en: http://localhost:${PORT_FRONT}`)
})
