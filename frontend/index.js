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
app.use(express.json())
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
    res.cookie('auth', data.token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 2*60*60*1000 })
    res.json({ success:true, rol: data.rol })
  } catch (e) {
    res.status(500).json({ success:false, message:'Error en login', error:e.message })
  }
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
    title: "Página no encontrada",
    error: "La página que buscas no existe",
    activeMenu: ""
  })
})

// Middleware de manejo de errores del servidor
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).render("pages/errors/500", {
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