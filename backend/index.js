import exp from "express";
import dotenv from "dotenv";
import usersRouter from './routers/users.router.js'
import morgan from "morgan";

dotenv.config()

const app = exp()
const PORT = process.env.PORT

app.use(exp.json())
app.use(morgan('dev'))
app.use('/clientes', usersRouter)

app.listen(process.env.PORT, () => {
    try {
        console.log(`Servidor escuchando en el puerto ${PORT}`)
        console.log(`Servidor disponible en http://localhost:${PORT}`)
    } catch (error) {
        console.error({message: 'Error al inicializar servidor', error: error.message})
    }
})