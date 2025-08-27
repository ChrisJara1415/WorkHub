import express from "express"
import path from "path"
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import methodOverride from "method-override"
import morgan from "morgan"
import dotenv from "dotenv"
dotenv.config()

const app = express()

// Configuración del motor de plantillas EJS
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Middlewares
app.use(morgan("dev"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride("_method"))

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
  })
})

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`🎨 Frontend ejecutándose en el puerto ${PORT}`)
  console.log(`🌐 Aplicación disponible en: http://localhost:${PORT}`)
})