import express from "express"
import expLayouts from "express-ejs-layouts"
import path from "path"
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import methodOverride from "method-override"
import morgan from "morgan"
process.loadEnvFile('../.env')

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

// Middleware para layouts
app.use(expLayouts)
app.set('layout', 'pages/layout');

// Archivos estáticos
app.use(express.static(path.join(__dirname, "static")))

// Rutas
import indexRoutes from "./routes/indexRouter.js"
import adminRoutes from "./routes/globalRoutes.js"

// mideleware para manejar rutas del index, usuarios, ofertas, postulaciones

app.use("/", indexRoutes)
app.use("/admin", adminRoutes)

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