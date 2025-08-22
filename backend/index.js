import exp from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import globalRouter from './routers/globalRoutes.router.js'
dotenv.config()

const app = exp()
const PORT = process.env.PORT

app.use(exp.json())
app.use(morgan('dev'))
app.use(globalRouter)

app.listen(process.env.PORT, () => {
    try {
        console.log(`Servidor escuchando en el puerto ${PORT}`)
        console.log(`Servidor disponible en http://localhost:${PORT}`)
    } catch (error) {
        console.error({message: 'Error al inicializar servidor', error: error.message})
    }
})