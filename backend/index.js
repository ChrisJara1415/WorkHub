import exp from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import globalRouter from './routers/globalRoutes.router.js'
import cors from 'cors'
dotenv.config()

const app = exp()
const PORT = process.env.PORT || 8300

app.use(exp.json())
app.use(morgan('dev'))
app.use('/workhubApi', globalRouter)

// Configuración de CORS para permitir requests del frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  }),
)

app.listen(PORT, () => {
    try {
        console.log(`Servidor escuchando en el puerto ${PORT}`)
        console.log(`Servidor disponible en http://localhost:${PORT}`)
    } catch (error) {
        console.error({message: 'Error al inicializar servidor', error: error.message})
    }
})